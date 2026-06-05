const DiagnosisRules = {
  fallbackRoomLights: {
    SALA: 'INDIRECTA',
    JARDIN: 'DIRECTA',
    'JARD\u00cdN': 'DIRECTA',
    DORMITORIO: 'INDIRECTA'
  },

  getRoomLightCondition(location) {
    const rooms = window.RoomConfig && window.RoomConfig.rooms

    if (rooms && rooms[location]) {
      return rooms[location].luz || null
    }

    return this.fallbackRoomLights[location] || null
  },

  isLightCompatible(requiredLight, roomLight) {
    if (!requiredLight || !roomLight) return true
    if (requiredLight === roomLight) return true
    return requiredLight === 'SOMBRA' && roomLight === 'INDIRECTA'
  },

  hasWrongLight(plant) {
    const roomLight = this.getRoomLightCondition(plant.ubicacion)
    return roomLight !== null && !this.isLightCompatible(plant.tipo_luz, roomLight)
  },

  shouldShowDiagnosis({ plant, level, randomValue = Math.random() }) {
    if (level <= 2) return true
    if (level <= 4) return randomValue < 0.33

    const nutrients = plant.nutrientes ?? 50

    return plant.estado_planta === 'MARCHITA' ||
      plant.estado_planta === 'ENFERMA' ||
      this.hasWrongLight(plant) ||
      nutrients < 30 ||
      nutrients > 75
  }
}

window.DiagnosisRules = DiagnosisRules
