const { db } = require('../connection')

function getAllPlants() {
  return db.prepare('SELECT * FROM plantas ORDER BY nivel_dificultad, nombre_planta').all()
}

function countCatalogPlants() {
  return db.prepare('SELECT COUNT(*) as total FROM plantas').get().total
}

function getPlantById(id_planta) {
  return db.prepare('SELECT * FROM plantas WHERE id_planta = ?').get(id_planta)
}

function insertCatalogPlants(plants) {
  const insert = db.prepare(`
    INSERT INTO plantas
      (nombre_planta, nombre_cientifico, tipo_planta, tipo_luz,
       frecuencia_riego, nivel_dificultad, tipo_poda, descripcion, sprite_key)
    VALUES
      (@nombre_planta, @nombre_cientifico, @tipo_planta, @tipo_luz,
       @frecuencia_riego, @nivel_dificultad, @tipo_poda, @descripcion, @sprite_key)
  `)

  db.transaction((plantCatalog) => {
    for (const plant of plantCatalog) insert.run(plant)
  })(plants)
}

function updateCatalogPlants(plants) {
  const updateStmt = db.prepare(`
    UPDATE plantas
    SET nombre_cientifico = @nombre_cientifico,
        tipo_planta       = @tipo_planta,
        nombre_planta     = @nombre_planta,
        descripcion       = @descripcion,
        tipo_luz          = @tipo_luz,
        frecuencia_riego  = @frecuencia_riego,
        nivel_dificultad  = @nivel_dificultad,
        tipo_poda         = @tipo_poda
    WHERE sprite_key = @sprite_key
  `)

  db.transaction((plantCatalog) => {
    for (const plant of plantCatalog) updateStmt.run(plant)
  })(plants)
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

function getMaxUserPlantElapsedDays() {
  const result = db.prepare(`
    SELECT MAX(dias_transcurridos) AS maxDay
    FROM plantas_usuario
  `).get()

  return result?.maxDay || 0
}

function getUserPlantWithLight(id_registro) {
  return db.prepare(`
    SELECT pu.*, p.tipo_luz
    FROM plantas_usuario pu
    JOIN plantas p ON pu.id_planta = p.id_planta
    WHERE pu.id_registro = ?
  `).get(id_registro)
}

function getUserPlantForCare(id_registro) {
  return db.prepare(`
    SELECT pu.*, p.nombre_planta, p.frecuencia_riego, p.tipo_poda
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
  countCatalogPlants,
  getAllPlants,
  getPlantById,
  insertCatalogPlants,
  getUserPlants,
  getMaxUserPlantElapsedDays,
  getUserPlantWithLight,
  getUserPlantForCare,
  updateCatalogPlants,
  acquirePlant,
  deletePlant,
  updatePlantState,
  updatePlantLocation,
  clearUserPlants,
  returnPlantToPanel
}
