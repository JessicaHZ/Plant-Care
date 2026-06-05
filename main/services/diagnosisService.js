function recordDiagnosisResult({
  wasCorrect,
  updateStats,
  addExperience,
  recordResponsibleCareSession,
  checkAndGrantAchievements
}) {
  if (!wasCorrect) {
    return { xpGained: 0 }
  }

  updateStats({ diagnosticos_correctos: 1 })
  const xpResult = addExperience(10)
  const streakEvent = recordResponsibleCareSession()
  checkAndGrantAchievements()

  return {
    xpGained: 10,
    xpResult,
    streakEvent
  }
}

module.exports = {
  recordDiagnosisResult
}
