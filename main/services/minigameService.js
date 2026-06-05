const { clampInteger } = require('../utils/number-utils')

function completeDefenseGame({
  xpAmount,
  addExperience,
  updateStats,
  checkAndGrantAchievements
}) {
  const safeXp = clampInteger(xpAmount, 0, 300)
  const xpResult = safeXp > 0 ? addExperience(safeXp) : null

  updateStats(
    safeXp > 0
      ? { acciones_correctas: 1, acciones_correctas_hoy: 1, acciones_totales: 1 }
      : { acciones_totales: 1 }
  )
  checkAndGrantAchievements()

  return {
    xpGained: safeXp,
    xpResult
  }
}

module.exports = {
  completeDefenseGame
}
