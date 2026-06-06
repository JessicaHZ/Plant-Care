const achievementRepository = require('../../database/repositories/achievementRepository')
const plantRepository = require('../../database/repositories/plantRepository')
const progressRepository = require('../../database/repositories/progressRepository')
const statsRepository = require('../../database/repositories/statsRepository')
const progressService = require('../../services/progressService')
const resetService = require('../../services/resetService')
const { resetSessionState } = require('../../services/sessionState')

function registerTutorialResetHandlers({ registerHandler }) {
  registerHandler(
    'tutorial:isCompleted',
    () => {
      const completed = progressService.isTutorialCompleted(progressRepository)
      return { success: true, completed }
    },
    { success: true, completed: false },
    'Error consultando estado del tutorial:'
  )

  registerHandler(
    'tutorial:complete',
    () => {
      progressService.completeTutorial(progressRepository)
      return { success: true }
    },
    { success: false },
    'Error completando tutorial:'
  )

  registerHandler(
    'tutorial:reset',
    () => {
      progressService.resetTutorial(progressRepository)
      return { success: true }
    },
    { success: false },
    'Error reiniciando tutorial:'
  )

  registerHandler(
    'game:reset',
    () => {
      resetService.resetGame({
        clearUserPlants: plantRepository.clearUserPlants,
        statsRepository,
        achievementRepository,
        progressRepository,
        resetSessionState
      })
      return { success: true }
    },
    { success: false },
    'Error reiniciando partida:'
  )
}

module.exports = {
  registerTutorialResetHandlers
}
