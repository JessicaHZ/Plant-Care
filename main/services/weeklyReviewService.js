function getTopWeeklyActions(stats) {
  if (!stats) return []

  const actions = [
    {
      key: 'riego',
      label: 'Riego excesivo o prematuro',
      errorCount: stats.errores_riego_semana,
      explanation: 'El exceso de riego deja a las raices sin aire. Observa la tierra antes de volver a regar.'
    },
    {
      key: 'abono',
      label: 'Abono innecesario',
      errorCount: stats.errores_abono_semana,
      explanation: 'El abono ayuda cuando la planta lo necesita. Usarlo de mas puede estresar las raices.'
    },
    {
      key: 'poda',
      label: 'Poda incorrecta',
      errorCount: stats.errores_poda_semana,
      explanation: 'La poda debe tener proposito: retirar partes secas o controlar crecimiento.'
    },
    {
      key: 'ubicacion',
      label: 'Mala ubicacion',
      errorCount: stats.errores_ubicacion_semana,
      explanation: 'La ubicacion cambia la luz que recibe la planta. Un mal lugar la debilita poco a poco.'
    }
  ]

  return actions
    .sort((a, b) => b.errorCount - a.errorCount)
    .slice(0, 3)
}

function getCurrentWeek(currentDay) {
  return Math.floor(currentDay / 7)
}

function shouldTriggerWeeklyReview({ currentDay, stats }) {
  if (currentDay < 7 || !stats) return false

  const currentWeek = getCurrentWeek(currentDay)
  const lastReviewedWeek = stats.semana_simulada_actual ?? 0

  return currentWeek > lastReviewedWeek
}

function resolveReviewedWeek({ reviewedWeek, progress, stats }) {
  const parsedReviewedWeek = Number(reviewedWeek)
  let currentWeek = Number.isFinite(parsedReviewedWeek) && parsedReviewedWeek > 0
    ? Math.floor(parsedReviewedWeek)
    : null

  if (currentWeek === null) {
    currentWeek = getCurrentWeek(progress?.dia_actual || 1)
  }

  const lastReviewedWeek = stats?.semana_simulada_actual ?? 0
  return Math.max(currentWeek, lastReviewedWeek)
}

function normalizeWeeklyReviewPayload(payload) {
  if (typeof payload === 'object' && payload !== null) {
    return {
      wasCorrect: payload.wasCorrect,
      reviewedWeek: payload.reviewedWeek
    }
  }

  return {
    wasCorrect: payload,
    reviewedWeek: null
  }
}

function recordWeeklyReview({
  wasCorrect,
  reviewedWeek = null,
  statsRepository,
  achievementRepository,
  evaluationAchievement,
  getStats,
  getProgress,
  resetWeeklyCounters,
  grantAchievement,
  addExperience
}) {
  const stats = getStats()
  const progress = getProgress()
  const currentWeek = resolveReviewedWeek({ reviewedWeek, progress, stats })

  resetWeeklyCounters(statsRepository, currentWeek)

  if (!wasCorrect) return null

  const existingIds = achievementRepository.getAchievementIds()

  if (!existingIds.includes(evaluationAchievement.id)) {
    const progress = getProgress()
    grantAchievement({
      achievementRepository,
      achievement: evaluationAchievement,
      progress,
      existingIds
    })
  }

  return addExperience(25)
}

module.exports = {
  getTopWeeklyActions,
  normalizeWeeklyReviewPayload,
  recordWeeklyReview,
  shouldTriggerWeeklyReview,
  resolveReviewedWeek
}
