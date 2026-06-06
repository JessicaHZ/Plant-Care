const { db } = require('../../database/connection')
const achievementRepository = require('../../database/repositories/achievementRepository')
const plantRepository = require('../../database/repositories/plantRepository')
const progressRepository = require('../../database/repositories/progressRepository')
const statsRepository = require('../../database/repositories/statsRepository')
const {
  checkAndGrantAchievements: checkAndGrantAchievementsFromService
} = require('../../services/achievementService')
const plantCollectionService = require('../../services/plantCollectionService')
const progressService = require('../../services/progressService')
const { sessionState } = require('../../services/sessionState')
const simulationService = require('../../services/simulationService')
const statsService = require('../../services/statsService')
const streakService = require('../../services/streakService')

function getProgress() {
  return progressService.getProgress(progressRepository)
}

function updateProgress(fields) {
  progressService.updateProgress(progressRepository, fields)
}

function getUserPlants() {
  return plantCollectionService.getUserPlants(plantRepository)
}

function updatePlantState(idRegistro, fields) {
  plantCollectionService.updatePlantState(plantRepository, idRegistro, fields)
}

function updateStats(updates) {
  statsService.updateStats(statsRepository, updates)
}

function resetStreakForPlantDeath() {
  return streakService.resetStreakForPlantDeath({
    sessionState,
    getProgress,
    updateProgress
  })
}

function checkAndGrantAchievements() {
  return checkAndGrantAchievementsFromService({
    achievementRepository,
    getProgress,
    getStats: () => statsService.getStats(statsRepository),
    getUserPlants
  })
}

function registerSimulationProgressHandlers({ registerHandler }) {
  registerHandler(
    'simulation:advance',
    (_event, days) => {
      const simulation = simulationService.simulateDays({
        daysToAdvance: days,
        getUserPlants,
        updatePlantState,
        updateStats,
        getProgress,
        updateProgress,
        resetStreakForPlantDeath,
        checkAndGrantAchievements,
        runInTransaction: callback => db.transaction(callback)()
      })
      return {
        success: true,
        results: simulation.results,
        streakEvent: simulation.streakEvent
      }
    },
    { success: false, error: 'Error en la simulacion' },
    'Error en simulacion:'
  )

  registerHandler(
    'simulation:getOfflineDays',
    () => {
      const days = progressService.getOfflineDays(progressRepository)
      return { success: true, days }
    },
    { success: true, days: 0 },
    'Error calculando dias offline:'
  )

  registerHandler(
    'progress:get',
    () => {
      const progress = getProgress()
      return { success: true, progress }
    },
    { success: false, error: 'Error cargando progreso' },
    'Error cargando progreso:'
  )

  registerHandler(
    'stats:get',
    () => {
      const stats = statsService.getStats(statsRepository)
      return { success: true, stats }
    },
    { success: false, error: 'Error cargando estadisticas' },
    'Error cargando estadisticas:'
  )

  registerHandler(
    'stats:fixWeekly',
    (_event, value) => {
      statsService.fixWeeklyCounter(statsRepository, value)
      return { success: true }
    },
    { success: false },
    'Error corrigiendo contador semanal:'
  )
}

module.exports = {
  registerSimulationProgressHandlers
}
