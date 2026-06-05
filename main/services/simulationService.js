const {
  calculateDailyHumidity,
  calculateDailyNutrients,
  calculateHealthAfterEnvironment,
  determinePlantState,
  shouldActivatePruning
} = require('../domain/simulationRules')
const {
  getLocationEffect,
  getPruningIntervalDays
} = require('../domain/plantRules')
const { toNonNegativeInteger } = require('../utils/number-utils')

function simulateDays({
  daysToAdvance,
  getUserPlants,
  updatePlantState,
  updateStats,
  getProgress,
  updateProgress,
  resetStreakForPlantDeath,
  checkAndGrantAchievements,
  runInTransaction
}) {
  const safeDays = toNonNegativeInteger(daysToAdvance)
  if (safeDays === 0) return { results: [], streakEvent: null }

  const plants = getUserPlants()
  const results = []
  let streakEvent = null

  runInTransaction(() => {
    for (const plant of plants) {
      if (plant.estado_planta === 'MUERTA') continue

      let { humedad, salud, dias_sin_regar, dias_transcurridos } = plant
      let nutrientes = plant.nutrientes ?? 50
      const locationEffect = getLocationEffect(plant)
      const pruningInterval = getPruningIntervalDays(plant.tipo_poda)

      for (let day = 0; day < safeDays; day++) {
        dias_transcurridos++
        dias_sin_regar++

        humedad = calculateDailyHumidity(humedad, dias_sin_regar, plant.frecuencia_riego)
        nutrientes = calculateDailyNutrients(nutrientes)
        salud = calculateHealthAfterEnvironment({
          salud,
          humedad,
          nutrientes,
          locationHealthDelta: locationEffect.healthDelta
        })
      }

      const estado_planta = determinePlantState(salud)
      const lastPrunedDay = plant.ultimo_poda ?? 0
      const pruningShouldActivate = shouldActivatePruning({
        pruningInterval,
        requierePodaActiva: plant.requiere_poda_activa,
        diasTranscurridos: dias_transcurridos,
        ultimoPoda: lastPrunedDay
      })

      updatePlantState(plant.id_registro, {
        humedad,
        salud,
        dias_sin_regar,
        dias_transcurridos,
        estado_planta,
        nutrientes,
        requiere_poda_activa: pruningShouldActivate ? 1 : plant.requiere_poda_activa
      })

      if (estado_planta === 'MUERTA' && plant.estado_planta !== 'MUERTA') {
        updateStats({ plantas_muertas: 1 })
        if (!streakEvent) streakEvent = resetStreakForPlantDeath()
      }

      results.push({
        id_registro: plant.id_registro,
        nombre_planta: plant.nombre_planta,
        estado_planta,
        salud: Math.round(salud),
        humedad: Math.round(humedad),
        nutrientes: Math.round(nutrientes),
        ubicacion: plant.ubicacion,
        luz_ubicacion: locationEffect.roomLight,
        luz_correcta: locationEffect.isCompatible,
        requiere_poda_activa: pruningShouldActivate ? 1 : plant.requiere_poda_activa
      })
    }
  })

  const progress = getProgress()
  updateProgress({ dia_actual: Math.max(1, (progress.dia_actual || 1) + safeDays) })

  checkAndGrantAchievements()
  return { results, streakEvent }
}

module.exports = {
  simulateDays
}
