const sessionState = {
  responsibleCareAwardedThisSession: false,
  streakBlockedThisSession: false
}

function resetSessionState() {
  sessionState.responsibleCareAwardedThisSession = false
  sessionState.streakBlockedThisSession = false
}

module.exports = {
  resetSessionState,
  sessionState
}
