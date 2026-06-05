const assert = require('assert/strict')

const {
  calculateDrainCare,
  calculateFertilizeCare,
  calculatePruneCare,
  calculateWaterCare
} = require('../../main/domain/careRules')

function validateCareRules() {
  assert.deepEqual(
    calculateWaterCare(80),
    {
      status: 'SATURATED',
      newHumedad: 100,
      xpGained: 0,
      isError: true,
      statsUpdates: { errores_riego: 1, acciones_totales: 1 }
    }
  )
  assert.equal(calculateWaterCare(60).status, 'PREMATURE')
  assert.equal(calculateWaterCare(40).status, 'CORRECT')
  assert.equal(calculateWaterCare(10).status, 'URGENT')

  assert.deepEqual(
    calculateFertilizeCare(80),
    {
      status: 'EXCESS',
      newNutrientes: 80,
      healthChange: -5,
      xpGained: 0,
      isError: true,
      statsUpdates: { errores_abono: 1, acciones_totales: 1 }
    }
  )
  assert.equal(calculateFertilizeCare(50).status, 'PREMATURE')
  assert.equal(calculateFertilizeCare(20).status, 'CORRECT')

  assert.deepEqual(
    calculateDrainCare(70),
    {
      status: 'UNNECESSARY',
      newHumedad: 60,
      xpGained: 0,
      isError: true,
      statsUpdates: { errores_riego: 1, acciones_totales: 1 }
    }
  )
  assert.deepEqual(
    calculateDrainCare(90),
    {
      status: 'CORRECT',
      newHumedad: 65,
      xpGained: 12,
      isError: false,
      statsUpdates: {
        acciones_correctas: 1,
        acciones_correctas_hoy: 1,
        acciones_totales: 1
      }
    }
  )

  assert.deepEqual(
    calculatePruneCare({
      playerLevel: 1,
      tipoPoda: 'FRECUENTE',
      requierePodaActiva: 1,
      salud: 50
    }),
    {
      status: 'LOCKED_BY_LEVEL',
      xpGained: 0,
      isError: false,
      statsUpdates: null,
      stateUpdates: null
    }
  )
  assert.deepEqual(
    calculatePruneCare({
      playerLevel: 2,
      tipoPoda: 'NUNCA',
      requierePodaActiva: 1,
      salud: 50
    }),
    {
      status: 'NOT_PRUNABLE',
      xpGained: 0,
      isError: true,
      statsUpdates: { errores_poda: 1, acciones_totales: 1 },
      stateUpdates: null
    }
  )
  assert.deepEqual(
    calculatePruneCare({
      playerLevel: 2,
      tipoPoda: 'OCASIONAL',
      requierePodaActiva: 0,
      salud: 50
    }),
    {
      status: 'NOT_NEEDED',
      xpGained: 0,
      isError: true,
      statsUpdates: { errores_poda: 1, acciones_totales: 1 },
      stateUpdates: null
    }
  )
  assert.deepEqual(
    calculatePruneCare({
      playerLevel: 2,
      tipoPoda: 'FRECUENTE',
      requierePodaActiva: 1,
      salud: 95
    }),
    {
      status: 'CORRECT',
      xpGained: 20,
      isError: false,
      statsUpdates: {
        acciones_correctas: 1,
        acciones_correctas_hoy: 1,
        acciones_totales: 1
      },
      stateUpdates: {
        salud: 100,
        requiere_poda_activa: 0
      }
    }
  )
}

module.exports = {
  validateCareRules
}
