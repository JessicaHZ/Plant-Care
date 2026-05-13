// Simulation: controla el tiempo simulado del juego.
//
// Sistema híbrido:
// - Automático: 1 día cada 10 minutos mientras el juego está abierto
// - Manual: botón "Avanzar día" para acelerar
// - Offline: calcula días transcurridos al reabrir la app
//
// Protección anti-duplicado: _isAdvancing bloquea llamadas simultáneas.

const Simulation = {

  _currentDay:  1,
  _interval:    null,
  _isAdvancing: false,        // ✅ bloquea avances simultáneos

  MS_PER_GAME_DAY: 10 * 60 * 1000,  // 10 minutos reales = 1 día de juego

  async init() {
    await this._syncDayFromPlants()
    this._updateDayDisplay()
    this._startAutoTimer()
  },

  async advanceDays(days = 1) {
  if (this._isAdvancing) {
    return null
  }

  this._isAdvancing = true
  
  try {
    const result = await window.gameAPI.advanceDays(days)

    if (result.success) {
      this._currentDay += days
      this._updateDayDisplay()

      window.dispatchEvent(new CustomEvent('simulation:tick', {
        detail: { results: result.results, day: this._currentDay }
      }))
    }

    return result
  } finally {
    this._isAdvancing = false
  }
 },

  // Inicia el temporizador automático.
  // Si ya hay uno activo lo limpia primero para evitar duplicados.
  _startAutoTimer() {
    if (this._interval) {
      clearInterval(this._interval)
      this._interval = null
    }

    this._interval = setInterval(async () => {
      // Solo avanza si el jugador está en el entorno
      // para que las actualizaciones sean visibles
      await this.advanceDays(1)
    }, this.MS_PER_GAME_DAY)

  },

  // Detiene el temporizador — útil para pausar en pantallas de tutorial, etc.
  stopAutoTimer() {
    if (this._interval) {
      clearInterval(this._interval)
      this._interval = null
    }
  },

  getDay() { return this._currentDay },

  async _syncDayFromPlants() {
    const result = await window.gameAPI.getUserPlants()
    if (!result.success || result.plants.length === 0) return

    const maxDay = Math.max(...result.plants.map(p => p.dias_transcurridos))
    if (maxDay > 0) this._currentDay = maxDay
  },

  _updateDayDisplay() {
    const counters = [
      document.getElementById('sim-day-counter'),
      document.getElementById('menu-day-counter')
    ]
    counters.forEach(el => {
      if (!el) return
      el.textContent = this._currentDay === 1
        ? 'Día 1 — Adquiere tu primera planta'
        : `Día ${this._currentDay}`
    })
  }

  

}

window.Simulation = Simulation