// MiniGameDefense: Defensa del Brote.
// Adaptacion modular del minijuego arcade de plagas al flujo IPC/SQLite del proyecto base.

const MiniGameDefense = {
  _activeGame: null,

  async start(onFinish) {
    if (this._activeGame) this._activeGame.stop()

    const [progressResult, plantsResult] = await Promise.all([
      window.gameAPI.getProgress(),
      window.gameAPI.getUserPlants()
    ])

    const level = progressResult.success ? progressResult.progress.nivel : 1
    const plants = plantsResult.success ? plantsResult.plants : []
    const game = new DefenseSproutGame({
      level,
      plant: plants[0] || null,
      onFinish: async (summary) => {
        this._activeGame = null
        const result = await window.gameAPI.completeDefenseGame(summary.xpTotal)

        if (result.xpResult) {
          window.dispatchEvent(new CustomEvent('xp:gained', {
            detail: result.xpResult
          }))
        }

        if (onFinish) onFinish({
          ...summary,
          persisted: result.success,
          xpGained: result.xpGained || 0
        })
      }
    })

    this._activeGame = game
    game.mount()
  }
}

class DefenseSproutGame {
  static MAX_SPEED = 2.5

  static PESTS = [
    { name: 'Pulgon',     label: '🪲', xp: 4, speed: 1.0, size: 38, behavior: 'direct' },
    { name: 'Cochinilla', label: '🪳', xp: 6, speed: 0.5, size: 46, behavior: 'direct' },
    { name: 'Acaro',      label: '🕷️', xp: 5, speed: 1.8, size: 32, behavior: 'direct' },
    { name: 'Mosca',      label: '🪰', xp: 5, speed: 2.2, size: 30, behavior: 'zigzag' },
    { name: 'Oruga',      label: '🐛', xp: 8, speed: 0.3, size: 48, behavior: 'direct' },
    { name: 'Hormiga',    label: '🐜', xp: 3, speed: 2.0, size: 28, behavior: 'direct' }
  ]

  static ALLIES = [
    { name: 'Mariquita', label: '🐞', speed: 1.2, size: 36 },
    { name: 'Abeja',     label: '🐝', speed: 1.8, size: 32 },
    { name: 'Mariposa',  label: '🦋', speed: 2.4, size: 40 },
    { name: 'Mantis',    label: '🦗', speed: 0.9, size: 38 }
  ]

  static WAVES = [
    { pests: 5,  spawnMs: 1300 },
    { pests: 7,  spawnMs: 1050 },
    { pests: 9,  spawnMs: 860 },
    { pests: 11, spawnMs: 720 },
    { pests: 14, spawnMs: 580 }
  ]

  constructor({ level, plant, onFinish }) {
    this.level = Math.max(1, level || 1)
    this.plant = plant
    this.onFinish = onFinish

    this.running = false
    this.score = 0
    this.health = 100
    this.combo = 0
    this.frenzy = false
    this.entities = []
    this.entityId = 0
    this.speedMultiplier = 1
    this.timeLeft = 60
    this.wave = 0
    this.waveSpawned = 0
    this.waveActive = 0
    this.wavePaused = false

    this.lastFrame = null
    this.animationId = null
    this.spawnTimer = null
    this.allyTimer = null
    this.waveTimer = null
    this.clockTimer = null
    this.overlay = null
    this.root = null
    this.arena = null
    this.effectsLayer = null
  }

