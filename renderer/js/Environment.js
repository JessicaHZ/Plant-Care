const Environment = {

  _userPlants: [],
  _currentRoom: 'SALA',
  _tickHandler: null,
  _screenHandler: null,

  _rooms: RoomConfig.rooms,
  _slots: RoomConfig.slots,

  async init() {
    this.closeCarePanel()
    await this._loadUserPlants()
    this._bindRoomTabs()
    this._bindSimulation()
    this._bindScreenChanges()
    this._renderCurrentRoom()

    if (this._tickHandler) {
      window.removeEventListener('simulation:tick', this._tickHandler)
    }
    this._tickHandler = (e) => this._onSimulationTick(e.detail.results)
    window.addEventListener('simulation:tick', this._tickHandler)
  },

  async _loadUserPlants() {
    const result = await window.gameAPI.getUserPlants()
    if (result.success) this._userPlants = result.plants
  },

  _bindRoomTabs() {
    document.querySelectorAll('.room-tab').forEach(tab => {
      if (tab.dataset.bound === 'true') return
      tab.dataset.bound = 'true'

      tab.addEventListener('click', () => {
        this.closeCarePanel()
        document.querySelectorAll('.room-tab').forEach(t => t.classList.remove('active'))
        tab.classList.add('active')
        this._currentRoom = tab.dataset.room
        this._renderCurrentRoom()
      })
    })
  },

  _bindScreenChanges() {
    if (this._screenHandler) return

    this._screenHandler = ({ detail }) => {
      if (detail?.to !== 'environment') {
        this.closeCarePanel()
      }
    }

    window.addEventListener('screen:changed', this._screenHandler)
  },

  closeCarePanel() {
    document.querySelectorAll('.care-panel').forEach(panel => panel.remove())
  },

  _bindSimulation() {
    const advanceBtn = document.getElementById('btn-advance-day')
    if (!advanceBtn) return

    const freshBtn = advanceBtn.cloneNode(true)
    advanceBtn.parentNode.replaceChild(freshBtn, advanceBtn)

    freshBtn.addEventListener('click', async () => {
      if (freshBtn.disabled) return
      freshBtn.disabled = true
      freshBtn.textContent = 'Simulando...'

      await Simulation.advanceDays(1)
      await this._loadUserPlants()
      this._renderCurrentRoom()

      freshBtn.disabled = false
      freshBtn.textContent = '⏩ Avanzar día'
    })
  },

  _renderCurrentRoom() {
    const room = this._rooms[this._currentRoom]
    const roomArea = document.getElementById('room-area')
    if (!roomArea) return

    roomArea.style.backgroundImage =
      `url('../assets/sprites/rooms/${room.sprite}.png')`

    const plantArea = document.getElementById('room-plants')
    if (!plantArea) return
    plantArea.innerHTML = ''

    // Renderiza slots de esta habitación
    this._renderSlots(plantArea)

    // ✅ Ahora — separa plantas con posición de las que no tienen slot asignado
    const plantsWithSlot = this._userPlants.filter(
      p => p.ubicacion === this._currentRoom && p.pos_x && p.pos_y
    )
    const plantsWithoutSlot = this._userPlants.filter(
      p => !p.ubicacion || (p.ubicacion === this._currentRoom && !p.pos_x)
    )

    plantsWithSlot.forEach(plant => {
      this._renderPlantInSlot(plantArea, plant)
    })

    this._renderSidePanel(room, plantsWithoutSlot)
  },

  // Renderiza los slots vacíos de la habitación actual
  _renderSlots(container) {
    const slots = this._slots[this._currentRoom] || []

    slots.forEach(slot => {
      // Verifica si este slot ya está ocupado
      const occupiedPlant = this._userPlants.find(
        p => p.ubicacion === this._currentRoom &&
          parseFloat(p.pos_x) === slot.x &&
          parseFloat(p.pos_y) === slot.y
      )
      if (occupiedPlant) return  // slot ocupado — no renderizar marcador

      const slotEl = document.createElement('div')
      slotEl.className = 'plant-slot'
      slotEl.dataset.slotId = slot.id
      slotEl.dataset.x = slot.x
      slotEl.dataset.y = slot.y
      slotEl.style.left = `${slot.x}%`
      slotEl.style.top = `${slot.y}%`

      window.SlotEditor?.decorateSlot(slotEl, slot)

      // Drag over: resalta el slot
      slotEl.addEventListener('dragover', (e) => {
        e.preventDefault()
        slotEl.classList.add('slot-highlight')
      })

      slotEl.addEventListener('dragleave', () => {
        slotEl.classList.remove('slot-highlight')
      })

      // Drop: coloca la planta en este slot
      slotEl.addEventListener('drop', async (e) => {
        e.preventDefault()
        slotEl.classList.remove('slot-highlight')

        const id_registro = parseInt(e.dataTransfer.getData('id_registro'))
        const plantName = e.dataTransfer.getData('plantName')

        await this._placePlantInSlot(id_registro, plantName, slot)
      })

      container.appendChild(slotEl)
    })
  },

  // Renderiza una planta ya colocada en su posición guardada
  _renderPlantInSlot(container, plant) {
    const wrapper = document.createElement('div')
    wrapper.className = 'room-plant positioned'
    wrapper.dataset.registroId = plant.id_registro

    // Usa pos_x/pos_y si existen, sino centra en la parte inferior
    if (plant.pos_x != null && plant.pos_y != null) {
      wrapper.style.left = `${plant.pos_x}%`
      wrapper.style.top = `${plant.pos_y}%`
    }

    wrapper.innerHTML = `
      <img
        class="room-plant-sprite"
        src="${CareDisplayUtils.getPlantSpritePath(plant.sprite_key, plant.estado_planta)}"
        onerror="this.src='${CareDisplayUtils.plantPlaceholderPath}'"
        alt="${plant.nombre_planta}"
      />
      <div class="room-plant-label">
        <span style="color: ${CareDisplayUtils.getPlantStateColor(plant.estado_planta)}">●</span>
        ${plant.nombre_planta}
      </div>
    `

    wrapper.addEventListener('click', () => this._openCarePanel(plant))
    container.appendChild(wrapper)
  },

  _renderSidePanel(room, unplacedPlants) {
    const panel = document.getElementById('env-side-panel')
    if (!panel) return

    panel.innerHTML = `
      <div class="env-room-info">
        <span class="env-room-icon">${room.icon}</span>
        <div>
          <p class="env-room-name">${room.label}</p>
          <p class="env-room-light">Luz: ${room.luz}</p>
        </div>
      </div>
      <div class="env-unplaced">
        <p class="env-section-label">
          ${unplacedPlants.length > 0
        ? '🌱 Arrastra una planta a un slot:'
        : 'Todas tus plantas están colocadas'}
        </p>
        <div class="unplaced-list" id="unplaced-list">
          ${unplacedPlants.map(p => `
            <div class="unplaced-plant-card"
                 draggable="true"
                 data-registro="${p.id_registro}"
                 data-name="${p.nombre_planta}">
              <img
                src="${CareDisplayUtils.getPlantSpritePath(p.sprite_key)}"
                onerror="this.src='${CareDisplayUtils.plantPlaceholderPath}'"
                alt="${p.nombre_planta}"
              />
              <span>${p.nombre_planta}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `

    // Bind drag start en cada tarjeta de planta sin colocar
    panel.querySelectorAll('.unplaced-plant-card').forEach(card => {
      card.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('id_registro', card.dataset.registro)
        e.dataTransfer.setData('plantName', card.dataset.name)
        card.classList.add('dragging')
      })

      card.addEventListener('dragend', () => {
        card.classList.remove('dragging')
      })
    })
  },

  // Coloca una planta en un slot específico con pregunta proactiva LM2
  async _placePlantInSlot(id_registro, plantName, slot) {
    const room = this._rooms[this._currentRoom]
    const answer = await this._showLocationQuestion(plantName, room)

    const result = await window.gameAPI.placePlant(
      id_registro,
      this._currentRoom,
      slot.x,
      slot.y
    )

    if (result.success) {
      this._showLocationResult(plantName, room, answer, result.lightCondition)
      await this._loadUserPlants()
      this._renderCurrentRoom()
      window.dispatchEvent(new CustomEvent('tutorial:plant:placed', {
        detail: { id_registro, room: this._currentRoom }
      }))
    }
  },

  _showLocationQuestion(plantName, room) {
    return new Promise((resolve) => {
      const overlay = document.createElement('div')
      overlay.className = 'diagnosis-overlay'
      overlay.innerHTML = EnvironmentDisplayUtils.getLocationQuestionHTML(plantName, room)
      document.body.appendChild(overlay)
      overlay.querySelectorAll('button[data-answer]').forEach(btn => {
        btn.addEventListener('click', () => {
          overlay.remove()
          resolve(btn.dataset.answer)
        })
      })
    })
  },

  _showLocationResult(plantName, room, _playerAnswer, actualLight) {
    const overlay = document.createElement('div')
    overlay.className = 'diagnosis-overlay'
    overlay.innerHTML = EnvironmentDisplayUtils.getLocationResultHTML({
      plantName,
      room,
      actualLight
    })
    document.body.appendChild(overlay)
    overlay.querySelector('#btn-close-location-result')
      .addEventListener('click', () => overlay.remove())
  },

  async _openCarePanel(plant) {
    window.dispatchEvent(new CustomEvent('tutorial:care-panel:opened', {
      detail: { id_registro: plant.id_registro }
    }))

    const existing = document.querySelector('.care-panel')
    if (existing) existing.remove()

    if (plant.estado_planta === 'MUERTA') {
      this._openDeadPlantPanel(plant)
      return
    }

    const progressResult = await window.gameAPI.getProgress()
    const playerLevel = progressResult.success ? progressResult.progress.nivel : 1
    const pruneUnlocked = playerLevel >= 2

    const panel = document.createElement('div')
    panel.className = 'care-panel'

    const renderPanelContent = (currentPlant, currentLevel) => {
      return CarePanelDisplayUtils.getCarePanelHTML({
        plant: currentPlant,
        playerLevel: currentLevel,
        pruneUnlocked
      })
    }
    // Renderizado inicial
    panel.innerHTML = renderPanelContent(plant, playerLevel)
    document.getElementById('room-area').appendChild(panel)

    // ✅ Callback para regar y abonar — actualiza el panel SIN cerrarlo
    const afterCareAction = async () => {
      await this._loadUserPlants()

      // Busca la planta actualizada por id_registro
      const updatedPlant = this._userPlants.find(
        p => p.id_registro === plant.id_registro
      )
      if (!updatedPlant) {
        panel.remove()
        this._renderCurrentRoom()
        return
      }

      // Actualiza la referencia local y re-renderiza el panel
      plant = updatedPlant
      panel.innerHTML = renderPanelContent(updatedPlant, playerLevel)
      this._renderCurrentRoom()

      // Re-registra los listeners después de actualizar el HTML
      bindListeners()
    }

    // ✅ Callback para poda y mover — cierra el panel como antes
    const afterFinalAction = async () => {
      await this._loadUserPlants()
      this._renderCurrentRoom()
      panel.remove()
    }

    // Función que registra todos los listeners del panel
    // Se llama al inicio y después de cada actualización del HTML
    const bindListeners = () => {
      panel.querySelector('#btn-close-care')
        .addEventListener('click', () => {
          panel.remove()
          this._renderCurrentRoom()
        })

      panel.querySelector('#btn-water')
        .addEventListener('click', () => {
          CareActions.water(plant, afterCareAction)  // ✅ no cierra
        })

      panel.querySelector('#btn-fertilize')
        .addEventListener('click', () => {
          CareActions.fertilize(plant, afterCareAction)  // ✅ no cierra
        })

      const pruneBtn = panel.querySelector('#btn-prune')
      if (pruneBtn && !pruneBtn.disabled) {
        pruneBtn.addEventListener('click', () => {
          panel.remove()
          CareActions.prune(plant, afterFinalAction)  // ✅ cierra
        })
      }

      const moveBtn = panel.querySelector('#btn-move-plant')
      if (moveBtn) {
        moveBtn.addEventListener('click', () => {
          panel.remove()
          this._movePlant(plant)
        })
      }
    }

    // Registro inicial de listeners
    bindListeners()
  },

  _openDeadPlantPanel(plant) {
    const panel = document.createElement('div')
    panel.className = 'care-panel'
    panel.innerHTML = CarePanelDisplayUtils.getDeadPlantPanelHTML(plant)
    document.getElementById('room-area').appendChild(panel)
    panel.querySelector('#btn-close-care').addEventListener('click', () => panel.remove())
    panel.querySelector('#btn-delete-plant').addEventListener('click', async () => {
      const result = await window.gameAPI.deletePlant(plant.id_registro)
      if (result.success) {
        panel.remove()
        await this._loadUserPlants()
        this._renderCurrentRoom()
        window.dispatchEvent(new CustomEvent('plant:acquired'))
      }
    })
  },

  // Quita la planta de su slot y la regresa al panel lateral.
  // Desde ahí el jugador puede colocarla en cualquier habitación.
  async _movePlant(plant) {
    const result = await window.gameAPI.updatePlantLocation(plant.id_registro, null)

    if (result.success) {
      await this._loadUserPlants()
      this._renderCurrentRoom()
    }
  },

  async _onSimulationTick(_results) {
    await this._loadUserPlants()
    this._renderCurrentRoom()
  },

  refreshCurrentRoom() {
    this._renderCurrentRoom()
  }

}

window.Environment = Environment
