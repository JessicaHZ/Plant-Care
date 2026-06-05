const ProfileDisplayUtils = {
  getAchievementTypeColor(type) {
    const typeColors = {
      PROGRESO: '#66bb6a',
      EDUCATIVO: '#42a5f5',
      RACHA: '#ffa726',
      EVALUACION: '#ab47bc'
    }

    return typeColors[type] || '#fff'
  },

  getRecommendationText(stats, patterns, defaultRecommendation) {
    const mainPattern = patterns
      .map(pattern => ({
        count: stats[pattern.statKey] || 0,
        message: pattern.message
      }))
      .sort((a, b) => b.count - a.count)[0]

    return mainPattern.count > 0
      ? mainPattern.message
      : defaultRecommendation
  },

  getProgressViewModel({ progress, levels }) {
    const maxLevel = levels[levels.length - 1]
    const level = Math.min(progress.nivel || 1, maxLevel.nivel)
    const xp = progress.experiencia || 0
    const levelData = levels.find(item => item.nivel === level) || maxLevel
    const nextLevel = levels.find(item => item.nivel === level + 1)
    const xpForCurrent = levelData.xpMin
    const xpForNext = nextLevel ? nextLevel.xpMin : xpForCurrent + 100
    const xpProgress = nextLevel
      ? ((xp - xpForCurrent) / (xpForNext - xpForCurrent)) * 100
      : 100

    return {
      level,
      xp,
      levelData,
      nextLevel,
      xpProgress,
      nextXpText: nextLevel
        ? `${xpForNext} XP para nivel ${nextLevel.nivel}`
        : 'Â¡Nivel mÃ¡ximo alcanzado!'
    }
  }
}

window.ProfileDisplayUtils = ProfileDisplayUtils