  mount() {
    this.overlay = document.createElement('div')
    this.overlay.id = 'defense-overlay'
    this.overlay.className = 'minigame-overlay'
    this.overlay.innerHTML = `
      <div class="minigame-container defense-container">
        <div class="defense-topbar">
          <button class="btn btn-ghost defense-back-btn" data-action="exit">Volver</button>
          <div class="defense-stat"><span>Tiempo</span><strong data-ref="timer">60s</strong></div>
          <div class="defense-stat"><span>XP</span><strong data-ref="score">0</strong></div>
          <div class="defense-frenzy" data-ref="frenzy">Frenesi x2</div>
        </div>

        <div class="defense-health">
          <span>Brote</span>
          <div class="defense-health-track">
            <div class="defense-health-fill" data-ref="healthFill"></div>
          </div>
          <strong data-ref="healthText">100%</strong>
        </div>

        <div class="defense-arena" data-ref="arena">
          <img
            class="defense-plant"
            data-ref="plant"
            src="${this._plantImage()}"
            onerror="this.src='../assets/sprites/plants/cactus_sana.png'"
            alt="Brote defendido"
          />
          <div class="defense-effects" data-ref="effects"></div>
        </div>

        <div class="defense-combo" data-ref="combo">Combo <span>0</span></div>
        <div class="defense-legend">
          <span>Elimina plagas antes de que lleguen al brote.</span>
          <span>No pulses organismos aliados.</span>
        </div>
      </div>
    `

    document.body.appendChild(this.overlay)
    this.root = this.overlay.querySelector('.defense-container')
    this.arena = this.overlay.querySelector('[data-ref="arena"]')
    this.effectsLayer = this.overlay.querySelector('[data-ref="effects"]')

    this.overlay.addEventListener('click', (event) => this._handleClick(event))
    this._updateHealth(0)
    setTimeout(() => this.start(), 250)
  }

  start() {
    if (this.running) return

    this.running = true
    this.lastFrame = performance.now()
    this.clockTimer = setInterval(() => {
      this.timeLeft--
      const timer = this.overlay.querySelector('[data-ref="timer"]')
      if (timer) {
        timer.textContent = `${this.timeLeft}s`
        timer.classList.toggle('urgent', this.timeLeft <= 10)
      }
      if (this.timeLeft <= 0) this._finish('timeout')
    }, 1000)

    this._showWaveBanner(1, () => this._schedulePest())
    this._scheduleAlly()
    this.animationId = requestAnimationFrame((time) => this._loop(time))
  }

  stop() {
    this.running = false
    clearInterval(this.clockTimer)
    clearTimeout(this.spawnTimer)
    clearTimeout(this.allyTimer)
    clearTimeout(this.waveTimer)
    if (this.animationId) cancelAnimationFrame(this.animationId)
    this.entities.forEach((entity) => entity.element?.remove())
    this.entities = []
  }

  _handleClick(event) {
    const exitButton = event.target.closest('[data-action="exit"]')
    if (exitButton) {
      this.stop()
      this.overlay.remove()
      return
    }

    const retryButton = event.target.closest('[data-action="retry"]')
    if (retryButton) {
      this.overlay.remove()
      new DefenseSproutGame({
        level: this.level,
        plant: this.plant,
        onFinish: this.onFinish
      }).mount()
      return
    }

    const doneButton = event.target.closest('[data-action="done"]')
    if (doneButton) {
      const summary = this._lastSummary
      this.overlay.remove()
      if (this.onFinish) this.onFinish(summary)
    }
  }

  _plantImage() {
    if (!this.plant?.sprite_key) return '../assets/sprites/plants/cactus_sana.png'
    return `../assets/sprites/plants/${this.plant.sprite_key}_sana.png`
  }

  _waveConfig() {
    return DefenseSproutGame.WAVES[Math.min(this.wave, DefenseSproutGame.WAVES.length - 1)]
  }

  _calculateSpeed() {
    return Math.min(DefenseSproutGame.MAX_SPEED, 1 + Math.log(this.score + 2) * 0.25)
  }

  _schedulePest() {
    if (!this.running || this.wavePaused) return

    const config = this._waveConfig()
    if (this.waveSpawned >= config.pests) return

    const delay = config.spawnMs + (Math.random() * 280 - 140)
    this.spawnTimer = setTimeout(() => {
      if (!this.running || this.wavePaused) return
      this._spawnPest()
      this._schedulePest()
    }, delay)
  }

  _scheduleAlly() {
    if (!this.running) return

    const delay = 4500 + Math.random() * 5000
    this.allyTimer = setTimeout(() => {
      if (!this.running) return
      this._spawnAlly()
      this._scheduleAlly()
    }, delay)
  }

