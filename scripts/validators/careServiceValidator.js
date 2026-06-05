const assert = require('assert/strict')

const {
  drainPlant,
  fertilizePlant,
  prunePlant,
  waterPlant
} = require('../../main/services/careService')

function createDrainContext(plant, progress = { nivel: 2 }) {
  const calls = []

  return {
    calls,
    context: {
      idRegistro: 12,
      plantRepository: {
        getUserPlantForCare: idRegistro => {
          calls.push({ method: 'getUserPlantForCare', idRegistro })
          return plant
        }
      },
      getProgress: () => {
        calls.push({ method: 'getProgress' })
        return progress
      },
      updateStats: updates => calls.push({ method: 'updateStats', updates }),
      updatePlantState: (idRegistro, fields) => calls.push({ method: 'updatePlantState', idRegistro, fields }),
      addExperience: xpAmount => {
        calls.push({ method: 'addExperience', xpAmount })
        return { leveledUp: false }
      },
      recordResponsibleCareSession: () => {
        calls.push({ method: 'recordResponsibleCareSession' })
        return { changed: true, newStreak: 2 }
      },
      checkAndGrantAchievements: () => calls.push({ method: 'checkAndGrantAchievements' })
    }
  }
}

function validateCareService() {
  const dryPlant = createDrainContext({
    estado_planta: 'SANA',
    nombre_planta: 'Rosa',
    humedad: 40,
    dias_transcurridos: 5
  })
  const waterResult = waterPlant(dryPlant.context)
  assert.equal(waterResult.success, true)
  assert.equal(waterResult.xpGained, 15)
  assert.equal(waterResult.isError, false)
  assert.deepEqual(waterResult.streakEvent, { changed: true, newStreak: 2 })
  assert.deepEqual(dryPlant.calls, [
    { method: 'getUserPlantForCare', idRegistro: 12 },
    {
      method: 'updateStats',
      updates: {
        acciones_correctas: 1,
        acciones_correctas_hoy: 1,
        acciones_totales: 1
      }
    },
    {
      method: 'updatePlantState',
      idRegistro: 12,
      fields: {
        humedad: 60,
        ultimo_riego: 5,
        dias_sin_regar: 0
      }
    },
    { method: 'addExperience', xpAmount: 15 },
    { method: 'recordResponsibleCareSession' },
    { method: 'checkAndGrantAchievements' }
  ])

  const wetPlant = createDrainContext({
    estado_planta: 'SANA',
    nombre_planta: 'Rosa',
    humedad: 80,
    dias_transcurridos: 5
  })
  const saturatedWaterResult = waterPlant(wetPlant.context)
  assert.equal(saturatedWaterResult.success, true)
  assert.equal(saturatedWaterResult.xpGained, 0)
  assert.equal(saturatedWaterResult.isError, true)
  assert.equal(saturatedWaterResult.streakEvent, null)
  assert.deepEqual(wetPlant.calls, [
    { method: 'getUserPlantForCare', idRegistro: 12 },
    { method: 'updateStats', updates: { errores_riego: 1, acciones_totales: 1 } },
    {
      method: 'updatePlantState',
      idRegistro: 12,
      fields: {
        humedad: 100,
        ultimo_riego: 5,
        dias_sin_regar: 0
      }
    },
    { method: 'addExperience', xpAmount: 0 },
    { method: 'checkAndGrantAchievements' }
  ])

  const deadWaterPlant = createDrainContext({ estado_planta: 'MUERTA', nombre_planta: 'Rosa', humedad: 40 })
  assert.deepEqual(
    waterPlant(deadWaterPlant.context),
    { success: false, error: 'No puedes regar una planta muerta' }
  )
  assert.deepEqual(deadWaterPlant.calls, [
    { method: 'getUserPlantForCare', idRegistro: 12 }
  ])

  const lowNutrientsPlant = createDrainContext({
    estado_planta: 'SANA',
    nombre_planta: 'Rosa',
    nutrientes: 20,
    salud: 95
  })
  const fertilizeResult = fertilizePlant(lowNutrientsPlant.context)
  assert.equal(fertilizeResult.success, true)
  assert.equal(fertilizeResult.xpGained, 12)
  assert.equal(fertilizeResult.isError, false)
  assert.deepEqual(fertilizeResult.streakEvent, { changed: true, newStreak: 2 })
  assert.deepEqual(lowNutrientsPlant.calls, [
    { method: 'getUserPlantForCare', idRegistro: 12 },
    {
      method: 'updateStats',
      updates: {
        acciones_correctas: 1,
        acciones_correctas_hoy: 1,
        acciones_totales: 1
      }
    },
    { method: 'updatePlantState', idRegistro: 12, fields: { salud: 95, nutrientes: 45 } },
    { method: 'addExperience', xpAmount: 12 },
    { method: 'recordResponsibleCareSession' },
    { method: 'checkAndGrantAchievements' }
  ])

  const excessNutrientsPlant = createDrainContext({
    estado_planta: 'SANA',
    nombre_planta: 'Rosa',
    nutrientes: 80,
    salud: 3
  })
  const excessFertilizeResult = fertilizePlant(excessNutrientsPlant.context)
  assert.equal(excessFertilizeResult.success, true)
  assert.equal(excessFertilizeResult.xpGained, 0)
  assert.equal(excessFertilizeResult.isError, true)
  assert.equal(excessFertilizeResult.streakEvent, null)
  assert.deepEqual(excessNutrientsPlant.calls, [
    { method: 'getUserPlantForCare', idRegistro: 12 },
    { method: 'updateStats', updates: { errores_abono: 1, acciones_totales: 1 } },
    { method: 'updatePlantState', idRegistro: 12, fields: { salud: 0, nutrientes: 80 } },
    { method: 'addExperience', xpAmount: 0 },
    { method: 'checkAndGrantAchievements' }
  ])

  const deadFertilizePlant = createDrainContext({ estado_planta: 'MUERTA', nombre_planta: 'Rosa' })
  assert.deepEqual(
    fertilizePlant(deadFertilizePlant.context),
    { success: false, error: 'No se puede abonar esta planta' }
  )
  assert.deepEqual(deadFertilizePlant.calls, [
    { method: 'getUserPlantForCare', idRegistro: 12 }
  ])

  const lockedPrunePlant = createDrainContext({
    estado_planta: 'SANA',
    nombre_planta: 'Rosa',
    tipo_poda: 'FRECUENTE',
    requiere_poda_activa: 1,
    salud: 80
  }, { nivel: 1 })
  assert.deepEqual(
    prunePlant(lockedPrunePlant.context),
    {
      success: false,
      feedback: '🔒 La herramienta de poda se desbloquea al alcanzar el nivel 2.',
      xpGained: 0,
      isError: false
    }
  )
  assert.deepEqual(lockedPrunePlant.calls, [
    { method: 'getProgress' }
  ])

  const notPrunablePlant = createDrainContext({
    estado_planta: 'SANA',
    nombre_planta: 'Cactus',
    tipo_poda: 'NUNCA',
    requiere_poda_activa: 1,
    salud: 80
  })
  const notPrunableResult = prunePlant(notPrunablePlant.context)
  assert.equal(notPrunableResult.success, true)
  assert.equal(notPrunableResult.xpGained, 0)
  assert.equal(notPrunableResult.isError, true)
  assert.deepEqual(notPrunablePlant.calls, [
    { method: 'getProgress' },
    { method: 'getUserPlantForCare', idRegistro: 12 },
    { method: 'updateStats', updates: { errores_poda: 1, acciones_totales: 1 } }
  ])

  const readyToPrunePlant = createDrainContext({
    estado_planta: 'SANA',
    nombre_planta: 'Rosa',
    tipo_poda: 'FRECUENTE',
    requiere_poda_activa: 1,
    salud: 95,
    dias_transcurridos: 9
  })
  const pruneResult = prunePlant(readyToPrunePlant.context)
  assert.equal(pruneResult.success, true)
  assert.equal(pruneResult.xpGained, 20)
  assert.equal(pruneResult.isError, false)
  assert.deepEqual(pruneResult.streakEvent, { changed: true, newStreak: 2 })
  assert.deepEqual(readyToPrunePlant.calls, [
    { method: 'getProgress' },
    { method: 'getUserPlantForCare', idRegistro: 12 },
    {
      method: 'updatePlantState',
      idRegistro: 12,
      fields: {
        salud: 100,
        requiere_poda_activa: 0,
        ultimo_poda: 9
      }
    },
    {
      method: 'updateStats',
      updates: {
        acciones_correctas: 1,
        acciones_correctas_hoy: 1,
        acciones_totales: 1
      }
    },
    { method: 'addExperience', xpAmount: 20 },
    { method: 'recordResponsibleCareSession' },
    { method: 'checkAndGrantAchievements' }
  ])

  const missingPlant = createDrainContext(null)
  assert.deepEqual(
    drainPlant(missingPlant.context),
    { success: false, error: 'Planta no encontrada' }
  )
  assert.deepEqual(missingPlant.calls, [
    { method: 'getUserPlantForCare', idRegistro: 12 }
  ])

  const deadPlant = createDrainContext({ estado_planta: 'MUERTA', nombre_planta: 'Rosa', humedad: 90 })
  assert.deepEqual(
    drainPlant(deadPlant.context),
    { success: false, error: 'No puedes drenar una planta muerta' }
  )
  assert.deepEqual(deadPlant.calls, [
    { method: 'getUserPlantForCare', idRegistro: 12 }
  ])

  const saturatedPlant = createDrainContext({ estado_planta: 'SANA', nombre_planta: 'Rosa', humedad: 90 })
  const result = drainPlant(saturatedPlant.context)
  assert.equal(result.success, true)
  assert.equal(result.xpGained, 12)
  assert.equal(result.isError, false)
  assert.deepEqual(result.xpResult, { leveledUp: false })
  assert.deepEqual(result.streakEvent, { changed: true, newStreak: 2 })
  assert.deepEqual(saturatedPlant.calls, [
    { method: 'getUserPlantForCare', idRegistro: 12 },
    {
      method: 'updateStats',
      updates: {
        acciones_correctas: 1,
        acciones_correctas_hoy: 1,
        acciones_totales: 1
      }
    },
    { method: 'updatePlantState', idRegistro: 12, fields: { humedad: 65 } },
    { method: 'addExperience', xpAmount: 12 },
    { method: 'recordResponsibleCareSession' },
    { method: 'checkAndGrantAchievements' }
  ])

  const normalPlant = createDrainContext({ estado_planta: 'SANA', nombre_planta: 'Rosa', humedad: 70 })
  const unnecessaryResult = drainPlant(normalPlant.context)
  assert.equal(unnecessaryResult.success, true)
  assert.equal(unnecessaryResult.xpGained, 0)
  assert.equal(unnecessaryResult.isError, true)
  assert.equal(unnecessaryResult.streakEvent, null)
  assert.deepEqual(normalPlant.calls, [
    { method: 'getUserPlantForCare', idRegistro: 12 },
    { method: 'updateStats', updates: { errores_riego: 1, acciones_totales: 1 } },
    { method: 'updatePlantState', idRegistro: 12, fields: { humedad: 60 } },
    { method: 'addExperience', xpAmount: 0 },
    { method: 'checkAndGrantAchievements' }
  ])
}

module.exports = {
  validateCareService
}
