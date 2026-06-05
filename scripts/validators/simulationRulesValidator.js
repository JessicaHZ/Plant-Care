const assert = require('assert/strict')

const {
  calculateDailyHumidity,
  calculateDailyNutrients,
  calculateHealthAfterEnvironment,
  determinePlantState,
  shouldActivatePruning
} = require('../../main/domain/simulationRules')

function validateSimulationRules() {
  assert.equal(calculateDailyHumidity(80, 3, 5), 80)
  assert.equal(calculateDailyHumidity(80, 7, 5), 70)
  assert.equal(calculateDailyHumidity(8, 10, 5), 0)

  assert.equal(calculateDailyNutrients(50), 49)
  assert.equal(calculateDailyNutrients(0), 0)

  assert.equal(
    calculateHealthAfterEnvironment({
      salud: 40,
      humedad: 10,
      nutrientes: 50
    }),
    37
  )
  assert.equal(
    calculateHealthAfterEnvironment({
      salud: 40,
      humedad: 60,
      nutrientes: 50
    }),
    44
  )
  assert.equal(
    calculateHealthAfterEnvironment({
      salud: 80,
      humedad: 60,
      nutrientes: 80
    }),
    79
  )
  assert.equal(
    calculateHealthAfterEnvironment({
      salud: 80,
      humedad: 95,
      nutrientes: 50,
      locationHealthDelta: -2
    }),
    75
  )

  assert.equal(determinePlantState(0), 'MUERTA')
  assert.equal(determinePlantState(25), 'ENFERMA')
  assert.equal(determinePlantState(50), 'MARCHITA')
  assert.equal(determinePlantState(51), 'SANA')

  assert.equal(
    shouldActivatePruning({
      pruningInterval: 7,
      requierePodaActiva: 0,
      diasTranscurridos: 8,
      ultimoPoda: 0
    }),
    true
  )
  assert.equal(
    shouldActivatePruning({
      pruningInterval: 7,
      requierePodaActiva: 1,
      diasTranscurridos: 8,
      ultimoPoda: 0
    }),
    false
  )
  assert.equal(
    shouldActivatePruning({
      pruningInterval: null,
      requierePodaActiva: 0,
      diasTranscurridos: 20,
      ultimoPoda: 0
    }),
    false
  )
}

module.exports = {
  validateSimulationRules
}