  _spawnPest() {
    const width = this._arenaWidth()
    const height = this._arenaHeight()
    const definition = this._randomFrom(DefenseSproutGame.PESTS)
    const edge = Math.floor(Math.random() * 4)
    let x
    let y

    if (edge === 0) {
      x = Math.random() * width
      y = -definition.size
    } else if (edge === 1) {
      x = width + definition.size
      y = Math.random() * height
    } else if (edge === 2) {
      x = Math.random() * width
      y = height + definition.size
    } else {
      x = -definition.size
      y = Math.random() * height
    }

    const hitSize = definition.size + 48
    const element = document.createElement('button')
    element.type = 'button'
    element.className = 'defense-entity defense-pest'
    element.dataset.entityId = String(this.entityId)
    element.style.cssText = `
      left:${x - hitSize / 2}px;
      top:${y - hitSize / 2}px;
      width:${hitSize}px;
      height:${hitSize}px;
      font-size:${definition.size}px;
    `
    element.innerHTML = `<span>${definition.label}</span>`
    this.arena.appendChild(element)

    const entity = {
      id: this.entityId++,
      type: 'pest',
      definition,
      element,
      x,
      y,
      hitSize,
      speed: definition.speed * this.speedMultiplier,
      wobbleAmplitude: definition.behavior === 'zigzag'
        ? 0.45 + Math.random() * 0.25
        : 0.07 + Math.random() * 0.09,
      wobbleFrequency: definition.behavior === 'zigzag'
        ? 4 + Math.random() * 3
        : 2 + Math.random() * 2.5,
      time: 0,
      killed: false
    }

    element.addEventListener('click', (event) => {
      event.stopPropagation()
      this._hitEntity(entity, element.offsetLeft + event.offsetX, element.offsetTop + event.offsetY)
    })

    this.entities.push(entity)
    this.waveSpawned++
    this.waveActive++
  }

  _spawnAlly() {
    const width = this._arenaWidth()
    const height = this._arenaHeight()
    const definition = this._randomFrom(DefenseSproutGame.ALLIES)
    const fromLeft = Math.random() < 0.5
    const x = fromLeft ? -definition.size : width + definition.size
    const y = 30 + Math.random() * (height - 60)

    const element = document.createElement('button')
    element.type = 'button'
    element.className = 'defense-entity defense-ally'
    element.dataset.entityId = String(this.entityId)
    element.style.cssText = `
      left:${x}px;
      top:${y}px;
      width:${definition.size + 26}px;
      height:${definition.size + 26}px;
      font-size:${definition.size}px;
    `
    element.innerHTML = `<span>${definition.label}</span>`
    this.arena.appendChild(element)

    const entity = {
      id: this.entityId++,
      type: 'ally',
      definition,
      element,
      x,
      y,
      vx: fromLeft ? 1 : -1,
      vy: (Math.random() - 0.5) * 0.25,
      speed: definition.speed * this.speedMultiplier,
      killed: false
    }

    element.addEventListener('click', (event) => {
      event.stopPropagation()
      this._hitEntity(entity, element.offsetLeft + event.offsetX, element.offsetTop + event.offsetY)
    })

    this.entities.push(entity)
  }

  _loop(timestamp) {
    if (!this.running) return

    const delta = this.lastFrame ? Math.min((timestamp - this.lastFrame) / 16.67, 4) : 1
    this.lastFrame = timestamp

    const width = this._arenaWidth()
    const height = this._arenaHeight()
    const centerX = width / 2
    const centerY = height / 2
    const removed = []

    this.entities.forEach((entity) => {
      if (entity.killed) return

      if (entity.type === 'pest') {
        entity.time += delta * 0.04
        const dx = centerX - entity.x
        const dy = centerY - entity.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance > 2) {
          const normalX = -dy / distance
          const normalY = dx / distance
          const wobble = Math.sin(entity.time * entity.wobbleFrequency) * entity.wobbleAmplitude
          entity.x += (dx / distance + normalX * wobble) * entity.speed * delta
          entity.y += (dy / distance + normalY * wobble) * entity.speed * delta
        }

        entity.element.style.left = `${entity.x - entity.hitSize / 2}px`
        entity.element.style.top = `${entity.y - entity.hitSize / 2}px`

        if (Math.sqrt((entity.x - centerX) ** 2 + (entity.y - centerY) ** 2) < 44) {
          removed.push({ entity, reason: 'reached' })
        }
      } else {
        entity.x += entity.vx * entity.speed * delta
        entity.y += entity.vy * entity.speed * delta
        entity.element.style.left = `${entity.x}px`
        entity.element.style.top = `${entity.y}px`

        if (entity.x < -120 || entity.x > width + 120) {
          removed.push({ entity, reason: 'offscreen' })
        }
      }
    })

