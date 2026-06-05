const assert = require('assert/strict')

const { completeDefenseGame } = require('../../main/services/minigameService')

function validateMinigameService() {
  const positiveCalls = []
  const positiveResult = completeDefenseGame({
    xpAmount: 450,
    addExperience: xpAmount => {
      positiveCalls.push({ method: 'addExperience', xpAmount })
      return { newXP: 300 }
    },
    updateStats: updates => positiveCalls.push({ method: 'updateStats', updates }),
    checkAndGrantAchievements: () => positiveCalls.push({ method: 'checkAndGrantAchievements' })
  })

  assert.deepEqual(positiveResult, {
    xpGained: 300,
    xpResult: { newXP: 300 }
  })
  assert.deepEqual(positiveCalls, [
    { method: 'addExperience', xpAmount: 300 },
    {
      method: 'updateStats',
      updates: {
        acciones_correctas: 1,
        acciones_correctas_hoy: 1,
        acciones_totales: 1
      }
    },
    { method: 'checkAndGrantAchievements' }
  ])

  const zeroCalls = []
  const zeroResult = completeDefenseGame({
    xpAmount: -20,
    addExperience: xpAmount => zeroCalls.push({ method: 'addExperience', xpAmount }),
    updateStats: updates => zeroCalls.push({ method: 'updateStats', updates }),
    checkAndGrantAchievements: () => zeroCalls.push({ method: 'checkAndGrantAchievements' })
  })

  assert.deepEqual(zeroResult, {
    xpGained: 0,
    xpResult: null
  })
  assert.deepEqual(zeroCalls, [
    { method: 'updateStats', updates: { acciones_totales: 1 } },
    { method: 'checkAndGrantAchievements' }
  ])
}

module.exports = {
  validateMinigameService
}
