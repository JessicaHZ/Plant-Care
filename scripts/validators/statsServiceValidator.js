const assert = require('assert/strict')

const {
  fixWeeklyCounter,
  getStats,
  normalizeStatsUpdates,
  resetWeeklyCounters,
  updateStats
} = require('../../main/services/statsService')

function validateStatsService() {
  assert.deepEqual(
    normalizeStatsUpdates({
      errores_riego: 2,
      acciones_totales: 1
    }),
    {
      errores_riego: 2,
      errores_riego_semana: 2,
      acciones_totales: 1
    }
  )

  assert.deepEqual(
    normalizeStatsUpdates({
      errores_abono: 3,
      errores_abono_semana: 1
    }),
    {
      errores_abono: 3,
      errores_abono_semana: 1
    }
  )

  const calls = []
  const statsRow = { acciones_totales: 4 }
  const statsRepository = {
    getStats: () => {
      calls.push({ method: 'getStats' })
      return statsRow
    },
    incrementStats: updates => calls.push({ method: 'incrementStats', updates }),
    fixWeeklyCounter: value => calls.push({ method: 'fixWeeklyCounter', value }),
    resetWeeklyCounters: currentWeek => calls.push({ method: 'resetWeeklyCounters', currentWeek })
  }

  assert.equal(getStats(statsRepository), statsRow)
  updateStats(statsRepository, { errores_poda: 1 })
  fixWeeklyCounter(statsRepository, 3)
  resetWeeklyCounters(statsRepository, 4)

  assert.deepEqual(calls, [
    { method: 'getStats' },
    { method: 'getStats' },
    {
      method: 'incrementStats',
      updates: {
        errores_poda: 1,
        errores_poda_semana: 1
      }
    },
    { method: 'fixWeeklyCounter', value: 3 },
    { method: 'resetWeeklyCounters', currentWeek: 4 }
  ])
}

module.exports = {
  validateStatsService
}
