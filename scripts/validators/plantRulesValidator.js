const assert = require('assert/strict')

const {
  getLocationEffect,
  getPruningIntervalDays,
  getRoomLightCondition,
  isLightCompatible
} = require('../../main/domain/plantRules')

function validatePlantRules() {
  assert.equal(getRoomLightCondition('SALA'), 'INDIRECTA')
  assert.equal(getRoomLightCondition('JARD\u00cdN'), 'DIRECTA')
  assert.equal(getRoomLightCondition('DORMITORIO'), 'INDIRECTA')
  assert.equal(getRoomLightCondition(null), 'INDIRECTA')

  assert.equal(isLightCompatible('DIRECTA', 'DIRECTA'), true)
  assert.equal(isLightCompatible('INDIRECTA', 'INDIRECTA'), true)
  assert.equal(isLightCompatible('SOMBRA', 'INDIRECTA'), true)
  assert.equal(isLightCompatible('SOMBRA', 'DIRECTA'), false)
  assert.equal(isLightCompatible('DIRECTA', 'INDIRECTA'), false)

  assert.deepEqual(
    getLocationEffect({ ubicacion: null, tipo_luz: 'DIRECTA' }),
    { isCompatible: true, roomLight: null, healthDelta: 0 }
  )
  assert.deepEqual(
    getLocationEffect({ ubicacion: 'JARD\u00cdN', tipo_luz: 'DIRECTA' }),
    { isCompatible: true, roomLight: 'DIRECTA', healthDelta: 0 }
  )
  assert.deepEqual(
    getLocationEffect({ ubicacion: 'JARD\u00cdN', tipo_luz: 'INDIRECTA' }),
    { isCompatible: false, roomLight: 'DIRECTA', healthDelta: -2 }
  )

  assert.equal(getPruningIntervalDays('FRECUENTE'), 7)
  assert.equal(getPruningIntervalDays('OCASIONAL'), 14)
  assert.equal(getPruningIntervalDays('NUNCA'), null)
  assert.equal(getPruningIntervalDays(undefined), null)
}

module.exports = {
  validatePlantRules
}