    removed.forEach(({ entity, reason }) => this._removeEntity(entity, reason))
    this.animationId = requestAnimationFrame((time) => this._loop(time))
  }

  _hitEntity(entity, x, y) {
    if (entity.killed || !this.running) return

    entity.killed = true
    this.entities = this.entities.filter((item) => item.id !== entity.id)

    if (entity.type === 'pest') {
      this.combo++
      const xp = entity.definition.xp * (this.frenzy ? 2 : 1)
      this.score += xp
      this._floatText(x, y - 18, `+${xp} XP`, 'good')
      this._particles(x, y, true)
      if (this.combo >= 5 && !this.frenzy) this._activateFrenzy()
      this._updateScore()
      this._showCombo()
      entity.element.classList.add('defense-entity-die')
      setTimeout(() => {
        entity.element?.remove()
        this.waveActive--
        this._checkWaveComplete()
      }, 300)
    } else {
      this.combo = 0
      this.frenzy = false
      this.root.classList.remove('defense-frenzy-mode')
      this.overlay.querySelector('[data-ref="frenzy"]').classList.remove('active')
      this._updateHealth(-20)
      this._shake()
      this._flash()
      this._floatText(x, y - 18, 'Aliado -20', 'bad')
      this._particles(x, y, false)
      this._hideCombo()
      entity.element.remove()
    }
  }

  _removeEntity(entity, reason) {
    if (entity.killed) return

    entity.killed = true
    this.entities = this.entities.filter((item) => item.id !== entity.id)

    if (reason === 'reached') {
      this._updateHealth(-15)
      this._shake()
      this.combo = 0
      this._hideCombo()
    }

    entity.element?.remove()
    if (entity.type === 'pest') {
      this.waveActive--
      this._checkWaveComplete()
    }
  }

  _checkWaveComplete() {
    if (this.wavePaused || !this.running) return

    const config = this._waveConfig()
    if (this.waveSpawned >= config.pests && this.waveActive <= 0) {
      this.wavePaused = true
      clearTimeout(this.spawnTimer)
      this.waveTimer = setTimeout(() => {
        if (!this.running) return
        this.wave++
        this.waveSpawned = 0
        this.waveActive = 0
        this.wavePaused = false
        this.speedMultiplier = this._calculateSpeed()
        this._showWaveBanner(this.wave + 1, () => this._schedulePest())
      }, 2000)
    }
  }

  _finish(reason) {
    if (!this.running) return

    this.stop()
    const healthBonus = Math.round(this.health * 0.5)
    const xpTotal = this.score + healthBonus
    const survived = reason !== 'dead'
    const stars = this.health >= 80 ? 3 : this.health >= 40 ? 2 : 1
    const title = survived ? 'Brote defendido' : 'El brote cayo'

    this._lastSummary = {
      reason,
      survived,
      score: this.score,
      healthBonus,
      xpTotal,
      stars
    }

    const modal = document.createElement('div')
    modal.className = 'defense-modal'
    modal.innerHTML = `
      <div class="defense-modal-card">
        <p class="defense-modal-kicker">${stars} estrella${stars === 1 ? '' : 's'}</p>
        <h3>${title}</h3>
        <div class="defense-modal-score">
          <span>Plagas eliminadas</span><strong>+${this.score} XP</strong>
          <span>Bono de salud</span><strong>+${healthBonus} XP</strong>
          <span>Total</span><strong>+${xpTotal} XP</strong>
        </div>
        <p class="defense-modal-note">
          La deteccion temprana evita que una plaga se propague al resto del cultivo.
        </p>
        <div class="defense-modal-actions">
          <button class="btn btn-ghost" data-action="done">Continuar</button>
          <button class="btn btn-primary" data-action="retry">Repetir</button>
        </div>
      </div>
    `
    this.root.appendChild(modal)
  }

  _showWaveBanner(waveNumber, callback) {
    const banner = document.createElement('div')
    banner.className = 'defense-wave-banner'
    banner.innerHTML = `Oleada ${waveNumber}<span>Preparate</span>`
    this.arena.appendChild(banner)

    setTimeout(() => {
      banner.classList.add('fade-out')
      setTimeout(() => {
        banner.remove()
        if (callback) callback()
      }, 360)
    }, 1200)
  }

  _updateHealth(delta) {
    this.health = Math.max(0, Math.min(100, this.health + delta))
    const fill = this.overlay.querySelector('[data-ref="healthFill"]')
    const text = this.overlay.querySelector('[data-ref="healthText"]')
    const plant = this.overlay.querySelector('[data-ref="plant"]')

    fill.style.width = `${this.health}%`
    fill.classList.toggle('low', this.health < 30)
    text.textContent = `${this.health}%`

    if (plant) {
      plant.style.filter = this.health < 40
        ? 'sepia(0.8) brightness(0.8)'
        : this.health < 70
          ? 'sepia(0.3)'
          : ''
    }

    if (this.health <= 0) this._finish('dead')
  }

  _updateScore() {
    this.overlay.querySelector('[data-ref="score"]').textContent = this.score
  }

  _activateFrenzy() {
    this.frenzy = true
    this.root.classList.add('defense-frenzy-mode')
    this.overlay.querySelector('[data-ref="frenzy"]').classList.add('active')
  }

  _showCombo() {
    const combo = this.overlay.querySelector('[data-ref="combo"]')
    combo.querySelector('span').textContent = this.combo
    combo.classList.add('visible')
    combo.style.transform = 'scale(1.16)'
    setTimeout(() => {
      combo.style.transform = 'scale(1)'
    }, 180)
    if (this.combo < 2) {
      setTimeout(() => combo.classList.remove('visible'), 1600)
    }
  }

  _hideCombo() {
    const combo = this.overlay.querySelector('[data-ref="combo"]')
    combo.classList.remove('visible')
    combo.querySelector('span').textContent = '0'
  }

  _floatText(x, y, text, type) {
    const element = document.createElement('div')
    element.className = `defense-float-text ${type}`
    element.style.left = `${x}px`
    element.style.top = `${y}px`
    element.textContent = text
    this.effectsLayer.appendChild(element)
    setTimeout(() => element.remove(), 900)
  }

  _particles(x, y, isGood) {
    const colors = isGood ? ['#ffd54f', '#81c784', '#ffffff'] : ['#ef5350', '#ff8a65', '#ffd54f']

    for (let index = 0; index < 6; index++) {
      const particle = document.createElement('div')
      const size = 4 + Math.random() * 5
      particle.className = 'defense-particle'
      particle.style.cssText = `
        width:${size}px;
        height:${size}px;
        background:${colors[index % colors.length]};
        left:${x}px;
        top:${y}px;
      `
      this.effectsLayer.appendChild(particle)

      let px = x
      let py = y
      const vx = (Math.random() - 0.5) * 8
      let vy = -(3 + Math.random() * 5)
      let opacity = 1

      const tick = () => {
        px += vx
        py += vy
        vy += 0.35
        opacity -= 0.07
        particle.style.left = `${px}px`
        particle.style.top = `${py}px`
        particle.style.opacity = Math.max(0, opacity)
        if (opacity > 0 && particle.parentNode) requestAnimationFrame(tick)
        else particle.remove()
      }
      tick()
    }
  }

  _shake() {
    this.root.classList.remove('defense-shake')
    void this.root.offsetWidth
    this.root.classList.add('defense-shake')
    setTimeout(() => this.root.classList.remove('defense-shake'), 450)
  }

  _flash() {
    const flash = document.createElement('div')
    flash.className = 'defense-flash'
    this.arena.appendChild(flash)
    setTimeout(() => flash.remove(), 400)
  }

  _arenaWidth() {
    return this.arena?.clientWidth || 580
  }

  _arenaHeight() {
    return this.arena?.clientHeight || 320
  }

  _randomFrom(items) {
    return items[Math.floor(Math.random() * items.length)]
  }
}

window.MiniGameDefense = MiniGameDefense
