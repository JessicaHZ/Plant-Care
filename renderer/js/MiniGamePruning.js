// MiniGamePruning: minijuego modular de poda.
// En esta fase solo se conecta el modo practica; no modifica plantas reales.

const MiniGamePruning = {
  _activeGame: null,

  _practicePlants: [
    {
      nombre_planta: 'Tradescantia',
      sprite_key: 'tradescantia',
      tipo_poda: 'FRECUENTE',
      pruningProfile: 'vine'
    },
    {
      nombre_planta: 'Rosa',
      sprite_key: 'rosa',
      tipo_poda: 'FRECUENTE',
      pruningProfile: 'broad'
    },
    {
      nombre_planta: 'Jazmin',
      sprite_key: 'jazmin',
      tipo_poda: 'FRECUENTE',
      pruningProfile: 'vine'
    },
    {
      nombre_planta: 'Limonero',
      sprite_key: 'limonero',
      tipo_poda: 'FRECUENTE',
      pruningProfile: 'broad'
    }
  ],

  start({ mode = 'practice', plant = null, onFinish = null } = {}) {
    if (this._activeGame) this._activeGame.stop()

    const selectedPlant = plant || this._randomFrom(this._practicePlants)
    const game = new PruningPracticeGame({
      mode,
      plant: selectedPlant,
      onFinish: (result) => {
        this._activeGame = null
        if (onFinish) onFinish(result)
      }
    })

    this._activeGame = game
    game.mount()
  },

  startPractice(onFinish) {
    this.start({
      mode: 'practice',
      plant: this._randomFrom(this._practicePlants),
      onFinish
    })
  },

  _randomFrom(items) {
    return items[Math.floor(Math.random() * items.length)]
  }
}

class PruningPracticeGame {
  static PASSING_ACCURACY = 70

  static PROFILES = {
    broad: { min: 7, max: 10, spread: 0.9 },
    vine:  { min: 8, max: 12, spread: 1.15 },
    strap: { min: 6, max: 9,  spread: 0.75 }
  }

  constructor({ mode, plant, onFinish }) {
    this.mode = mode
    this.plant = plant
    this.onFinish = onFinish
    this.overlay = null
    this.leaves = []
    this.correctCuts = 0
    this.mistakes = 0
    this.decisions = 0
    this.finished = false
  }

  mount() {
    this.leaves = this._createLeaves()
    this.overlay = document.createElement('div')
    this.overlay.id = 'pruning-overlay'
    this.overlay.className = 'minigame-overlay'
    this.overlay.innerHTML = `
      <div class="minigame-container pruning-container">
        <div class="minigame-header">
          <div>
            <h2 class="minigame-title">Poda de precision</h2>
            <p class="minigame-instruction">
              Corta solo las hojas secas o danadas. Conserva las hojas sanas.
            </p>
          </div>
          <div class="minigame-stats">
            <div class="mini-stat">
              <span class="mini-stat-label">Aciertos</span>
              <span class="mini-stat-value" data-ref="correctCuts">0</span>
            </div>
            <div class="mini-stat">
              <span class="mini-stat-label">Errores</span>
              <span class="mini-stat-value" data-ref="mistakes">0</span>
            </div>
          </div>
        </div>

        <div class="pruning-layout">
          <div class="pruning-stage">
            <img
              class="pruning-plant"
              src="${this._plantImage()}"
              onerror="this.src='../assets/sprites/plants/tradescantia_sana.png'"
              alt="${this.plant.nombre_planta || 'Planta de practica'}"
            />
            <svg class="pruning-leaves" viewBox="0 0 360 340" aria-label="Hojas para podar">
              ${this._renderLeaves()}
            </svg>
          </div>

          <aside class="pruning-panel">
            <div class="pruning-plant-card">
              <span class="pruning-card-label">Modo practica</span>
              <strong>${this.plant.nombre_planta || 'Planta de practica'}</strong>
              <p>Esta sesion no afecta tus plantas reales.</p>
            </div>
            <div class="pruning-progress">
              <span>Hojas problematicas</span>
              <strong data-ref="remaining">${this._badLeavesRemaining()}</strong>
            </div>
            <div class="pruning-feedback" data-ref="feedback">
              Observa el color y decide con cuidado.
            </div>
            <button class="btn btn-ghost btn-full" data-action="exit">Salir</button>
          </aside>
        </div>
      </div>
    `

    document.body.appendChild(this.overlay)
    this.overlay.addEventListener('click', (event) => this._handleClick(event))
  }

  stop() {
    this.finished = true
    this.overlay?.remove()
  }

  _handleClick(event) {
    const exitButton = event.target.closest('[data-action="exit"]')
    if (exitButton) {
      this.stop()
      if (this.onFinish) {
        this.onFinish({
          mode: this.mode,
          reason: 'exit',
          passed: false,
          accuracy: 0,
          correctCuts: this.correctCuts,
          mistakes: this.mistakes,
          totalBadLeaves: this.leaves.filter((item) => item.state !== 'sana').length
        })
      }
      return
    }

    const doneButton = event.target.closest('[data-action="done"]')
    if (doneButton) {
      const result = this._lastResult
      this.overlay.remove()
      if (this.onFinish) this.onFinish(result)
      return
    }

    const retryButton = event.target.closest('[data-action="retry"]')
    if (retryButton) {
      this.overlay.remove()
      this.correctCuts = 0
      this.mistakes = 0
      this.decisions = 0
      this.finished = false
      this.mount()
      return
    }

    const leaf = event.target.closest('.pruning-leaf')
    if (!leaf || this.finished) return

    this._cutLeaf(Number(leaf.dataset.leafId))
  }

