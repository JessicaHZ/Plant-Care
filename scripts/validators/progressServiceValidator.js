const assert = require('assert/strict')

const {
  MAX_OFFLINE_DAYS,
  OFFLINE_DAY_MS,
  addExperience,
  calculateOfflineDays,
  completeTutorial,
  getOfflineDays,
  getProgress,
  isTutorialCompleted,
  migrateCurrentDayFromPlantState,
  resetTutorial,
  saveLastClose,
  updateProgress
} = require('../../main/services/progressService')

function validateProgressService() {
  assert.equal(OFFLINE_DAY_MS, 10 * 60 * 1000)
  assert.equal(MAX_OFFLINE_DAYS, 3)

  assert.equal(calculateOfflineDays({ lastClose: null, currentTime: 1000 }), 0)
  assert.equal(calculateOfflineDays({ lastClose: 1000, currentTime: 1000 + OFFLINE_DAY_MS - 1 }), 0)
  assert.equal(calculateOfflineDays({ lastClose: 1000, currentTime: 1000 + OFFLINE_DAY_MS }), 1)
  assert.equal(calculateOfflineDays({ lastClose: 1000, currentTime: 1000 + (2 * OFFLINE_DAY_MS) }), 2)
  assert.equal(calculateOfflineDays({ lastClose: 1000, currentTime: 1000 + (10 * OFFLINE_DAY_MS) }), 3)

  const savedTimestamps = []
  const progressRepository = {
    getProgress: () => ({ ultimo_cierre: 1000 }),
    saveLastClose: timestamp => savedTimestamps.push(timestamp)
  }

  assert.equal(getOfflineDays(progressRepository, 1000 + (2 * OFFLINE_DAY_MS)), 2)
  saveLastClose(progressRepository, 5000)
  assert.deepEqual(savedTimestamps, [5000])

  const progressUpdates = []
  const xpRepository = {
    getProgress: () => ({ experiencia: 90, nivel: 1 }),
    updateProgress: fields => progressUpdates.push(fields)
  }

  assert.deepEqual(
    addExperience(xpRepository, 15),
    {
      newXP: 105,
      newLevel: 2,
      leveledUp: true
    }
  )
  assert.deepEqual(progressUpdates, [{ experiencia: 105, nivel: 2 }])

  const initialRepository = {
    getProgress: () => null,
    createInitialProgress: () => ({ experiencia: 0, nivel: 1, racha_dias: 0 })
  }
  assert.deepEqual(getProgress(initialRepository), { experiencia: 0, nivel: 1, racha_dias: 0 })

  const cappedUpdates = []
  const cappedRepository = {
    getProgress: () => ({ experiencia: 999, nivel: 9, racha_dias: 0 }),
    updateProgress: fields => cappedUpdates.push(fields)
  }
  assert.deepEqual(getProgress(cappedRepository), { experiencia: 999, nivel: 5, racha_dias: 0 })
  assert.deepEqual(cappedUpdates, [{ nivel: 5 }])

  updateProgress(cappedRepository, { dia_actual: 4 })
  assert.deepEqual(cappedUpdates, [{ nivel: 5 }, { dia_actual: 4 }])

  const migrationUpdates = []
  const migrationRepository = {
    getProgress: () => ({ dia_actual: 1 }),
    updateProgress: fields => migrationUpdates.push(fields)
  }
  assert.equal(
    migrateCurrentDayFromPlantState({
      progressRepository: migrationRepository,
      plantRepository: { getMaxUserPlantElapsedDays: () => 6 }
    }),
    true
  )
  assert.deepEqual(migrationUpdates, [{ dia_actual: 7 }])

  assert.equal(
    migrateCurrentDayFromPlantState({
      progressRepository: { getProgress: () => null },
      plantRepository: { getMaxUserPlantElapsedDays: () => 6 }
    }),
    false
  )
  assert.equal(
    migrateCurrentDayFromPlantState({
      progressRepository: { getProgress: () => ({ dia_actual: 3 }) },
      plantRepository: { getMaxUserPlantElapsedDays: () => 6 }
    }),
    false
  )
  assert.equal(
    migrateCurrentDayFromPlantState({
      progressRepository: { getProgress: () => ({ dia_actual: 1 }) },
      plantRepository: { getMaxUserPlantElapsedDays: () => 0 }
    }),
    false
  )

  const tutorialCalls = []
  const tutorialRepository = {
    isTutorialCompleted: () => true,
    completeTutorial: () => tutorialCalls.push('complete'),
    resetTutorial: () => tutorialCalls.push('reset')
  }

  assert.equal(isTutorialCompleted(tutorialRepository), true)
  completeTutorial(tutorialRepository)
  resetTutorial(tutorialRepository)
  assert.deepEqual(tutorialCalls, ['complete', 'reset'])
}

module.exports = {
  validateProgressService
}
