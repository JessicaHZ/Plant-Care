const MAX_PLAYER_LEVEL = 5

function calculateLevelFromExperience(experience) {
  const calculatedLevel = Math.floor(experience / 100) + 1
  return Math.min(MAX_PLAYER_LEVEL, calculatedLevel)
}

function calculateProgressAfterExperience(currentProgress, xpAmount) {
  const newExperience = currentProgress.experiencia + xpAmount
  const newLevel = calculateLevelFromExperience(newExperience)

  return {
    experiencia: newExperience,
    nivel: newLevel,
    leveledUp: newLevel > currentProgress.nivel
  }
}

module.exports = {
  MAX_PLAYER_LEVEL,
  calculateLevelFromExperience,
  calculateProgressAfterExperience
}
