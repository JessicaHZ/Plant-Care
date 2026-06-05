const {
  MAX_PLAYER_LEVEL,
  calculateProgressAfterExperience
} = require('../domain/progressRules')

const OFFLINE_DAY_MS = 10 * 60 * 1000
const MAX_OFFLINE_DAYS = 3

function calculateOfflineDays({ lastClose, currentTime = Date.now() }) {
  if (!lastClose) return 0

  const elapsed = currentTime - lastClose
  const rawDays = Math.floor(elapsed / OFFLINE_DAY_MS)

  return Math.min(rawDays, MAX_OFFLINE_DAYS)
}

function saveLastClose(progressRepository, timestamp = Date.now()) {
  progressRepository.saveLastClose(timestamp)
}

function getOfflineDays(progressRepository, currentTime = Date.now()) {
  const progress = progressRepository.getProgress()
  return calculateOfflineDays({
    lastClose: progress?.ultimo_cierre,
    currentTime
  })
}

function getProgress(progressRepository) {
  const progress = progressRepository.getProgress()
  if (!progress) return progressRepository.createInitialProgress()

  if (progress.nivel > MAX_PLAYER_LEVEL) {
    progressRepository.updateProgress({ nivel: MAX_PLAYER_LEVEL })
    return { ...progress, nivel: MAX_PLAYER_LEVEL }
  }

  return progress
}

function updateProgress(progressRepository, fields) {
  progressRepository.updateProgress(fields)
}

function migrateCurrentDayFromPlantState({ progressRepository, plantRepository }) {
  const progress = progressRepository.getProgress()
  if (!progress || progress.dia_actual > 1) return false

  const maxDay = plantRepository.getMaxUserPlantElapsedDays()
  if (maxDay <= 0) return false

  progressRepository.updateProgress({ dia_actual: maxDay + 1 })
  return true
}

function addExperience(progressRepository, xpAmount) {
  const currentProgress = progressRepository.getProgress()
  const progressResult = calculateProgressAfterExperience(currentProgress, xpAmount)

  progressRepository.updateProgress({
    experiencia: progressResult.experiencia,
    nivel: progressResult.nivel
  })

  return {
    newXP: progressResult.experiencia,
    newLevel: progressResult.nivel,
    leveledUp: progressResult.leveledUp
  }
}

function isTutorialCompleted(progressRepository) {
  return progressRepository.isTutorialCompleted()
}

function completeTutorial(progressRepository) {
  progressRepository.completeTutorial()
}

function resetTutorial(progressRepository) {
  progressRepository.resetTutorial()
}

module.exports = {
  OFFLINE_DAY_MS,
  MAX_OFFLINE_DAYS,
  calculateOfflineDays,
  getProgress,
  updateProgress,
  migrateCurrentDayFromPlantState,
  saveLastClose,
  getOfflineDays,
  addExperience,
  isTutorialCompleted,
  completeTutorial,
  resetTutorial
}
