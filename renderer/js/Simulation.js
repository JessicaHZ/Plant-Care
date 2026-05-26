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
    await this._syncDayFromProgress()
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
      await this._syncDayFromProgress()
      this._updateDayDisplay()

      window.dispatchEvent(new CustomEvent('simulation:tick', {
        detail: { results: result.results, day: this._currentDay }
      }))

      if (result.streakEvent?.changed) {
        this._showSimulationMessage(result.streakEvent.message, 'warning')
      } else {
        const attentionCount = this._countPlantsNeedingAttention(result.results)
        if (attentionCount > 0) {
          const message = attentionCount === 1
            ? 'Una planta necesita atención.'
            : `${attentionCount} plantas necesitan atención.`
          this._showSimulationMessage(message, 'warning')
        }
      }
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
      // Solo se pausa en la pantalla de inicio; dentro de la partida,
      // el tiempo sigue avanzando aunque el jugador visite otros apartados.
      if (window.ScreenManager?.current() === 'splash') return
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

  async _syncDayFromProgress() {
    const progressResult = await window.gameAPI.getProgress()
    if (progressResult.success && progressResult.progress?.dia_actual) {
      this._currentDay = Math.max(1, progressResult.progress.dia_actual)
      return
    }

    const result = await window.gameAPI.getUserPlants()
    this._currentDay = 1
    if (!result.success || result.plants.length === 0) return

    const maxDay = Math.max(...result.plants.map(p => p.dias_transcurridos))
    if (maxDay > 0) this._currentDay = maxDay + 1
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
  },

  _showSimulationMessage(message, type = 'info') {
    const toast = document.createElement('div')
    toast.className = `care-toast care-toast-${type}`
    toast.textContent = message
    document.body.appendChild(toast)

    setTimeout(() => toast.classList.add('visible'), 50)
    setTimeout(() => {
      toast.classList.remove('visible')
      setTimeout(() => toast.remove(), 400)
    }, 4200)
  },

  _countPlantsNeedingAttention(results = []) {
    return results.filter(plant =>
      plant.estado_planta === 'MARCHITA' ||
      plant.estado_planta === 'ENFERMA'
    ).length
  }

  

}

window.Simulation = Simulation
