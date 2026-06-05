const assert = require('assert/strict')

const { resetGame } = require('../../main/services/resetService')

function validateResetService() {
  const calls = []

  resetGame({
    clearUserPlants: () => calls.push({ method: 'clearUserPlants' }),
    statsRepository: {
      clearStats: () => calls.push({ method: 'clearStats' })
    },
    achievementRepository: {
      clearAchievements: () => calls.push({ method: 'clearAchievements' })
    },
    progressRepository: {
      resetProgress: () => calls.push({ method: 'resetProgress' })
    },
    resetSessionState: () => calls.push({ method: 'resetSessionState' })
  })

  assert.deepEqual(calls, [
    { method: 'clearUserPlants' },
    { method: 'clearStats' },
    { method: 'clearAchievements' },
    { method: 'resetProgress' },
    { method: 'resetSessionState' }
  ])
}

module.exports = {
  validateResetService
}
