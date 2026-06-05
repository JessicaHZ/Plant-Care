const ROOM_LIGHT_CONDITIONS = {
  'SALA': 'INDIRECTA',
  'JARD\u00cdN': 'DIRECTA',
  'DORMITORIO': 'INDIRECTA'
}

function getRoomLightCondition(ubicacion) {
  return ROOM_LIGHT_CONDITIONS[ubicacion] || 'INDIRECTA'
}

function isLightCompatible(requiredLight, roomLight) {
  if (!requiredLight || !roomLight) return true
  if (requiredLight === roomLight) return true

  // Las plantas de sombra toleran luz indirecta, pero no sol directo.
  if (requiredLight === 'SOMBRA' && roomLight === 'INDIRECTA') return true

  return false
}

function getLocationEffect(plant) {
  if (!plant.ubicacion) {
    return { isCompatible: true, roomLight: null, healthDelta: 0 }
  }

  const roomLight = getRoomLightCondition(plant.ubicacion)
  const isCompatible = isLightCompatible(plant.tipo_luz, roomLight)

  return {
    isCompatible,
    roomLight,
    // La luz incorrecta debe notarse, pero sin castigar tan rapido al jugador.
    healthDelta: isCompatible ? 0 : -2
  }
}

function getPruningIntervalDays(tipo_poda) {
  if (tipo_poda === 'FRECUENTE') return 7
  if (tipo_poda === 'OCASIONAL') return 14
  return null
}

module.exports = {
  getRoomLightCondition,
  isLightCompatible,
  getLocationEffect,
  getPruningIntervalDays
}
