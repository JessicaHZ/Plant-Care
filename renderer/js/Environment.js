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
      { id: 'jardin-1', x: 66.3, y: 30.4 },
      { id: 'jardin-2', x: 62.2, y: 28.1 },
      { id: 'jardin-3', x: 57.3, y: 24.5 },
      { id: 'jardin-4', x: 53.1, y: 35.2 },
      { id: 'jardin-5', x: 57.3, y: 40.8 },
      { id: 'jardin-6', x: 62.9, y: 46.2 },
      { id: 'jardin-7', x: 19.0, y: 42.9 },
      { id: 'jardin-8', x: 12.8, y: 49.1 },
      { id: 'jardin-9', x: 43.8, y: 69.6 },
      { id: 'jardin-10', x: 63.7, y: 89.8 },
      { id: 'jardin-11', x: 53.5, y: 78.8 },
    ],
    'SALA': [
      { id: 'sala-1', x: 52.8, y: 75.9 },
      { id: 'sala-2', x: 80.8, y: 75.3 },
      { id: 'sala-3', x: 45.3, y: 55.3 },
      { id: 'sala-4', x: 54.2, y: 55.6 },
      { id: 'sala-5', x: 66.1, y: 55.3 },
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
          Observa cómo reacciona con el paso de los días.
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
  // Rojo: seca (0-30%) | Azul: óptima (30-75%) | Naranja: saturada (75%+)
  // Genera barra de humedad con color adaptativo y etiqueta según nivel.
  // Nivel 1-2: etiqueta descriptiva, sin %
  // Nivel 3+:  solo color, sin etiqueta descriptiva ni %
  _getHumidityBarHTML(humedad, playerLevel = 1) {
  const colorClass =
    humedad < 40  ? 'diag-bar-water-low'     :
    humedad <= 75 ? 'diag-bar-water-optimal' :
                    'diag-bar-water-high'

  // ✅ Nivel 1-2: con descripción entre paréntesis
  // ✅ Nivel 3+: solo el nombre, sin paréntesis
  const label = playerLevel <= 2
    ? (humedad < 40  ? '💧 Humedad (baja)'    :
       humedad <= 75 ? '💧 Humedad (óptima)'  :
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
    nutrientes < 30  ? '#ef5350' :
    nutrientes <= 75 ? '#66bb6a' :
                       '#ffa726'

  // ✅ Nivel 1-2: con descripción entre paréntesis
  // ✅ Nivel 3+: solo el nombre, sin paréntesis
  const label = playerLevel <= 2
    ? (nutrientes < 30  ? '🌿 Nutrientes (bajos)'   :
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

  async _openCarePanel(plant) {
    const existing = document.querySelector('.care-panel')
    if (existing) existing.remove()

    if (plant.estado_planta === 'MUERTA') {
      this._openDeadPlantPanel(plant)
      return
    }

    const progressResult = await window.gameAPI.getProgress()
    const playerLevel = progressResult.success ? progressResult.progress.nivel : 1
    // Determina disponibilidad de cada herramienta
    const pruneAvailable = plant.tipo_poda !== 'NUNCA' && plant.requiere_poda_activa === 1
    const pruneUnlocked = playerLevel >= 2
    const nutrientes = plant.nutrientes ?? 50

    const pruneLabel = !pruneUnlocked
      ? '✂️ Podar 🔒 (nivel 2)'
      : pruneAvailable ? '✂️ Podar' : '✂️ Podar (no necesario)'

    const panel = document.createElement('div')
    panel.className = 'care-panel'
    panel.innerHTML = `
      <div class="care-panel-header">
        <h3 class="care-panel-name">${plant.nombre_planta}</h3>
        <button class="btn btn-ghost" id="btn-close-care">✕</button>
      </div>
      <img
        class="care-panel-sprite"
        src="../assets/sprites/plants/${plant.sprite_key}_${plant.estado_planta.toLowerCase()}.png"
        onerror="this.src='../assets/sprites/plants/placeholder.png'"
        alt="${plant.nombre_planta}"
      />
      <div class="care-panel-bars">
  ${this._getHumidityBarHTML(plant.humedad, playerLevel)}
  <div class="diag-bar-row">
    <span class="diag-bar-label">❤️ Salud</span>
    <div class="diag-bar-bg">
      <div class="diag-bar-fill diag-bar-health" style="width:${plant.salud}%"></div>
    </div>
    <span class="diag-bar-val">${plant.salud}%</span>
  </div>
  ${this._getNutrientBarHTML(nutrientes, playerLevel)}
</div>
      <div class="care-panel-actions">
        <button class="btn btn-primary care-action-btn" id="btn-water">
          💧 Regar
        </button>
        <button class="btn btn-secondary care-action-btn" id="btn-fertilize">
          🌿 Abonar
        </button>
        <button class="btn care-action-btn ${pruneAvailable && pruneUnlocked ? 'btn-secondary' : 'btn-ghost'}"
               id="btn-prune" ${pruneAvailable && pruneUnlocked ? '' : 'disabled'}>
          ${pruneLabel}
        </button>
       </div>
       ${plant.ubicacion ? `
        <button class="btn btn-ghost care-action-btn" id="btn-move-plant"
                style="margin-top:0.5rem; width:100%">
          📦 Cambiar de lugar
        </button>
      ` : ''}
    `

    document.getElementById('room-area').appendChild(panel)

    const afterAction = async () => {
      await this._loadUserPlants()
      this._renderCurrentRoom()
      panel.remove()
    }

    panel.querySelector('#btn-close-care').addEventListener('click', () => panel.remove())
    panel.querySelector('#btn-water').addEventListener('click', () => {
      panel.remove()
      CareActions.water(plant, afterAction)
    })
    panel.querySelector('#btn-fertilize').addEventListener('click', () => {
      panel.remove()
      CareActions.fertilize(plant, afterAction)
    })
    if (pruneAvailable && pruneUnlocked) {
      panel.querySelector('#btn-prune').addEventListener('click', () => {
        panel.remove()
        CareActions.prune(plant, afterAction)
      })
    }

    if (plant.ubicacion) {
      panel.querySelector('#btn-move-plant').addEventListener('click', () => {
        panel.remove()
        this._movePlant(plant)
      })
    }
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
  }

}

window.Environment = Environment