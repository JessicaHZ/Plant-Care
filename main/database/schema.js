function initializeSchema(db) {
  // Progreso del jugador (reemplaza BD Usuario).
  db.exec(`
    CREATE TABLE IF NOT EXISTS progreso (
      nivel          INTEGER NOT NULL DEFAULT 1,
      experiencia    INTEGER NOT NULL DEFAULT 0,
      racha_dias     INTEGER NOT NULL DEFAULT 0,
      dia_actual      INTEGER NOT NULL DEFAULT 1
    )
  `)

  // Estadisticas de desempeno.
  db.exec(`
    CREATE TABLE IF NOT EXISTS estadisticas (
      id_estadistica         INTEGER PRIMARY KEY AUTOINCREMENT,
      acciones_totales       INTEGER NOT NULL DEFAULT 0,
      acciones_correctas     INTEGER NOT NULL DEFAULT 0,
      errores_riego          INTEGER NOT NULL DEFAULT 0,
      errores_abono          INTEGER NOT NULL DEFAULT 0,
      errores_poda           INTEGER NOT NULL DEFAULT 0,
      errores_ubicacion      INTEGER NOT NULL DEFAULT 0,
      errores_riego_semana    INTEGER NOT NULL DEFAULT 0,
      errores_abono_semana    INTEGER NOT NULL DEFAULT 0,
      errores_poda_semana     INTEGER NOT NULL DEFAULT 0,
      errores_ubicacion_semana INTEGER NOT NULL DEFAULT 0,
      diagnosticos_correctos INTEGER NOT NULL DEFAULT 0,
      plantas_muertas        INTEGER NOT NULL DEFAULT 0,
      semana_simulada_actual INTEGER NOT NULL DEFAULT 0
    )
  `)

  // Catalogo de plantas del vivero.
  db.exec(`
    CREATE TABLE IF NOT EXISTS plantas (
      id_planta        INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre_planta    TEXT    NOT NULL,
      nombre_cientifico TEXT   NOT NULL DEFAULT '',
      tipo_planta      TEXT    NOT NULL DEFAULT 'OTRO',
      tipo_luz         TEXT    NOT NULL,
      frecuencia_riego INTEGER NOT NULL,
      nivel_dificultad TEXT    NOT NULL,
      tipo_poda        TEXT    NOT NULL DEFAULT 'NUNCA',
      descripcion      TEXT    NOT NULL,
      sprite_key       TEXT    NOT NULL
    )
  `)

  // Plantas adquiridas por el jugador.
  db.exec(`
    CREATE TABLE IF NOT EXISTS plantas_usuario (
      id_registro          INTEGER PRIMARY KEY AUTOINCREMENT,
      id_planta            INTEGER NOT NULL,
      estado_planta        TEXT    NOT NULL DEFAULT 'SANA',
      ubicacion            TEXT    DEFAULT NULL,
      humedad              INTEGER NOT NULL DEFAULT 50,
      salud                INTEGER NOT NULL DEFAULT 100,
      dias_sin_regar       INTEGER NOT NULL DEFAULT 0,
      ultimo_riego         INTEGER NOT NULL DEFAULT 0,
      dias_transcurridos   INTEGER NOT NULL DEFAULT 0,
      requiere_poda_activa INTEGER NOT NULL DEFAULT 0,
      ultimo_poda          INTEGER NOT NULL DEFAULT 0,
      adquirida_en         TEXT    NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (id_planta) REFERENCES plantas(id_planta)
    )
  `)

  // Logros obtenidos.
  db.exec(`
    CREATE TABLE IF NOT EXISTS logros (
      id_logro          INTEGER PRIMARY KEY AUTOINCREMENT,
      clave_logro       TEXT    UNIQUE NOT NULL DEFAULT '',
      nombre_logro      TEXT    NOT NULL,
      descripcion_logro TEXT    NOT NULL,
      fecha_obtencion   TEXT    NOT NULL,
      tipo_logro        TEXT    NOT NULL DEFAULT 'PROGRESO'
    )
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS progreso (
      nivel          INTEGER NOT NULL DEFAULT 1,
      experiencia    INTEGER NOT NULL DEFAULT 0,
      racha_dias     INTEGER NOT NULL DEFAULT 0,
      dia_actual      INTEGER NOT NULL DEFAULT 1,
      ultimo_cierre  INTEGER DEFAULT NULL,
      tutorial_completado  INTEGER NOT NULL DEFAULT 0
    )
  `)

  const safeMigrations = [
    `ALTER TABLE plantas ADD COLUMN nombre_cientifico TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE plantas ADD COLUMN tipo_planta TEXT NOT NULL DEFAULT 'OTRO'`,
    `ALTER TABLE plantas_usuario ADD COLUMN requiere_poda_activa INTEGER NOT NULL DEFAULT 0`,
    `ALTER TABLE plantas_usuario ADD COLUMN ultimo_poda INTEGER NOT NULL DEFAULT 0`,
    `ALTER TABLE plantas_usuario ADD COLUMN pos_x TEXT DEFAULT NULL`,
    `ALTER TABLE plantas_usuario ADD COLUMN pos_y TEXT DEFAULT NULL`,
    `ALTER TABLE progreso ADD COLUMN ultimo_cierre INTEGER DEFAULT NULL`,
    `ALTER TABLE progreso ADD COLUMN dia_actual INTEGER NOT NULL DEFAULT 1`,
    `ALTER TABLE logros ADD COLUMN clave_logro TEXT DEFAULT ''`,
    `ALTER TABLE estadisticas ADD COLUMN acciones_correctas_hoy INTEGER NOT NULL DEFAULT 0`,
    `ALTER TABLE estadisticas ADD COLUMN errores_riego_semana INTEGER NOT NULL DEFAULT 0`,
    `ALTER TABLE estadisticas ADD COLUMN errores_abono_semana INTEGER NOT NULL DEFAULT 0`,
    `ALTER TABLE estadisticas ADD COLUMN errores_poda_semana INTEGER NOT NULL DEFAULT 0`,
    `ALTER TABLE estadisticas ADD COLUMN errores_ubicacion_semana INTEGER NOT NULL DEFAULT 0`,
    `ALTER TABLE progreso ADD COLUMN tutorial_completado INTEGER NOT NULL DEFAULT 0`,
    `ALTER TABLE plantas_usuario ADD COLUMN nutrientes INTEGER NOT NULL DEFAULT 50`
  ]

  for (const migration of safeMigrations) {
    try {
      db.exec(migration)
    } catch (_) {
      // Columna ya existente en bases de datos inicializadas previamente.
    }
  }
}

function initializeSchemaIndexes(db) {
  try {
    db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_logros_clave_logro ON logros(clave_logro)`)
  } catch (_) {
    // Indice ya existente o tabla antigua sin la columna necesaria.
  }
}

module.exports = {
  initializeSchema,
  initializeSchemaIndexes
}
