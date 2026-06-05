function resetGame({
  clearUserPlants,
  statsRepository,
  achievementRepository,
  progressRepository,
  resetSessionState
}) {
  clearUserPlants()
  statsRepository.clearStats()
  achievementRepository.clearAchievements()
  progressRepository.resetProgress()
  resetSessionState()
}

module.exports = {
  resetGame
}
