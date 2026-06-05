const assert = require('assert/strict')

const {
  calculateQuizResult,
  recordQuizResult
} = require('../../main/services/quizService')

function validateQuizService() {
  assert.deepEqual(
    calculateQuizResult(true),
    {
      xpGained: 8,
      shouldGrantAchievements: true,
      statsUpdates: {
        acciones_correctas: 1,
        acciones_correctas_hoy: 1,
        acciones_totales: 1
      }
    }
  )

  assert.deepEqual(
    calculateQuizResult(false),
    {
      xpGained: 0,
      shouldGrantAchievements: false,
      statsUpdates: {
        acciones_totales: 1
      }
    }
  )

  const correctCalls = []
  const correctResult = recordQuizResult({
    correct: true,
    updateStats: updates => correctCalls.push({ method: 'updateStats', updates }),
    addExperience: xpAmount => {
      correctCalls.push({ method: 'addExperience', xpAmount })
      return { leveledUp: false }
    },
    checkAndGrantAchievements: () => correctCalls.push({ method: 'checkAndGrantAchievements' })
  })
  assert.deepEqual(correctResult, { leveledUp: false })
  assert.deepEqual(correctCalls, [
    {
      method: 'updateStats',
      updates: {
        acciones_correctas: 1,
        acciones_correctas_hoy: 1,
        acciones_totales: 1
      }
    },
    { method: 'addExperience', xpAmount: 8 },
    { method: 'checkAndGrantAchievements' }
  ])

  const incorrectCalls = []
  const incorrectResult = recordQuizResult({
    correct: false,
    updateStats: updates => incorrectCalls.push({ method: 'updateStats', updates }),
    addExperience: xpAmount => incorrectCalls.push({ method: 'addExperience', xpAmount }),
    checkAndGrantAchievements: () => incorrectCalls.push({ method: 'checkAndGrantAchievements' })
  })
  assert.equal(incorrectResult, null)
  assert.deepEqual(incorrectCalls, [
    { method: 'updateStats', updates: { acciones_totales: 1 } }
  ])
}

module.exports = {
  validateQuizService
}
