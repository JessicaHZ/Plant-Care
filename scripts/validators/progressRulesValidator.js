const assert = require('assert/strict')

const {
  MAX_PLAYER_LEVEL,
  calculateLevelFromExperience,
  calculateProgressAfterExperience
} = require('../../main/domain/progressRules')

function validateProgressRules() {
  assert.equal(MAX_PLAYER_LEVEL, 5)
  assert.equal(calculateLevelFromExperience(0), 1)
  assert.equal(calculateLevelFromExperience(99), 1)
  assert.equal(calculateLevelFromExperience(100), 2)
  assert.equal(calculateLevelFromExperience(400), 5)
  assert.equal(calculateLevelFromExperience(900), 5)

  assert.deepEqual(
    calculateProgressAfterExperience({ experiencia: 90, nivel: 1 }, 15),
    {
      experiencia: 105,
      nivel: 2,
      leveledUp: true
    }
  )
  assert.deepEqual(
    calculateProgressAfterExperience({ experiencia: 450, nivel: 5 }, 100),
    {
      experiencia: 550,
      nivel: 5,
      leveledUp: false
    }
  )
}

module.exports = {
  validateProgressRules
}
