const assert = require('assert/strict')

const EXPECTED_DATABASE_EXPORTS = [
  'acquirePlant',
  'addExperience',
  'checkAndGrantAchievements',
  'clearUserPlants',
  'completeDefenseGame',
  'completeTutorial',
  'deletePlant',
  'drainPlant',
  'fertilizePlant',
  'fixWeeklyCounter',
  'getAchievements',
  'getAllPlants',
  'getOfflineDays',
  'getPlantById',
  'getProgress',
  'getStats',
  'getTopActions',
  'getUserPlants',
  'grantQuizPerfectAchievement',
  'initializeDatabase',
  'isTutorialCompleted',
  'normalizeWeeklyReview',
  'placePlantInRoom',
  'prunePlant',
  'recordDiagnosisResult',
  'recordQuizResult',
  'recordResponsibleCareSession',
  'recordWeeklyReview',
  'resetGame',
  'resetTutorial',
  'returnPlantToPanel',
  'saveLastClose',
  'shouldTriggerWeeklyReview',
  'simulateDays',
  'updatePlantState',
  'updateProgress',
  'updateStats',
  'updateStreak',
  'waterPlant'
]

function validateDatabaseFacade() {
  const database = require('../../main/database')
  const actualExports = Object.keys(database).sort()

  assert.deepEqual(
    actualExports,
    [...EXPECTED_DATABASE_EXPORTS].sort(),
    'database.js debe conservar su contrato publico de fachada'
  )

  for (const exportName of EXPECTED_DATABASE_EXPORTS) {
    assert.equal(typeof database[exportName], 'function', `${exportName} debe exportarse como funcion`)
  }
}

module.exports = {
  validateDatabaseFacade
}
