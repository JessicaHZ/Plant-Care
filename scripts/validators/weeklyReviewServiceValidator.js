const assert = require('assert/strict')

const {
  getTopWeeklyActions,
  normalizeWeeklyReviewPayload,
  recordWeeklyReview,
  resolveReviewedWeek,
  shouldTriggerWeeklyReview
} = require('../../main/services/weeklyReviewService')

function validateWeeklyReviewService() {
  const topActions = getTopWeeklyActions({
    errores_riego_semana: 2,
    errores_abono_semana: 5,
    errores_poda_semana: 1,
    errores_ubicacion_semana: 4
  })

  assert.deepEqual(
    topActions.map(action => action.key),
    ['abono', 'ubicacion', 'riego']
  )
  assert.deepEqual(getTopWeeklyActions(null), [])

  assert.equal(
    shouldTriggerWeeklyReview({
      currentDay: 6,
      stats: { semana_simulada_actual: 0 }
    }),
    false
  )
  assert.equal(
    shouldTriggerWeeklyReview({
      currentDay: 7,
      stats: { semana_simulada_actual: 0 }
    }),
    true
  )
  assert.equal(
    shouldTriggerWeeklyReview({
      currentDay: 14,
      stats: { semana_simulada_actual: 2 }
    }),
    false
  )

  assert.equal(
    resolveReviewedWeek({
      reviewedWeek: 3,
      progress: { dia_actual: 10 },
      stats: { semana_simulada_actual: 1 }
    }),
    3
  )
  assert.equal(
    resolveReviewedWeek({
      reviewedWeek: null,
      progress: { dia_actual: 15 },
      stats: { semana_simulada_actual: 1 }
    }),
    2
  )
  assert.equal(
    resolveReviewedWeek({
      reviewedWeek: 1,
      progress: { dia_actual: 30 },
      stats: { semana_simulada_actual: 4 }
    }),
    4
  )
  assert.deepEqual(
    normalizeWeeklyReviewPayload({ wasCorrect: true, reviewedWeek: 3 }),
    { wasCorrect: true, reviewedWeek: 3 }
  )
  assert.deepEqual(
    normalizeWeeklyReviewPayload(false),
    { wasCorrect: false, reviewedWeek: null }
  )

  const incorrectCalls = []
  const incorrectResult = recordWeeklyReview({
    wasCorrect: false,
    reviewedWeek: 2,
    statsRepository: { id: 'statsRepository' },
    achievementRepository: { getAchievementIds: () => [] },
    evaluationAchievement: { id: 'evaluacion_correcta' },
    getStats: () => {
      incorrectCalls.push({ method: 'getStats' })
      return { semana_simulada_actual: 1 }
    },
    getProgress: () => {
      incorrectCalls.push({ method: 'getProgress' })
      return { dia_actual: 15, nivel: 2 }
    },
    resetWeeklyCounters: (repository, currentWeek) => incorrectCalls.push({
      method: 'resetWeeklyCounters',
      repository,
      currentWeek
    }),
    grantAchievement: payload => incorrectCalls.push({ method: 'grantAchievement', payload }),
    addExperience: xpAmount => incorrectCalls.push({ method: 'addExperience', xpAmount })
  })
  assert.equal(incorrectResult, null)
  assert.deepEqual(incorrectCalls, [
    { method: 'getStats' },
    { method: 'getProgress' },
    {
      method: 'resetWeeklyCounters',
      repository: { id: 'statsRepository' },
      currentWeek: 2
    }
  ])

  const correctCalls = []
  const achievementRepository = {
    getAchievementIds: () => {
      correctCalls.push({ method: 'getAchievementIds' })
      return []
    }
  }
  const evaluationAchievement = { id: 'evaluacion_correcta', nombre: 'Evaluador Reflexivo' }
  const correctResult = recordWeeklyReview({
    wasCorrect: true,
    reviewedWeek: null,
    statsRepository: { id: 'statsRepository' },
    achievementRepository,
    evaluationAchievement,
    getStats: () => {
      correctCalls.push({ method: 'getStats' })
      return { semana_simulada_actual: 1 }
    },
    getProgress: () => {
      correctCalls.push({ method: 'getProgress' })
      return { dia_actual: 15, nivel: 2 }
    },
    resetWeeklyCounters: (repository, currentWeek) => correctCalls.push({
      method: 'resetWeeklyCounters',
      repository,
      currentWeek
    }),
    grantAchievement: payload => correctCalls.push({ method: 'grantAchievement', payload }),
    addExperience: xpAmount => {
      correctCalls.push({ method: 'addExperience', xpAmount })
      return { leveledUp: false }
    }
  })
  assert.deepEqual(correctResult, { leveledUp: false })
  assert.deepEqual(correctCalls, [
    { method: 'getStats' },
    { method: 'getProgress' },
    {
      method: 'resetWeeklyCounters',
      repository: { id: 'statsRepository' },
      currentWeek: 2
    },
    { method: 'getAchievementIds' },
    { method: 'getProgress' },
    {
      method: 'grantAchievement',
      payload: {
        achievementRepository,
        achievement: evaluationAchievement,
        progress: { dia_actual: 15, nivel: 2 },
        existingIds: []
      }
    },
    { method: 'addExperience', xpAmount: 25 }
  ])
}

module.exports = {
  validateWeeklyReviewService
}
