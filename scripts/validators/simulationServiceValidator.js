const assert = require('assert/strict')

const { simulateDays } = require('../../main/services/simulationService')

function validateSimulationService() {
  const calls = []
  const plants = [
    {
      id_registro: 1,
      nombre_planta: 'Rosa',
      estado_planta: 'SANA',
      humedad: 50,
      salud: 50,
      nutrientes: 50,
      dias_sin_regar: 0,
      dias_transcurridos: 0,
      frecuencia_riego: 1,
      ubicacion: 'sala',
      tipo_luz: 'INDIRECTA',
      tipo_poda: 'FRECUENTE',
      ultimo_poda: 0,
      requiere_poda_activa: 0
    },
    {
      id_registro: 2,
      nombre_planta: 'Cactus',
      estado_planta: 'SANA',
      humedad: 95,
      salud: 2,
      nutrientes: 50,
      dias_sin_regar: 10,
      dias_transcurridos: 4,
      frecuencia_riego: 1,
      ubicacion: 'sala',
      tipo_luz: 'DIRECTA',
      tipo_poda: 'NUNCA',
      ultimo_poda: 0,
      requiere_poda_activa: 0
    },
    {
      id_registro: 3,
      nombre_planta: 'Muerta',
      estado_planta: 'MUERTA',
      humedad: 0,
      salud: 0,
      nutrientes: 0,
      dias_sin_regar: 0,
      dias_transcurridos: 0,
      frecuencia_riego: 1,
      ubicacion: null,
      tipo_luz: 'INDIRECTA',
      tipo_poda: 'NUNCA',
      ultimo_poda: 0,
      requiere_poda_activa: 0
    }
  ]

  const result = simulateDays({
    daysToAdvance: 2,
    getUserPlants: () => plants,
    updatePlantState: (idRegistro, fields) => calls.push({ method: 'updatePlantState', idRegistro, fields }),
    updateStats: updates => calls.push({ method: 'updateStats', updates }),
    getProgress: () => ({ dia_actual: 3 }),
    updateProgress: fields => calls.push({ method: 'updateProgress', fields }),
    resetStreakForPlantDeath: () => {
      calls.push({ method: 'resetStreakForPlantDeath' })
      return { changed: true, newStreak: 0 }
    },
    checkAndGrantAchievements: () => calls.push({ method: 'checkAndGrantAchievements' }),
    runInTransaction: callback => {
      calls.push({ method: 'runInTransaction:start' })
      callback()
      calls.push({ method: 'runInTransaction:end' })
    }
  })

  assert.equal(result.results.length, 2)
  assert.deepEqual(result.streakEvent, { changed: true, newStreak: 0 })
  assert.deepEqual(result.results.map(item => item.id_registro), [1, 2])
  assert.equal(result.results[0].estado_planta, 'SANA')
  assert.equal(result.results[0].requiere_poda_activa, 0)
  assert.equal(result.results[1].estado_planta, 'MUERTA')
  assert.deepEqual(calls, [
    { method: 'runInTransaction:start' },
    {
      method: 'updatePlantState',
      idRegistro: 1,
      fields: {
        humedad: 45,
        salud: 56,
        dias_sin_regar: 2,
        dias_transcurridos: 2,
        estado_planta: 'SANA',
        nutrientes: 48,
        requiere_poda_activa: 0
      }
    },
    {
      method: 'updatePlantState',
      idRegistro: 2,
      fields: {
        humedad: 0,
        salud: 0,
        dias_sin_regar: 12,
        dias_transcurridos: 6,
        estado_planta: 'MUERTA',
        nutrientes: 48,
        requiere_poda_activa: 0
      }
    },
    { method: 'updateStats', updates: { plantas_muertas: 1 } },
    { method: 'resetStreakForPlantDeath' },
    { method: 'runInTransaction:end' },
    { method: 'updateProgress', fields: { dia_actual: 5 } },
    { method: 'checkAndGrantAchievements' }
  ])

  assert.deepEqual(
    simulateDays({
      daysToAdvance: 0,
      getUserPlants: () => [],
      updatePlantState: () => {},
      updateStats: () => {},
      getProgress: () => ({ dia_actual: 1 }),
      updateProgress: () => {},
      resetStreakForPlantDeath: () => null,
      checkAndGrantAchievements: () => {},
      runInTransaction: callback => callback()
    }),
    { results: [], streakEvent: null }
  )
}

module.exports = {
  validateSimulationService
}
