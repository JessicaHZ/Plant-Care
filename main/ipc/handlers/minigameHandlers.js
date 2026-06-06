const {
  addExperience,
  checkAndGrantAchievements,
  updateStats
} = require('../handlerDependencies')
const minigameService = require('../../services/minigameService')
const quizService = require('../../services/quizService')

function registerMinigameHandlers({ registerHandler }) {
  registerHandler(
    'quiz:submit',
    (_event, correct) => {
      const xpResult = quizService.recordQuizResult({
        correct,
        updateStats,
        addExperience,
        checkAndGrantAchievements
      })
      return { success: true, xpResult }
    },
    { success: false, error: 'Error registrando resultado del quiz' },
    'Error en quiz:'
  )

  registerHandler(
    'minigame:defense:complete',
    (_event, xpAmount) => {
      const result = minigameService.completeDefenseGame({
        xpAmount,
        addExperience,
        updateStats,
        checkAndGrantAchievements
      })
      return { success: true, ...result }
    },
    { success: false, error: 'Error en Defensa del Brote' },
    'Error en Defensa del Brote:'
  )
}

module.exports = {
  registerMinigameHandlers
}
