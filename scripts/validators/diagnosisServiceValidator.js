const assert = require('assert/strict')

const { recordDiagnosisResult } = require('../../main/services/diagnosisService')

function validateDiagnosisService() {
  const correctCalls = []
  const correctResult = recordDiagnosisResult({
    wasCorrect: true,
    updateStats: updates => correctCalls.push({ method: 'updateStats', updates }),
    addExperience: xpAmount => {
      correctCalls.push({ method: 'addExperience', xpAmount })
      return { leveledUp: false }
    },
    recordResponsibleCareSession: () => {
      correctCalls.push({ method: 'recordResponsibleCareSession' })
      return { changed: true, newStreak: 2 }
    },
    checkAndGrantAchievements: () => correctCalls.push({ method: 'checkAndGrantAchievements' })
  })

  assert.deepEqual(correctResult, {
    xpGained: 10,
    xpResult: { leveledUp: false },
    streakEvent: { changed: true, newStreak: 2 }
  })
  assert.deepEqual(correctCalls, [
    { method: 'updateStats', updates: { diagnosticos_correctos: 1 } },
    { method: 'addExperience', xpAmount: 10 },
    { method: 'recordResponsibleCareSession' },
    { method: 'checkAndGrantAchievements' }
  ])

  const incorrectCalls = []
  assert.deepEqual(
    recordDiagnosisResult({
      wasCorrect: false,
      updateStats: updates => incorrectCalls.push({ method: 'updateStats', updates }),
      addExperience: xpAmount => incorrectCalls.push({ method: 'addExperience', xpAmount }),
      recordResponsibleCareSession: () => incorrectCalls.push({ method: 'recordResponsibleCareSession' }),
      checkAndGrantAchievements: () => incorrectCalls.push({ method: 'checkAndGrantAchievements' })
    }),
    { xpGained: 0 }
  )
  assert.deepEqual(incorrectCalls, [])
}

module.exports = {
  validateDiagnosisService
}
