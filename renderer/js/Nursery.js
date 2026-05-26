// Nursery: módulo del vivero.
// RF-04: catálogo con nombre_cientifico, tipo_planta y nivel_dificultad.
// RF-05: detalle de planta por id_planta.
// RF-06: permite múltiples instancias de la misma planta.

const Nursery = {

  _allPlants:     [],
  _ownedPlantIds: new Map(),  // ✅ Map de conteos: id_planta → cantidad
  _selectedPlant: null,

  async init() {
    await this._loadOwnedPlants()
    await this._loadCatalog()
    this._bindFilters()
  },

  // ✅ Map de conteos — permite múltiples instancias de la misma planta
  async _loadOwnedPlants() {
    const result = await window.gameAPI.getUserPlants()
    if (result.success) {
      this._ownedPlantIds = result.plants.reduce((map, p) => {
        map.set(p.id_planta, (map.get(p.id_planta) || 0) + 1)
        return map
      }, new Map())
    }
  },

  async _loadCatalog() {
    const result = await window.gameAPI.getAllPlants()
    if (!result.success) {
      console.error('Error cargando catálogo:', result.error)
      return
    }
    this._allPlants = result.plants
    this._renderGrid(this._allPlants)
  },

  _renderGrid(plants) {
    const grid = document.getElementById('nursery-grid')
    if (!grid) return

    grid.innerHTML = ''

    if (plants.length === 0) {
      grid.innerHTML = '<p class="nursery-empty">No hay plantas con ese filtro.</p>'
      return
    }

    plants.forEach(plant => grid.appendChild(this._createPlantCard(plant)))
  },

  _createPlantCard(plant) {
    const card = document.createElement('div')
    card.className   = 'plant-card'
    card.dataset.plantId = plant.id_planta

    const difficultyColor = {
      'FÁCIL':   '#66bb6a',
      'MEDIO':   '#ffa726',
      'DIFÍCIL': '#ef5350'
    }
    const lightIcon = {
      'DIRECTA':   '☀️',
      'INDIRECTA': '🌤️',
      'SOMBRA':    '🌫️'
    }
    const tipoConfig = {
      'SUCULENTA':  { icon: '🌵', color: '#80cbc4' },
      'ORNAMENTAL': { icon: '🌸', color: '#ce93d8' },
      'AROMATICA':  { icon: '🌿', color: '#a5d6a7' },
      'FRUTAL':     { icon: '🍋', color: '#fff176' },
      'CACTUS':     { icon: '🌵', color: '#80cbc4' },
      'OTRO':       { icon: '🌱', color: '#b0bec5' }
    }

    const tipo       = tipoConfig[plant.tipo_planta] || tipoConfig['OTRO']
    const ownedCount = this._ownedPlantIds.get(plant.id_planta) || 0  // ✅

    card.innerHTML = `
      <div class="plant-card-image">
        <img
          src="../assets/sprites/plants/${plant.sprite_key}_sana.png"
          alt="${plant.nombre_planta}"
          onerror="this.src='../assets/sprites/plants/placeholder.png'"
        />
        ${ownedCount > 0
          ? `<div class="plant-card-owned-badge">✓ Tienes ${ownedCount}</div>`
          : ''}
      </div>
      <div class="plant-card-info">
        <h3 class="plant-card-name">${plant.nombre_planta}</h3>
        <p class="plant-card-scientific">${plant.nombre_cientifico}</p>
        <div class="plant-card-badges">
          <span class="badge badge-tipo" style="color: ${tipo.color}">
            ${tipo.icon} ${plant.tipo_planta}
          </span>
          <span class="badge" style="color: ${difficultyColor[plant.nivel_dificultad] || '#fff'}">
            ${plant.nivel_dificultad}
          </span>
          <span class="badge">
            ${lightIcon[plant.tipo_luz] || '💡'} ${plant.tipo_luz}
          </span>
          <span class="badge">
            💧 cada ${plant.frecuencia_riego} días
          </span>
        </div>
      </div>
    `

    card.addEventListener('click', () => this._showDetail(plant))
    return card
  },

  _showDetail(plant) {
    this._selectedPlant = plant
    window.dispatchEvent(new CustomEvent('tutorial:plant:selected', {
      detail: { plantId: plant.id_planta }
    }))

    const panel = document.getElementById('nursery-detail')
    if (!panel) return

    const lightIcon = { 'DIRECTA': '☀️', 'INDIRECTA': '🌤️', 'SOMBRA': '🌫️' }
    const podaLabel = {
      'NUNCA':     'No requiere poda',
      'OCASIONAL': 'Poda ocasional',
      'FRECUENTE': 'Poda frecuente'
    }
    const tipoConfig = {
      'SUCULENTA':  { icon: '🌵', color: '#80cbc4' },
      'ORNAMENTAL': { icon: '🌸', color: '#ce93d8' },
      'AROMATICA':  { icon: '🌿', color: '#a5d6a7' },
      'FRUTAL':     { icon: '🍋', color: '#fff176' },
      'CACTUS':     { icon: '🌵', color: '#80cbc4' },
      'OTRO':       { icon: '🌱', color: '#b0bec5' }
    }

    const tipo       = tipoConfig[plant.tipo_planta] || tipoConfig['OTRO']
    const ownedCount = this._ownedPlantIds.get(plant.id_planta) || 0  // ✅

    panel.innerHTML = `
      <div class="detail-image">
        <img
          src="../assets/sprites/plants/${plant.sprite_key}_sana.png"
          alt="${plant.nombre_planta}"
          onerror="this.src='../assets/sprites/plants/placeholder.png'"
        />
      </div>

      <div class="detail-header-block">
        <h2 class="detail-name">${plant.nombre_planta}</h2>
        <p class="detail-scientific-name">${plant.nombre_cientifico}</p>
        <span class="badge badge-tipo" style="color: ${tipo.color}; align-self: flex-start">
          ${tipo.icon} ${plant.tipo_planta}
        </span>
      </div>

      <p class="detail-description">${plant.descripcion}</p>

      <div class="detail-stats">
        <div class="detail-stat">
          <span class="detail-stat-icon">${lightIcon[plant.tipo_luz]}</span>
          <div>
            <span class="detail-stat-label">Luz</span>
            <span class="detail-stat-value">${plant.tipo_luz}</span>
          </div>
        </div>
        <div class="detail-stat">
          <span class="detail-stat-icon">💧</span>
          <div>
            <span class="detail-stat-label">Riego</span>
            <span class="detail-stat-value">Cada ${plant.frecuencia_riego} días</span>
          </div>
        </div>
        <div class="detail-stat">
          <span class="detail-stat-icon">✂️</span>
          <div>
            <span class="detail-stat-label">Poda</span>
            <span class="detail-stat-value">${podaLabel[plant.tipo_poda]}</span>
          </div>
        </div>
        <div class="detail-stat">
          <span class="detail-stat-icon">📊</span>
          <div>
            <span class="detail-stat-label">Dificultad</span>
            <span class="detail-stat-value">${plant.nivel_dificultad}</span>
          </div>
        </div>
      </div>

      <!-- ✅ Botón siempre habilitado — muestra cuántas tiene el jugador -->
      <button class="btn btn-primary btn-full" id="btn-acquire-plant">
        🌱 ${ownedCount > 0 ? `Adquirir otra (tienes ${ownedCount})` : 'Adquirir planta'}
      </button>
      <div class="detail-message" id="detail-message"></div>
    `

    panel.classList.add('open')

    // ✅ Siempre registra el listener — no hay bloqueo por duplicados
    panel.querySelector('#btn-acquire-plant')
      .addEventListener('click', () => this._acquirePlant(plant))
  },

  async _acquirePlant(plant) {
    const btn   = document.getElementById('btn-acquire-plant')
    const msgEl = document.getElementById('detail-message')

    btn.disabled    = true
    btn.textContent = 'Adquiriendo...'

    const result = await window.gameAPI.acquirePlant(plant.id_planta)

    if (result.success) {
      // ✅ Incrementa el conteo local sin recargar todo
      const current = this._ownedPlantIds.get(plant.id_planta) || 0
      this._ownedPlantIds.set(plant.id_planta, current + 1)

      btn.disabled    = false
      btn.textContent = `Adquirir otra (tienes ${current + 1})`
      msgEl.textContent = `${plant.nombre_planta} fue agregada a tu colección.`
      msgEl.className   = 'detail-message success'

      window.dispatchEvent(new CustomEvent('plant:acquired'))
    } else {
      btn.disabled    = false
      const currentCount = this._ownedPlantIds.get(plant.id_planta) || 0
      btn.textContent = currentCount > 0
      ? `Adquirir otra (tienes ${currentCount})`
      : '🌱 Adquirir planta'
      msgEl.textContent = result.error
      msgEl.className   = 'detail-message error'
    }
  },

  _bindFilters() {
    const filterBtns = document.querySelectorAll('.nursery-filter-btn')

    filterBtns.forEach(btn => {
      if (btn.dataset.bound === 'true') return
      btn.dataset.bound = 'true'

      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'))
        btn.classList.add('active')

        const filter   = btn.dataset.filter
        const filtered = filter === 'TODOS'
          ? this._allPlants
          : this._allPlants.filter(p => p.nivel_dificultad === filter)

        this._renderGrid(filtered)
      })
    })

    const closeBtn = document.getElementById('btn-close-detail')
    if (closeBtn && closeBtn.dataset.bound !== 'true') {
      closeBtn.dataset.bound = 'true'
      closeBtn.addEventListener('click', () => {
        document.getElementById('nursery-detail').classList.remove('open')
      })
    }
  }

}

window.Nursery = Nursery
