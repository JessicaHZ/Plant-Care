function recordResponsibleCareSession({ sessionState, getProgress, updateProgress }) {
  if (sessionState.streakBlockedThisSession) {
    return { changed: false, reason: 'blocked' }
  }
  if (sessionState.responsibleCareAwardedThisSession) {
    return { changed: false, reason: 'already_awarded' }
  }

  const progress = getProgress()
  const newStreak = progress.racha_dias + 1
  updateProgress({ racha_dias: newStreak })
  sessionState.responsibleCareAwardedThisSession = true

  return {
    changed: true,
    newStreak,
    message: 'Racha de cuidado aumentada'
  }
}

function resetStreakForPlantDeath({ sessionState, getProgress, updateProgress }) {
  const progress = getProgress()
  updateProgress({ racha_dias: 0 })
  sessionState.streakBlockedThisSession = true
  sessionState.responsibleCareAwardedThisSession = false

  return {
    changed: progress.racha_dias > 0,
    newStreak: 0,
    message: 'Perdiste la racha porque una planta murió'
  }
}

module.exports = {
  recordResponsibleCareSession,
  resetStreakForPlantDeath
}
