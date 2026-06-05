const assert = require('assert/strict')

const { calculatePlacementResult } = require('../../main/services/plantPlacementService')

function validatePlantPlacementService() {
  assert.deepEqual(
    calculatePlacementResult({
      plant: { tipo_luz: 'DIRECTA' },
      ubicacion: 'JARD\u00cdN'
    }),
    {
      roomLight: 'DIRECTA',
      shouldRecordLocationError: false
    }
  )

  assert.deepEqual(
    calculatePlacementResult({
      plant: { tipo_luz: 'SOMBRA' },
      ubicacion: 'JARD\u00cdN'
    }),
    {
      roomLight: 'DIRECTA',
      shouldRecordLocationError: true
    }
  )

  assert.deepEqual(
    calculatePlacementResult({
      plant: null,
      ubicacion: 'SALA'
    }),
    {
      roomLight: 'INDIRECTA',
      shouldRecordLocationError: false
    }
  )
}

module.exports = {
  validatePlantPlacementService
}