  _cutLeaf(leafId) {
    const leaf = this.leaves.find((item) => item.id === leafId)
    if (!leaf || leaf.cut) return

    leaf.cut = true
    this.decisions++

    const group = this.overlay.querySelector(`[data-leaf-id="${leafId}"]`)
    const isCorrect = leaf.state !== 'sana'

    if (isCorrect) {
      this.correctCuts++
      group.classList.add('cut-correct')
      this._setFeedback('Bien: eliminaste tejido deteriorado.', 'good')
    } else {
      this.mistakes++
      group.classList.add('cut-wrong')
      this._setFeedback('Cuidado: una hoja sana tambien produce energia.', 'bad')
    }

    setTimeout(() => group.remove(), 260)
    this._updateStats()

    if (this._badLeavesRemaining() === 0) {
      setTimeout(() => this._finish('completed'), 420)
    }
  }

  _finish(reason) {
    if (this.finished) return
    this.finished = true

    const totalBadLeaves = this.leaves.filter((leaf) => leaf.state !== 'sana').length
    const totalCuts = this.correctCuts + this.mistakes
    const accuracy = totalCuts > 0
      ? Math.round((this.correctCuts / totalCuts) * 100)
      : 0
    const passed = reason === 'completed' && accuracy >= PruningPracticeGame.PASSING_ACCURACY

    this._lastResult = {
      mode: this.mode,
      reason,
      passed,
      accuracy,
      correctCuts: this.correctCuts,
      mistakes: this.mistakes,
      totalBadLeaves
    }

    this._showResult(this._lastResult)
  }

  _showResult(result) {
    const title = result.passed ? 'Poda precisa' : 'Practica completada'
    const message = result.passed
      ? 'Identificaste correctamente las hojas que consumian energia de la planta.'
      : 'Revisa color, textura y sequedad antes de cortar. La poda excesiva estresa a la planta.'

    this.overlay.querySelector('.minigame-container').innerHTML = `
      <div class="minigame-result pruning-result">
        <div class="result-icon">${result.passed ? '✓' : '!'}</div>
        <h2 class="result-title">${title}</h2>
        <div class="result-score-big">${result.accuracy}<span>%</span></div>
        <p class="result-message">${message}</p>
        <div class="pruning-result-grid">
          <span>Hojas correctas</span><strong>${result.correctCuts}/${result.totalBadLeaves}</strong>
          <span>Errores</span><strong>${result.mistakes}</strong>
        </div>
        <div class="defense-modal-actions">
          <button class="btn btn-ghost" data-action="done">Continuar</button>
          <button class="btn btn-primary" data-action="retry">Repetir</button>
        </div>
      </div>
    `
  }

  _createLeaves() {
    const profile = PruningPracticeGame.PROFILES[this.plant.pruningProfile] ||
      PruningPracticeGame.PROFILES.broad
    const total = profile.min + Math.floor(Math.random() * (profile.max - profile.min + 1))
    const leaves = []
    let badLeaves = 0

    for (let index = 0; index < total; index++) {
      const angle = ((index / total) * Math.PI * 2) - Math.PI / 2
      const radiusX = 70 + Math.random() * 44 * profile.spread
      const radiusY = 50 + Math.random() * 60
      const x = 180 + Math.cos(angle) * radiusX + (Math.random() * 26 - 13)
      const y = 170 + Math.sin(angle) * radiusY + (Math.random() * 24 - 12)
      const state = Math.random() < 0.42
        ? (Math.random() < 0.5 ? 'seca' : 'danada')
        : 'sana'

      if (state !== 'sana') badLeaves++

      leaves.push({
        id: index,
        x,
        y,
        rotation: (angle * 180 / Math.PI) + 90 + (Math.random() * 36 - 18),
        scale: 0.8 + Math.random() * 0.35,
        side: index % 2 === 0 ? 1 : -1,
        state,
        cut: false
      })
    }

    if (badLeaves === 0 && leaves.length > 0) {
      leaves[Math.floor(leaves.length / 2)].state = 'seca'
    }

    return leaves
  }

  _renderLeaves() {
    return this.leaves.map((leaf) => {
      const className = leaf.state === 'sana'
        ? 'pruning-leaf leaf-healthy'
        : `pruning-leaf leaf-${leaf.state}`

      return `
        <g
          class="${className}"
          data-leaf-id="${leaf.id}"
          transform="translate(${leaf.x.toFixed(1)} ${leaf.y.toFixed(1)}) rotate(${leaf.rotation.toFixed(1)}) scale(${leaf.scale.toFixed(2)})"
        >
          <ellipse cx="${leaf.side * 24}" cy="0" rx="38" ry="18"></ellipse>
          <path d="M0 0 Q${leaf.side * 24} -7 ${leaf.side * 52} 0"></path>
        </g>
      `
    }).join('')
  }

  _plantImage() {
    const spriteKey = this.plant.sprite_key || 'tradescantia'
    return `../assets/sprites/plants/${spriteKey}_sana.png`
  }

  _badLeavesRemaining() {
    return this.leaves.filter((leaf) => leaf.state !== 'sana' && !leaf.cut).length
  }

  _updateStats() {
    this.overlay.querySelector('[data-ref="correctCuts"]').textContent = this.correctCuts
    this.overlay.querySelector('[data-ref="mistakes"]').textContent = this.mistakes
    this.overlay.querySelector('[data-ref="remaining"]').textContent = this._badLeavesRemaining()
  }

  _setFeedback(message, type) {
    const feedback = this.overlay.querySelector('[data-ref="feedback"]')
    feedback.textContent = message
    feedback.className = `pruning-feedback ${type}`
  }
}

window.MiniGamePruning = MiniGamePruning
