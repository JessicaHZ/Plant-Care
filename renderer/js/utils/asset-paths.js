const AssetPaths = {
  plantPlaceholderPath: '../assets/sprites/plants/placeholder.png',
  fallbackPlantSpritePath: '../assets/sprites/plants/cactus/sana.png',
  profileIconBasePath: '../assets/icons/profile',

  getPlantSpritePath(spriteKey, plantState = 'SANA') {
    const safeSpriteKey = spriteKey || 'placeholder'
    const state = this._normalizePlantState(plantState)
    return `../assets/sprites/plants/${safeSpriteKey}/${state}.png`
  },

  getLegacyPlantSpritePath(spriteKey, plantState = 'SANA') {
    const safeSpriteKey = spriteKey || 'placeholder'
    const state = this._normalizePlantState(plantState)
    return `../assets/sprites/plants/${safeSpriteKey}_${state}.png`
  },

  getProfileIconPath(iconKey) {
    return `${this.profileIconBasePath}/${iconKey}.png`
  },

  getProfileIconHTML(iconKey, fallbackText, className = 'pixel-icon') {
    if (!iconKey) return fallbackText

    return `
      <img
        class="${className}"
        src="${this.getProfileIconPath(iconKey)}"
        alt=""
        onerror="this.replaceWith(document.createTextNode('${fallbackText}'))"
      />
    `
  },

  _normalizePlantState(plantState) {
    const state = String(plantState || 'SANA').toUpperCase()
    const states = {
      SANA: 'sana',
      ENFERMA: 'enferma',
      MARCHITA: 'marchita',
      MUERTA: 'muerta'
    }

    return states[state] || states.SANA
  }
}

window.AssetPaths = AssetPaths
