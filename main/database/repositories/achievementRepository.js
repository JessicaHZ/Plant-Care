const { db } = require('../connection')

function migrateLegacyAchievement(nombre, clave) {
  db.prepare(`
    UPDATE logros
    SET clave_logro = ?
    WHERE nombre_logro = ? AND clave_logro = ''
  `).run(clave, nombre)
}

function getAchievementIds() {
  return db.prepare(`SELECT clave_logro FROM logros WHERE clave_logro != ''`)
    .all()
    .map(row => row.clave_logro)
}

function insertAchievement({ id, nombre, descripcion, fecha, tipo }) {
  db.prepare(`
    INSERT INTO logros (clave_logro, nombre_logro, descripcion_logro, fecha_obtencion, tipo_logro)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, nombre, descripcion, fecha, tipo)
}

function getAchievements() {
  return db.prepare(`
    SELECT clave_logro AS id_logro, nombre_logro, descripcion_logro,
           fecha_obtencion, tipo_logro
    FROM logros
    ORDER BY fecha_obtencion DESC
  `).all()
}

function clearAchievements() {
  db.prepare('DELETE FROM logros').run()
}

module.exports = {
  migrateLegacyAchievement,
  getAchievementIds,
  insertAchievement,
  getAchievements,
  clearAchievements
}
