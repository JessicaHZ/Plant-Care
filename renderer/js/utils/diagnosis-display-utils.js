const DiagnosisDisplayUtils = {
  guideSprites: {
    normal: '../assets/guide/guide_normal.png',
    thinking: '../assets/guide/guide_thinking.png',
    worried: '../assets/guide/guide_worried.png',
    happy: '../assets/guide/guide_happy.png'
  },

  clampMeterValue(value) {
    const numericValue = Number(value) || 0
    return Math.min(100, Math.max(0, numericValue))
  },

  getInitialGuideMood(plant) {
    if (plant?.estado_planta && plant.estado_planta !== 'SANA') return 'worried'
    if (Number(plant?.salud) <= 50) return 'worried'
    return 'thinking'
  },

  getGuideSpritePath(mood = 'normal') {
    return this.guideSprites[mood] || this.guideSprites.normal
  },

  getHumidityLabel(humidity) {
    if (humidity < 40) return 'Humedad (baja)'
    if (humidity <= 75) return 'Humedad (optima)'
    return 'Humedad (saturada)'
  },

  getHumidityState(humidity) {
    if (humidity < 20) return 'seca'
    if (humidity < 40) return 'baja'
    if (humidity <= 75) return 'adecuada'
    if (humidity <= 90) return 'alta'
    return 'saturada'
  },

  getHealthState(health) {
    if (health <= 25) return 'critica'
    if (health <= 50) return 'delicada'
    if (health <= 75) return 'estable'
    return 'saludable'
  },

  getHumidityBarHTML(humidity) {
    const safeHumidity = this.clampMeterValue(humidity)

    return `
      <div class="diag-bar-row">
        <span class="diag-bar-label">\ud83d\udca7 ${this.getHumidityLabel(humidity)}</span>
        <div class="diag-bar-bg diag-bar-balanced" aria-label="Humedad: ${safeHumidity}">
          <span class="diag-bar-marker" style="left:${safeHumidity}%"></span>
        </div>
        <span class="diag-bar-val">${this.getHumidityState(humidity)}</span>
      </div>
    `
  },

  getHealthBarHTML(health) {
    const safeHealth = this.clampMeterValue(health)

    return `
      <div class="diag-bar-row">
        <span class="diag-bar-label">\u2764\ufe0f Salud</span>
        <div class="diag-bar-bg diag-bar-health" aria-label="Salud: ${safeHealth}">
          <span class="diag-bar-marker" style="left:${safeHealth}%"></span>
        </div>
        <span class="diag-bar-val">${this.getHealthState(health)}</span>
      </div>
    `
  },

  getResultText({ answeredCorrectly, requiresDrain, streakEvent }) {
    let resultText

    if (answeredCorrectly && requiresDrain) {
      resultText = 'Correcto. Aplicaste drenaje antes de regar.'
    } else {
      resultText = answeredCorrectly
        ? 'Correcto. Observaste bien las señales.'
        : 'No era la causa principal. Revisa las señales de la planta.'
    }

    if (streakEvent?.changed) {
      resultText += ` ${streakEvent.message}.`
    }

    return resultText
  }
}

window.DiagnosisDisplayUtils = DiagnosisDisplayUtils
