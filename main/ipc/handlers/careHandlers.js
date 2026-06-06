const achievementRepository = require('../../database/repositories/achievementRepository')
const plantRepository = require('../../database/repositories/plantRepository')
const progressRepository = require('../../database/repositories/progressRepository')
const statsRepository = require('../../database/repositories/statsRepository')
const {
  checkAndGrantAchievements: checkAndGrantAchievementsFromService
} = require('../../services/achievementService')
const careService = require('../../services/careService')
const diagnosisService = require('../../services/diagnosisService')
const progressService = require('../../services/progressService')
const { sessionState } = require('../../services/sessionState')
const statsService = require('../../services/statsService')
const streakService = require('../../services/streakService')

function getProgress() {
  return progressService.getProgress(progressRepository)
}

function updateProgress(fields) {
  progressService.updateProgress(progressRepository, fields)
}

function getStats() {
  return statsService.getStats(statsRepository)
}

function updateStats(updates) {
  statsService.updateStats(statsRepository, updates)
}

function updatePlantState(idRegistro, fields) {
  plantRepository.updatePlantState(idRegistro, fields)
}

function addExperience(xpAmount) {
  return progressService.addExperience(progressRepository, xpAmount)
}

function recordResponsibleCareSession() {
  return streakService.recordResponsibleCareSession({
    sessionState,
    getProgress,
    updateProgress
  })
}

function checkAndGrantAchievements() {
  return checkAndGrantAchievementsFromService({
    achievementRepository,
    getProgress,
    getStats,
    getUserPlants: plantRepository.getUserPlants
  })
}

function createCareContext(idRegistro) {
  return {
    idRegistro,
    plantRepository,
    updateStats,
    updatePlantState,
    addExperience,
    recordResponsibleCareSession,
    checkAndGrantAchievements
  }
}

function registerCareHandlers({ registerHandler }) {
  registerHandler(
    'care:water',
    (_event, id_registro) => careService.waterPlant(createCareContext(id_registro)),
    { success: false, error: 'Error al regar' },
    'Error en riego:'
  )

  registerHandler(
    'care:fertilize',
    (_event, id_registro) => careService.fertilizePlant(createCareContext(id_registro)),
    { success: false, error: 'Error al abonar' },
    'Error en abono:'
  )

  registerHandler(
    'care:prune',
    (_event, id_registro) => careService.prunePlant({
      ...createCareContext(id_registro),
      getProgress
    }),
    { success: false, error: 'Error al podar' },
    'Error en poda:'
  )

  registerHandler(
    'care:drain',
    (_event, id_registro) => careService.drainPlant(createCareContext(id_registro)),
    { success: false, error: 'Error al drenar' },
    'Error en drenaje:'
  )

  registerHandler(
    'diagnosis:submit',
    (_event, wasCorrect) => {
      const result = diagnosisService.recordDiagnosisResult({
        wasCorrect,
        updateStats,
        addExperience,
        recordResponsibleCareSession,
        checkAndGrantAchievements
      })
      return { success: true, ...result }
    },
    { success: false, error: 'Error registrando diagnostico' },
    'Error en diagnostico:'
  )
}

module.exports = {
  registerCareHandlers
}
