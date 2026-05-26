const { db } = require('../connection')

const ALLOWED_INCREMENT_FIELDS = [
  'acciones_totales', 'acciones_correctas',
  'acciones_correctas_hoy',
  'errores_riego', 'errores_abono',
  'errores_poda', 'errores_ubicacion',
  'errores_riego_semana', 'errores_abono_semana',
  'errores_poda_semana', 'errores_ubicacion_semana',
  'diagnosticos_correctos', 'plantas_muertas',
  'semana_simulada_actual'
]

function getStats() {
  const row = db.prepare('SELECT * FROM estadisticas LIMIT 1').get()
  if (row) return row

  db.prepare('INSERT INTO estadisticas (semana_simulada_actual) VALUES (0)').run()
  return db.prepare('SELECT * FROM estadisticas LIMIT 1').get()
}

function incrementStats(updates) {
  const setClauses = Object.keys(updates)
    .filter(key => ALLOWED_INCREMENT_FIELDS.includes(key))
    .map(key => `${key} = ${key} + @${key}`)
    .join(', ')

  if (!setClauses) return

  db.prepare(`UPDATE estadisticas SET ${setClauses}`).run(updates)
}

function fixWeeklyCounter(value) {
  db.prepare(`
    UPDATE estadisticas SET semana_simulada_actual = ?
  `).run(value)
}

function resetWeeklyCounters(currentWeek) {
  db.prepare(`
    UPDATE estadisticas
    SET semana_simulada_actual = ?,
        errores_riego_semana = 0,
        errores_abono_semana = 0,
        errores_poda_semana = 0,
        errores_ubicacion_semana = 0
  `).run(currentWeek)
}

function clearStats() {
  db.prepare('DELETE FROM estadisticas').run()
}

module.exports = {
  getStats,
  incrementStats,
  fixWeeklyCounter,
  resetWeeklyCounters,
  clearStats
}
