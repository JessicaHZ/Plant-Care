function calculateQuizResult(correct) {
  if (correct) {
    return {
      xpGained: 8,
      shouldGrantAchievements: true,
      statsUpdates: {
        acciones_correctas: 1,
        acciones_correctas_hoy: 1,
        acciones_totales: 1
      }
    }
  }

  return {
    xpGained: 0,
    shouldGrantAchievements: false,
    statsUpdates: {
      acciones_totales: 1
    }
  }
}

function recordQuizResult({
  correct,
  updateStats,
  addExperience,
  checkAndGrantAchievements
}) {
  const quizResult = calculateQuizResult(correct)
  updateStats(quizResult.statsUpdates)

  if (quizResult.xpGained <= 0) return null

  const xpResult = addExperience(quizResult.xpGained)
  if (quizResult.shouldGrantAchievements) {
    checkAndGrantAchievements()
  }

  return xpResult
}

module.exports = {
  calculateQuizResult,
  recordQuizResult
}
