const { db } = require('../connection')

function getAllPlants() {
  return db.prepare('SELECT * FROM plantas ORDER BY nivel_dificultad, nombre_planta').all()
}

function getPlantById(id_planta) {
  return db.prepare('SELECT * FROM plantas WHERE id_planta = ?').get(id_planta)
}

function getUserPlants() {
  return db.prepare(`
    SELECT
      pu.*,
      p.nombre_planta,    p.nombre_cientifico, p.tipo_planta,
      p.tipo_luz,         p.frecuencia_riego,
      p.nivel_dificultad, p.tipo_poda,
      p.descripcion,      p.sprite_key
    FROM plantas_usuario pu
    JOIN plantas p ON pu.id_planta = p.id_planta
  `).all()
}

function getUserPlantWithLight(id_registro) {
  return db.prepare(`
    SELECT pu.*, p.tipo_luz
    FROM plantas_usuario pu
    JOIN plantas p ON pu.id_planta = p.id_planta
    WHERE pu.id_registro = ?
  `).get(id_registro)
}

function acquirePlant(id_planta) {
  const result = db.prepare(`
    INSERT INTO plantas_usuario (id_planta) VALUES (?)
  `).run(id_planta)

  return result.lastInsertRowid
}

function deletePlant(id_registro) {
  const result = db.prepare(`
    DELETE FROM plantas_usuario WHERE id_registro = ?
  `).run(id_registro)

  return result.changes > 0
}

function updatePlantState(id_registro, fields) {
  const allowed = [
    'estado_planta', 'ubicacion', 'humedad', 'salud',
    'dias_sin_regar', 'ultimo_riego', 'dias_transcurridos',
    'requiere_poda_activa', 'ultimo_poda',
    'pos_x', 'pos_y',
    'nutrientes'
  ]

  const updates = Object.keys(fields)
    .filter(key => allowed.includes(key))
    .map(key => `${key} = @${key}`)
    .join(', ')

  if (!updates) return

  db.prepare(`
    UPDATE plantas_usuario SET ${updates} WHERE id_registro = @id_registro
  `).run({ ...fields, id_registro })
}

function updatePlantLocation(id_registro, ubicacion, pos_x = null, pos_y = null) {
  updatePlantState(id_registro, { ubicacion, pos_x, pos_y })
}

function clearUserPlants() {
  db.prepare('DELETE FROM plantas_usuario').run()
}

function returnPlantToPanel(id_registro) {
  db.prepare(`
    UPDATE plantas_usuario
    SET ubicacion = NULL, pos_x = NULL, pos_y = NULL
    WHERE id_registro = ?
  `).run(id_registro)
}

module.exports = {
  getAllPlants,
  getPlantById,
  getUserPlants,
  getUserPlantWithLight,
  acquirePlant,
  deletePlant,
  updatePlantState,
  updatePlantLocation,
  clearUserPlants,
  returnPlantToPanel
}
