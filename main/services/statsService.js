const WEEKLY_ERROR_FIELDS = {
  errores_riego: 'errores_riego_semana',
  errores_abono: 'errores_abono_semana',
  errores_poda: 'errores_poda_semana',
  errores_ubicacion: 'errores_ubicacion_semana'
}

function normalizeStatsUpdates(updates) {
  const normalizedUpdates = { ...updates }

  for (const [totalField, weeklyField] of Object.entries(WEEKLY_ERROR_FIELDS)) {
    if (updates[totalField] && normalizedUpdates[weeklyField] === undefined) {
      normalizedUpdates[weeklyField] = updates[totalField]
    }
  }

  return normalizedUpdates
}

function updateStats(statsRepository, updates) {
  statsRepository.getStats()
  statsRepository.incrementStats(normalizeStatsUpdates(updates))
}

function getStats(statsRepository) {
  return statsRepository.getStats()
}

function fixWeeklyCounter(statsRepository, value) {
  statsRepository.fixWeeklyCounter(value)
}

function resetWeeklyCounters(statsRepository, currentWeek) {
  statsRepository.resetWeeklyCounters(currentWeek)
}

module.exports = {
  WEEKLY_ERROR_FIELDS,
  getStats,
  fixWeeklyCounter,
  resetWeeklyCounters,
  normalizeStatsUpdates,
  updateStats
}
