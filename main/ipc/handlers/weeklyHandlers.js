const achievementRepository = require('../../database/repositories/achievementRepository')
const statsRepository = require('../../database/repositories/statsRepository')
const { ACHIEVEMENTS } = require('../../domain/achievementDefinitions')
const {
  addExperience,
  getProgress,
  getStats
} = require('../handlerDependencies')
const {
  getTopWeeklyActions,
  normalizeWeeklyReviewPayload,
  recordWeeklyReview,
  shouldTriggerWeeklyReview
} = require('../../services/weeklyReviewService')
const {
  grantAchievement
} = require('../../services/achievementService')
const statsService = require('../../services/statsService')

function registerWeeklyHandlers({ registerHandler }) {
  registerHandler(
    'weekly:getTopActions',
    () => {
      const actions = getTopWeeklyActions(getStats())
      return { success: true, actions }
    },
    { success: false, error: 'Error cargando acciones de revision' },
    'Error cargando acciones:'
  )

  registerHandler(
    'weekly:submit',
    (_event, payload) => {
      const { wasCorrect, reviewedWeek } = normalizeWeeklyReviewPayload(payload)
      const xpResult = recordWeeklyReview({
        wasCorrect,
        reviewedWeek,
        statsRepository,
        achievementRepository,
        evaluationAchievement: ACHIEVEMENTS.evaluacion_correcta,
        getStats,
        getProgress,
        resetWeeklyCounters: statsService.resetWeeklyCounters,
        grantAchievement,
        addExperience
      })
      return { success: true, xpResult, xpGained: wasCorrect ? 25 : 0 }
    },
    { success: false, error: 'Error registrando revision' },
    'Error registrando revision semanal:'
  )

  registerHandler(
    'weekly:shouldTrigger',
    (_event, currentDay) => {
      const should = shouldTriggerWeeklyReview({
        currentDay,
        stats: getStats()
      })
      return { success: true, should }
    },
    { success: false, should: false },
    'Error verificando revision semanal:'
  )
}

module.exports = {
  registerWeeklyHandlers
}
