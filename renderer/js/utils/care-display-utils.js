const CareAssetPaths = window.AssetPaths || {
  plantPlaceholderPath: '../assets/sprites/plants/placeholder.png',

  getPlantSpritePath(spriteKey, plantState = 'SANA') {
    return `../assets/sprites/plants/${spriteKey}/${String(plantState).toLowerCase()}.png`
  },

  getLegacyPlantSpritePath(spriteKey, plantState = 'SANA') {
    return `../assets/sprites/plants/${spriteKey}_${String(plantState).toLowerCase()}.png`
  }
}

const CareDisplayUtils = {
  plantPlaceholderPath: CareAssetPaths.plantPlaceholderPath,

  getPlantStateColor(plantState) {
    const stateColors = {
      'SANA': '#66bb6a',
      'MARCHITA': '#ffa726',
      'ENFERMA': '#ef5350',
      'MUERTA': '#757575'
    }

    return stateColors[plantState] || stateColors.MUERTA
  },

  getPlantSpritePath(spriteKey, plantState = 'SANA') {
    return CareAssetPaths.getPlantSpritePath(spriteKey, plantState)
  },

  getLegacyPlantSpritePath(spriteKey, plantState = 'SANA') {
    return CareAssetPaths.getLegacyPlantSpritePath(spriteKey, plantState)
  },

  getPruneButtonState({ pruneUnlocked, pruneAvailable }) {
    if (!pruneUnlocked) {
      return {
        buttonClass: 'btn-ghost',
        disabledAttribute: 'disabled',
        label: '✂️ Podar 🔒 (nivel 2)'
      }
    }

    if (!pruneAvailable) {
      return {
        buttonClass: 'btn-ghost',
        disabledAttribute: 'disabled',
        label: '✂️ No necesita poda'
      }
    }

    return {
      buttonClass: 'btn-secondary',
      disabledAttribute: '',
      label: '✂️ Podar'
    }
  },

  getHealthState(salud) {
    if (salud <= 25) return 'CrÃ­tica'
    if (salud <= 50) return 'Delicada'
    if (salud <= 75) return 'Estable'
    return 'Saludable'
  },

  getHumidityState(humedad) {
    if (humedad < 40) return 'Baja'
    if (humedad <= 75) return 'Optima'
    return 'Saturada'
  },

  getNutrientState(nutrientes) {
    if (nutrientes < 30) return 'Bajos'
    if (nutrientes <= 75) return 'Optimos'
    return 'Exceso'
  },

  getCareMeterHTML({ icon, label, value, state, type = 'balanced' }) {
    const safeValue = NumberUtils.clamp(Number(value) || 0, 0, 100)

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
  }
}

window.CareDisplayUtils = CareDisplayUtils
