const achievementRepository = require('../../database/repositories/achievementRepository')
const progressRepository = require('../../database/repositories/progressRepository')
const { ACHIEVEMENTS } = require('../../domain/achievementDefinitions')
const {
  getAchievements,
  grantQuizPerfectAchievement
} = require('../../services/achievementService')
const progressService = require('../../services/progressService')

function registerAchievementHandlers({ registerHandler }) {
  registerHandler(
    'achievements:get',
    () => {
      const achievements = getAchievements(achievementRepository)
      return { success: true, achievements }
    },
    { success: false, achievements: [] },
    'Error cargando logros:'
  )

  registerHandler(
    'achievements:grantQuizPerfect',
    () => {
      grantQuizPerfectAchievement({
        achievementRepository,
        achievement: ACHIEVEMENTS.quiz_perfecto,
        getProgress: () => progressService.getProgress(progressRepository)
      })
      return { success: true }
    },
    { success: false },
    'Error otorgando logro de quiz perfecto:'
  )
}

module.exports = {
  registerAchievementHandlers
}
