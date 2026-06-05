const {
  getRoomLightCondition,
  isLightCompatible
} = require('../domain/plantRules')

function calculatePlacementResult({ plant, ubicacion }) {
  const roomLight = getRoomLightCondition(ubicacion)
  const shouldRecordLocationError = Boolean(
    plant &&
    ubicacion &&
    !isLightCompatible(plant.tipo_luz, roomLight)
  )

  return {
    roomLight,
    shouldRecordLocationError
  }
}

module.exports = {
  calculatePlacementResult
}
