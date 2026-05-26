const Environment = {

  _userPlants: [],
  _currentRoom: 'SALA',
  _tickHandler: null,

  _rooms: {
    'SALA': { label: 'Sala', icon: '🛋️', luz: 'INDIRECTA', sprite: 'sala' },
    'JARDÍN': { label: 'Jardín', icon: '🌳', luz: 'DIRECTA', sprite: 'jardin' },
    'DORMITORIO': { label: 'Dormitorio', icon: '🛏️', luz: 'INDIRECTA', sprite: 'dormitorio' }
  },

  // Slots fijos por habitación (coordenadas en % sobre room-area)
  _slots: {
    'JARDÍN': [
      { id: 'jardin-1', x: 70, y: 34.1 },
      { id: 'jardin-2', x: 62.5, y: 25.8 },
      { id: 'jardin-3', x: 43.8, y: 61.6 },
      { id: 'jardin-4', x: 51.1, y: 29.7 },
      { id: 'jardin-5', x: 58.5, y: 39.2 },
      { id: 'jardin-6', x: 65.9, y: 45 },
      { id: 'jardin-7', x: 25.3, y: 45.3 },
      { id: 'jardin-8', x: 16.6, y: 52.7 },
      { id: 'jardin-9', x: 50.9, y: 52.7 },
      { id: 'jardin-10', x: 52.1, y: 72.1 },
      { id: 'jardin-11', x: 59, y: 60.4 },
    ],
    'SALA': [
      { id: 'sala-1', x: 55.5, y: 74.7 },
      { id: 'sala-2', x: 80.8, y: 75.3 },
      { id: 'sala-3', x: 45.9, y: 56.7 },
      { id: 'sala-4', x: 56.5, y: 56.9 },
      { id: 'sala-5', x: 67.8, y: 57 },
      { id: 'sala-6', x: 89.9, y: 94.5 },
    ],
    'DORMITORIO': [
      { id: 'dorm-1', x: 39.0, y: 31.5 },
      { id: 'dorm-2', x: 30.2, y: 59.7 },
      { id: 'dorm-3', x: 93.0, y: 26.7 },
      { id: 'dorm-4', x: 13.6, y: 78.8 },
      { id: 'dorm-5', x: 48.2, y: 21.8 },
    ],
  },

  async init() {
    await this._loadUserPlants()
    this._bindRoomTabs()
    this._bindSimulation()
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
      tab.addEventListener('click', () => {
        document.querySelectorAll('.room-tab').forEach(t => t.classList.remove('active'))
        tab.classList.add('active')
        this._currentRoom = tab.dataset.room
        this._renderCurrentRoom()
      })
    })
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
    const stateColor = {
      'SANA': '#66bb6a',
      'MARCHITA': '#ffa726',
      'ENFERMA': '#ef5350',
      'MUERTA': '#757575'
    }

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
        src="../assets/sprites/plants/${plant.sprite_key}_${plant.estado_planta.toLowerCase()}.png"
        onerror="this.src='../assets/sprites/plants/placeholder.png'"
        alt="${plant.nombre_planta}"
      />
      <div class="room-plant-label">
        <span style="color: ${stateColor[plant.estado_planta]}">●</span>
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
                src="../assets/sprites/plants/${p.sprite_key}_sana.png"
                onerror="this.src='../assets/sprites/plants/placeholder.png'"
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
      overlay.innerHTML = `
        <div class="diagnosis-modal">
          <div class="diagnosis-header">
            <span class="diagnosis-icon">🤔</span>
            <h2 class="diagnosis-title">¿Buena ubicación?</h2>
            <p class="diagnosis-subtitle">
              Vas a colocar <strong>${plantName}</strong> en el
              <strong>${room.label}</strong> (luz ${room.luz})
            </p>
          </div>
          <p style="text-align:center; color: var(--color-text-muted); margin: 1rem 0">
            ¿Crees que esta planta estará bien en este espacio?
          </p>
          <div style="display:flex; gap:1rem; justify-content:center; flex-wrap:wrap">
            <button class="btn btn-primary"   data-answer="yes">✅ Sí, creo que sí</button>
            <button class="btn btn-secondary" data-answer="no">❌ No estoy seguro</button>
            <button class="btn btn-ghost"     data-answer="dunno">🤷 No sé</button>
          </div>
        </div>
      `
      document.body.appendChild(overlay)
      overlay.querySelectorAll('button[data-answer]').forEach(btn => {
        btn.addEventListener('click', () => {
          overlay.remove()
          resolve(btn.dataset.answer)
        })
      })
    })
  },

  _showLocationResult(plantName, room, playerAnswer, actualLight) {
    const lightMessages = {
      'DIRECTA': 'recibe luz solar directa — ideal para plantas que necesitan sol intenso.',
      'INDIRECTA': 'recibe luz indirecta — ideal para la mayoría de plantas de interior.',
      'SOMBRA': 'recibe poca luz — solo para plantas que toleran la sombra.'
    }
    const overlay = document.createElement('div')
    overlay.className = 'diagnosis-overlay'
    overlay.innerHTML = `
      <div class="diagnosis-modal">
        <div class="diagnosis-header">
          <span class="diagnosis-icon">💡</span>
          <h2 class="diagnosis-title">Resultado real</h2>
        </div>
        <p style="text-align:center; color: var(--color-text); margin: 1rem 0; line-height: 1.6">
          El <strong>${room.label}</strong> ${lightMessages[actualLight]}
          <br><br>
          Tu <strong>${plantName}</strong> ha sido colocada aquí.
          Si la luz no coincide con sus necesidades, su salud bajará lentamente
          con el paso de los días simulados.
        </p>
        <button class="btn btn-primary btn-full" id="btn-close-location-result">
          Entendido →
        </button>
      </div>
    `
    document.body.appendChild(overlay)
    overlay.querySelector('#btn-close-location-result')
      .addEventListener('click', () => overlay.remove())
  },

  // Genera barra de humedad con color adaptativo.
  // Rojo: seca | Verde: adecuada | Naranja: saturada.
  // Genera barra de humedad con color adaptativo y etiqueta según nivel.
  // Nivel 1-2: etiqueta descriptiva, sin %
  // Nivel 3+:  solo color, sin etiqueta descriptiva ni %
  _getHumidityBarHTML(humedad, playerLevel = 1) {
    const colorClass =
      humedad < 40 ? 'diag-bar-water-low' :
        humedad <= 75 ? 'diag-bar-water-optimal' :
          'diag-bar-water-high'

    // ✅ Nivel 1-2: con descripción entre paréntesis
    // ✅ Nivel 3+: solo el nombre, sin paréntesis
    const label = playerLevel <= 2
      ? (humedad < 40 ? '💧 Humedad (baja)' :
        humedad <= 75 ? '💧 Humedad (óptima)' :
          '💧 Humedad (saturada)')
      : '💧 Humedad'

    return `
    <div class="diag-bar-row">
      <span class="diag-bar-label">${label}</span>
      <div class="diag-bar-bg">
        <div class="diag-bar-fill ${colorClass}"
             style="width:${humedad}%"></div>
      </div>
    </div>
  `
  },

  _getNutrientBarHTML(nutrientes, playerLevel) {
    const color =
      nutrientes < 30 ? '#ef5350' :
        nutrientes <= 75 ? '#66bb6a' :
          '#ffa726'

    // ✅ Nivel 1-2: con descripción entre paréntesis
    // ✅ Nivel 3+: solo el nombre, sin paréntesis
    const label = playerLevel <= 2
      ? (nutrientes < 30 ? '🌿 Nutrientes (bajos)' :
        nutrientes <= 75 ? '🌿 Nutrientes (óptimos)' :
          '🌿 Nutrientes (exceso)')
      : '🌿 Nutrientes'

    return `
    <div class="diag-bar-row">
      <span class="diag-bar-label">${label}</span>
      <div class="diag-bar-bg">
        <div class="diag-bar-fill"
             style="width:${nutrientes}%; background:${color}">
        </div>
      </div>
    </div>
  `
  },

  _getHealthState(salud) {
    if (salud <= 25) return 'Crítica'
    if (salud <= 50) return 'Delicada'
    if (salud <= 75) return 'Estable'
    return 'Saludable'
  },

  _getHumidityState(humedad) {
    if (humedad < 40) return 'Baja'
    if (humedad <= 75) return 'Optima'
    return 'Saturada'
  },

  _getNutrientState(nutrientes) {
    if (nutrientes < 30) return 'Bajos'
    if (nutrientes <= 75) return 'Optimos'
    return 'Exceso'
  },

  _getCareMeterHTML({ icon, label, value, state, type = 'balanced' }) {
    const safeValue = Math.max(0, Math.min(100, Number(value) || 0))

    return `
    <div class="care-meter-row">
      <span class="care-meter-label">
        <span class="care-meter-icon">${icon}</span>
        ${label}
      </span>
      <div class="care-meter-track care-meter-${type}" aria-label="${label}: ${safeValue}">
        <span class="care-meter-marker" style="left:${safeValue}%"></span>
      </div>
      <span class="care-meter-state">${state}</span>
    </div>
  `
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
    const pruneAvailable = plant.tipo_poda !== 'NUNCA' && plant.requiere_poda_activa === 1
    const pruneUnlocked = playerLevel >= 2
    const nutrientes = plant.nutrientes ?? 50

    const pruneLabel = !pruneUnlocked
      ? '✂️ Podar 🔒 (nivel 2)'
      : pruneAvailable ? '✂️ Podar' : '✂️ No necesita poda'

    const panel = document.createElement('div')
    panel.className = 'care-panel'

    // Función que renderiza el contenido del panel con datos actualizados
    const renderPanelContent = (currentPlant, currentLevel) => {
      const currentNutrientes = currentPlant.nutrientes ?? 50
      const currentPruneAvailable = currentPlant.tipo_poda !== 'NUNCA' &&
        currentPlant.requiere_poda_activa === 1
      const currentPruneLabel = !pruneUnlocked
        ? '✂️ Podar 🔒 (nivel 2)'
        : currentPruneAvailable ? '✂️ Podar' : '✂️ No necesita poda'

      return `
      <div class="care-panel-header">
        <h3 class="care-panel-name">${currentPlant.nombre_planta}</h3>
        <button class="btn btn-ghost" id="btn-close-care">✕</button>
      </div>
      <img
        class="care-panel-sprite"
        src="../assets/sprites/plants/${currentPlant.sprite_key}_${currentPlant.estado_planta.toLowerCase()}.png"
        onerror="this.src='../assets/sprites/plants/placeholder.png'"
        alt="${currentPlant.nombre_planta}"
      />
      <div class="care-panel-bars">
        ${this._getCareMeterHTML({
        icon: '💧',
        label: 'Humedad',
        value: currentPlant.humedad,
        state: currentLevel <= 2 ? this._getHumidityState(currentPlant.humedad) : '',
        type: 'balanced'
      })}
        ${this._getCareMeterHTML({
        icon: '&hearts;',
        label: 'Salud',
        value: currentPlant.salud,
        state: this._getHealthState(currentPlant.salud),
        type: 'health'
      })}
        ${this._getCareMeterHTML({
        icon: '🌿',
        label: 'Nutrientes',
        value: currentNutrientes,
        state: currentLevel <= 2 ? this._getNutrientState(currentNutrientes) : '',
        type: 'balanced'
      })}
      </div>
      <div class="care-panel-actions">
        <button class="btn btn-primary btn-pixel care-action-btn" id="btn-water">
          💧 Regar
        </button>
        <button class="btn btn-secondary btn-pixel care-action-btn" id="btn-fertilize">
          🌿 Abonar
        </button>
        <button class="btn btn-pixel care-action-btn ${currentPruneAvailable && pruneUnlocked ? 'btn-secondary' : 'btn-ghost'}"
                id="btn-prune"
                ${currentPruneAvailable && pruneUnlocked ? '' : 'disabled'}>
          ${currentPruneLabel}
        </button>
      ${currentPlant.ubicacion ? `
        <button class="btn btn-ghost btn-pixel care-action-btn" id="btn-move-plant"
                style="width:100%">
          📦 Cambiar de lugar
        </button>
      ` : ''}
      </div>
    `
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
    panel.innerHTML = `
      <div class="care-panel-header">
        <h3 class="care-panel-name">${plant.nombre_planta}</h3>
        <button class="btn btn-ghost" id="btn-close-care">✕</button>
      </div>
      <img
        class="care-panel-sprite"
        src="../assets/sprites/plants/${plant.sprite_key}_muerta.png"
        onerror="this.src='../assets/sprites/plants/placeholder.png'"
        alt="${plant.nombre_planta}"
        style="opacity:0.5; filter:grayscale(1)"
      />
      <div style="text-align:center; padding:1rem; color:var(--color-text-muted)">
        <p style="font-size:1.1rem; margin-bottom:0.5rem">☠️ Planta muerta</p>
        <p style="font-size:0.85rem; line-height:1.5">
          Esta planta no pudo sobrevivir. Revisa tu historial en la
          revisión semanal para identificar qué salió mal.
        </p>
      </div>
      <button class="btn btn-ghost care-action-btn" id="btn-delete-plant"
              style="width:100%; color:#ef5350; border-color:#ef5350; margin-top:0.5rem">
        🗑️ Retirar planta
      </button>
    `
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

  async _onSimulationTick(results) {
    await this._loadUserPlants()
    this._renderCurrentRoom()
  },

  refreshCurrentRoom() {
    this._renderCurrentRoom()
  }

}

window.Environment = Environment
