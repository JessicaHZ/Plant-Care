const assert = require('assert/strict')

const {
  recordResponsibleCareSession,
  resetStreakForPlantDeath
} = require('../../main/services/streakService')

function createContext(progress = { racha_dias: 2 }) {
  const calls = []
  const sessionState = {
    responsibleCareAwardedThisSession: false,
    streakBlockedThisSession: false
  }

  return {
    calls,
    sessionState,
    context: {
      sessionState,
      getProgress: () => {
        calls.push({ method: 'getProgress' })
        return progress
      },
      updateProgress: fields => calls.push({ method: 'updateProgress', fields })
    }
  }
}

function validateStreakService() {
  const care = createContext()
  assert.deepEqual(
    recordResponsibleCareSession(care.context),
    {
      changed: true,
      newStreak: 3,
      message: 'Racha de cuidado aumentada'
    }
  )
  assert.equal(care.sessionState.responsibleCareAwardedThisSession, true)
  assert.deepEqual(care.calls, [
    { method: 'getProgress' },
    { method: 'updateProgress', fields: { racha_dias: 3 } }
  ])

  assert.deepEqual(
    recordResponsibleCareSession(care.context),
    { changed: false, reason: 'already_awarded' }
  )

  const death = createContext({ racha_dias: 2 })
  assert.deepEqual(
    resetStreakForPlantDeath(death.context),
    {
      changed: true,
      newStreak: 0,
      message: 'Perdiste la racha porque una planta murió'
    }
  )
  assert.equal(death.sessionState.streakBlockedThisSession, true)
  assert.equal(death.sessionState.responsibleCareAwardedThisSession, false)
  assert.deepEqual(death.calls, [
    { method: 'getProgress' },
    { method: 'updateProgress', fields: { racha_dias: 0 } }
  ])

  assert.deepEqual(
    recordResponsibleCareSession(death.context),
    { changed: false, reason: 'blocked' }
  )
}

module.exports = {
  validateStreakService
}
