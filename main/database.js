const Database = require('better-sqlite3')
const path = require('path')
const { app } = require('electron')
const DB_PATH = path.join(app.getPath('userData'), 'game.db')
const db = new Database(DB_PATH)
const MAX_PLAYER_LEVEL = 5

function initializeDatabase() {

  // ── Progreso del jugador (reemplaza BD Usuario) ──────────────────────────
  // nivel >= 2 desbloquea la herramienta de poda (RF-09).
  db.exec(`
    CREATE TABLE IF NOT EXISTS progreso (
      nivel          INTEGER NOT NULL DEFAULT 1,
      experiencia    INTEGER NOT NULL DEFAULT 0,
      racha_dias     INTEGER NOT NULL DEFAULT 0,
      dia_actual      INTEGER NOT NULL DEFAULT 1
    )
  `)
  // ── Estadísticas de desempeño ────────────────────────────────────────────
  // diagnosticos_correctos alimenta RF-31 (LM4) y el cálculo de XP adicional.
  // semana_simulada_actual controla la activación de RF-32 (LM5).
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
  // ── Catálogo de plantas del vivero ───────────────────────────────────────
  // nombre_cientifico y tipo_planta son campos nativos (RF-04, LM1).
  // tipo_poda determina si la herramienta de poda aplica (RF-09).
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

  // ── Plantas adquiridas por el jugador ────────────────────────────────────
  // requiere_poda_activa: se activa según tipo_poda y dias_transcurridos (RF-09).
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

  // ── Logros obtenidos ─────────────────────────────────────────────────────
  // tipo_logro: PROGRESO / EDUCATIVO / RACHA / EVALUACION.
  // EVALUACION se desbloquea por revisión semanal activa (RF-32, LM5).
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
      ultimo_cierre  INTEGER DEFAULT NULL,   -- ✅ timestamp Unix en ms
      tutorial_completado  INTEGER NOT NULL DEFAULT 0 
    )
  `)

  // ── Migraciones seguras para BDs existentes ──────────────────────────────
  // Cada bloque agrega columnas nuevas sin romper datos previos.
  const safeMigrations = [
    `ALTER TABLE plantas ADD COLUMN nombre_cientifico TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE plantas ADD COLUMN tipo_planta TEXT NOT NULL DEFAULT 'OTRO'`,
    `ALTER TABLE plantas_usuario ADD COLUMN requiere_poda_activa INTEGER NOT NULL DEFAULT 0`,
    `ALTER TABLE plantas_usuario ADD COLUMN ultimo_poda INTEGER NOT NULL DEFAULT 0`,
    `ALTER TABLE plantas_usuario ADD COLUMN pos_x TEXT DEFAULT NULL`,  // ✅ nuevo
    `ALTER TABLE plantas_usuario ADD COLUMN pos_y TEXT DEFAULT NULL`,  // ✅ nuevo
    `ALTER TABLE progreso ADD COLUMN ultimo_cierre INTEGER DEFAULT NULL`,
    `ALTER TABLE progreso ADD COLUMN dia_actual INTEGER NOT NULL DEFAULT 1`,
    // Agregamos la columna en forma segura: SQLite no permite añadir
    // restricciones UNIQUE/NOT NULL en ALTER TABLE, así que añadimos
    // solo la columna con un DEFAULT y creamos un índice único después.
    `ALTER TABLE logros ADD COLUMN clave_logro TEXT DEFAULT ''`,
    `ALTER TABLE estadisticas ADD COLUMN acciones_correctas_hoy INTEGER NOT NULL DEFAULT 0`,
    `ALTER TABLE estadisticas ADD COLUMN errores_riego_semana INTEGER NOT NULL DEFAULT 0`,
    `ALTER TABLE estadisticas ADD COLUMN errores_abono_semana INTEGER NOT NULL DEFAULT 0`,
    `ALTER TABLE estadisticas ADD COLUMN errores_poda_semana INTEGER NOT NULL DEFAULT 0`,
    `ALTER TABLE estadisticas ADD COLUMN errores_ubicacion_semana INTEGER NOT NULL DEFAULT 0`,
    `ALTER TABLE progreso ADD COLUMN tutorial_completado INTEGER NOT NULL DEFAULT 0`,
    `ALTER TABLE plantas_usuario ADD COLUMN nutrientes INTEGER NOT NULL DEFAULT 50`,  
    
  ]
  for (const migration of safeMigrations) {
    try { db.exec(migration) } catch (_) { /* columna ya existe */ }
  }

  migrateCurrentDayFromPlantState()

  // Asegurar unicidad de `clave_logro` en instalaciones antiguas
  try {
    db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_logros_clave_logro ON logros(clave_logro)`)
  } catch (_) { /* índice ya existe o tabla no tiene la columna */ }

  // Migración de logros existentes para preservar clave_texto
  const legacyAchievementMap = {
    'Primer Brote': 'primera_planta',
    'Pequeño Jardín': 'cinco_plantas',
    'Cuidador Novato': 'primer_nivel',
    'Ojo Clínico': 'diagnostico_perfecto',
    'Constante': 'racha_5',
    'Dedicado': 'racha_10',
    'Evaluador Reflexivo': 'evaluacion_correcta',
    'Semana Perfecta': 'sin_errores_semana',
    'Verde Experto': 'planta_nivel3',
    'Maestro Botanista': 'quiz_perfecto'
  }

  for (const [nombre, clave] of Object.entries(legacyAchievementMap)) {
    db.prepare(`
      UPDATE logros
      SET clave_logro = ?
      WHERE nombre_logro = ? AND clave_logro = ''
    `).run(clave, nombre)
  }

  seedPlants()

  console.log('Base de datos inicializada en:', DB_PATH)
}

// Obtiene el estado global del jugador.
// Crea la fila inicial si el juego se ejecuta por primera vez.
function getProgress() {
  const row = db.prepare(`SELECT * FROM progreso LIMIT 1`).get()
  if (row) {
    if (row.nivel > MAX_PLAYER_LEVEL) {
      updateProgress({ nivel: MAX_PLAYER_LEVEL })
      return { ...row, nivel: MAX_PLAYER_LEVEL }
    }
    return row
  }

  db.prepare(`INSERT INTO progreso (nivel, experiencia, racha_dias) VALUES (1, 0, 0)`).run()
  return db.prepare(`SELECT * FROM progreso LIMIT 1`).get()
}

// Actualiza uno o más campos del progreso del jugador.
// Uso: updateProgress({ experiencia: 150, nivel: 2 })
function updateProgress(fields) {
  const keys = Object.keys(fields)
  const setClause = keys.map(k => `${k} = @${k}`).join(', ')
  db.prepare(`UPDATE progreso SET ${setClause}`).run(fields)
}

function migrateCurrentDayFromPlantState() {
  const progress = db.prepare(`SELECT dia_actual FROM progreso LIMIT 1`).get()
  if (!progress || progress.dia_actual > 1) return

  const maxDayResult = db.prepare(`
    SELECT MAX(dias_transcurridos) AS maxDay
    FROM plantas_usuario
  `).get()
  const maxDay = maxDayResult?.maxDay || 0

  if (maxDay > 0) {
    updateProgress({ dia_actual: maxDay + 1 })
  }
}

// Catálogo de 20 plantas reales.
// Separado de seedPlants() para facilitar mantenimiento.
// sprite_key: identificador estable para imágenes y búsquedas.
const PLANT_CATALOG = [
  // ── FÁCIL ──────────────────────────────────────────────────────────────
  {
    nombre_planta: 'Pothos',
    nombre_cientifico: 'Epipremnum aureum',
    tipo_planta: 'ORNAMENTAL',       // ✅ corregido
    tipo_luz: 'INDIRECTA',
    frecuencia_riego: 7,
    nivel_dificultad: 'FÁCIL',
    tipo_poda: 'OCASIONAL',
    descripcion: 'Una de las plantas de interior más resistentes del mundo. Tolera poca luz, olvidos de riego y condiciones adversas. Purifica el aire eliminando formaldehído y monóxido de carbono. Sus tallos colgantes pueden alcanzar varios metros.',
    sprite_key: 'pothos'
  },
  {
    nombre_planta: 'Sansevieria',
    nombre_cientifico: 'Dracaena trifasciata',
    tipo_planta: 'ORNAMENTAL',
    tipo_luz: 'INDIRECTA',
    frecuencia_riego: 14,
    nivel_dificultad: 'FÁCIL',
    tipo_poda: 'NUNCA',
    descripcion: 'Conocida como "lengua de suegra" o "planta serpiente". Prácticamente indestructible: sobrevive en sombra, calor y sequía. Es una de las mejores purificadoras de aire según la NASA. Convierte CO₂ en oxígeno incluso de noche.',
    sprite_key: 'sansevieria'
  },
  {
    nombre_planta: 'Echeveria',
    nombre_cientifico: 'Echeveria elegans',
    tipo_planta: 'SUCULENTA',        // ✅ corregido
    tipo_luz: 'DIRECTA',
    frecuencia_riego: 14,
    nivel_dificultad: 'FÁCIL',
    tipo_poda: 'NUNCA',
    descripcion: 'Suculenta en forma de rosa, nativa de México. Almacena agua en sus hojas carnosas y soporta períodos de sequía. Necesita luz solar directa y riego escaso. Es sensible al exceso de agua, que pudre sus raíces rápidamente.',
    sprite_key: 'echeveria'
  },
  {
    nombre_planta: 'Cactus',
    nombre_cientifico: 'Mammillaria elongata',
    tipo_planta: 'CACTUS',           // ✅ corregido (categoría propia)
    tipo_luz: 'DIRECTA',
    frecuencia_riego: 21,
    nivel_dificultad: 'FÁCIL',
    tipo_poda: 'NUNCA',
    descripcion: 'Cactus columnares agrupados con espinas doradas, originario de México. Extremadamente tolerante a la sequía y al calor. Puede pasar semanas sin agua. En primavera produce pequeñas flores blancas o amarillas. Ideal para principiantes.',
    sprite_key: 'cactus'
  },
  {
    nombre_planta: 'Dracena',
    nombre_cientifico: 'Dracaena marginata',
    tipo_planta: 'ORNAMENTAL',
    tipo_luz: 'INDIRECTA',
    frecuencia_riego: 10,
    nivel_dificultad: 'FÁCIL',
    tipo_poda: 'OCASIONAL',
    descripcion: 'Árbol tropical esbelto con hojas largas bordeadas en rojo o rosa. Muy tolerante a la poca luz y al descuido. Purifica el aire eliminando benceno y tricloroetileno. Crece lentamente y puede vivir décadas con cuidados mínimos.',
    sprite_key: 'dracena'
  },

  // ── MEDIO ──────────────────────────────────────────────────────────────
  {
    nombre_planta: 'Helecho',
    nombre_cientifico: 'Nephrolepis exaltata',
    tipo_planta: 'ORNAMENTAL',
    tipo_luz: 'SOMBRA',
    frecuencia_riego: 3,
    nivel_dificultad: 'MEDIO',
    tipo_poda: 'OCASIONAL',
    descripcion: 'El helecho de Boston es uno de los más populares de interior. Necesita humedad constante: si el aire es seco, sus hojas se vuelven marrones. Ideal para baños o cocinas. Es excelente purificador de aire y humidificador natural.',
    sprite_key: 'helecho'
  },
  {
    nombre_planta: 'Begonia',
    nombre_cientifico: 'Begonia rex',
    tipo_planta: 'ORNAMENTAL',
    tipo_luz: 'INDIRECTA',
    frecuencia_riego: 4,
    nivel_dificultad: 'MEDIO',
    tipo_poda: 'OCASIONAL',
    descripcion: 'Famosa por sus hojas ornamentales con patrones metálicos en rojo, plata y verde. No tolera el sol directo ni el sustrato encharcado. Prefiere luz indirecta brillante y riego cuando la superficie del sustrato esté seca al tacto.',
    sprite_key: 'begonia'
  },
  {
    nombre_planta: 'Tradescantia',
    nombre_cientifico: 'Tradescantia zebrina',
    tipo_planta: 'ORNAMENTAL',
    tipo_luz: 'INDIRECTA',
    frecuencia_riego: 5,
    nivel_dificultad: 'MEDIO',
    tipo_poda: 'FRECUENTE',
    descripcion: 'Planta colgante de rayas plateadas y envés morado. Crece muy rápido y necesita poda frecuente para mantener su forma compacta. Tolera algo de sequía pero prefiere humedad moderada. Es fácil de propagar: basta un tallo en agua.',
    sprite_key: 'tradescantia'
  },
  {
    nombre_planta: 'Croton',
    nombre_cientifico: 'Codiaeum variegatum',
    tipo_planta: 'ORNAMENTAL',
    tipo_luz: 'DIRECTA',
    frecuencia_riego: 5,
    nivel_dificultad: 'MEDIO',
    tipo_poda: 'OCASIONAL',
    descripcion: 'Planta tropical de colores espectaculares: hojas con manchas amarillas, rojas, naranjas y verdes. Necesita mucha luz para mantener su colorido. Es sensible a los cambios de ubicación y al frío. Pierde hojas si se mueve frecuentemente.',
    sprite_key: 'croton'
  },
  {
    nombre_planta: 'Calathea',
    nombre_cientifico: 'Calathea ornata',
    tipo_planta: 'ORNAMENTAL',
    tipo_luz: 'SOMBRA',
    frecuencia_riego: 4,
    nivel_dificultad: 'MEDIO',
    tipo_poda: 'NUNCA',
    descripcion: 'Conocida como "planta oración" porque cierra sus hojas de noche. Sus hojas verde oscuro con líneas rosadas son inconfundibles. Necesita humedad alta, agua sin cloro y temperatura constante. No tolera corrientes de aire ni luz directa.',
    sprite_key: 'calathea'
  },

  // ── DIFÍCIL ────────────────────────────────────────────────────────────
  {
    nombre_planta: 'Hibisco',
    nombre_cientifico: 'Hibiscus rosa-sinensis',
    tipo_planta: 'ORNAMENTAL',
    tipo_luz: 'DIRECTA',
    frecuencia_riego: 3,
    nivel_dificultad: 'DIFÍCIL',
    tipo_poda: 'FRECUENTE',
    descripcion: 'Arbusto tropical con flores grandes en rojo, rosa, amarillo y naranja. Necesita mucho sol y riego frecuente en verano. La poda tras cada floración estimula nuevas flores. Es sensible al frío y a la sequía. Sus flores duran solo un día.',
    sprite_key: 'hibisco'
  },
  {
    nombre_planta: 'Petunia',
    nombre_cientifico: 'Petunia hybrida',
    tipo_planta: 'ORNAMENTAL',
    tipo_luz: 'DIRECTA',
    frecuencia_riego: 3,
    nivel_dificultad: 'DIFÍCIL',
    tipo_poda: 'FRECUENTE',
    descripcion: 'Planta de temporada con flores en prácticamente todos los colores. Necesita sol pleno, riego regular y poda de flores marchitas para prolongar la floración. Es susceptible a las lluvias intensas y al exceso de agua en el sustrato.',
    sprite_key: 'petunia'
  },
  {
    nombre_planta: 'Bugambilia',
    nombre_cientifico: 'Bougainvillea glabra',
    tipo_planta: 'ORNAMENTAL',
    tipo_luz: 'DIRECTA',
    frecuencia_riego: 7,
    nivel_dificultad: 'DIFÍCIL',
    tipo_poda: 'FRECUENTE',
    descripcion: 'Enredadera tropical con brácteas de colores intensos: magenta, naranja, blanco. Muy resistente al calor y a la sequía una vez establecida. Florece más cuando se estresa levemente con menos agua. La poda post-floración es esencial.',
    sprite_key: 'bugambilia'
  },
  {
    nombre_planta: 'Ficus',
    nombre_cientifico: 'Ficus benjamina',
    tipo_planta: 'ORNAMENTAL',
    tipo_luz: 'INDIRECTA',
    frecuencia_riego: 7,
    nivel_dificultad: 'DIFÍCIL',
    tipo_poda: 'OCASIONAL',
    descripcion: 'Árbol de interior elegante con hojas brillantes. Extremadamente sensible a los cambios: pierde hojas si lo mueves, si cambia la temperatura o si hay corrientes de aire. Una vez que encuentra su lugar ideal, crece establemente por años.',
    sprite_key: 'ficus'
  },
  {
    nombre_planta: 'Albahaca',              // ✅ nombre más preciso que 'Aromática'
    nombre_cientifico: 'Ocimum basilicum',
    tipo_planta: 'AROMATICA',             // ✅ sin tilde, normalizado
    tipo_luz: 'DIRECTA',
    frecuencia_riego: 2,
    nivel_dificultad: 'DIFÍCIL',
    tipo_poda: 'FRECUENTE',
    descripcion: 'La albahaca es una hierba aromática y culinaria esencial. Necesita mucho sol, riego frecuente y poda de las flores para mantener el sabor de las hojas. Es muy sensible al frío. Pinzar los brotes florales retrasa la maduración y extiende la cosecha.',
    sprite_key: 'aromatica'
  },
  {
    nombre_planta: 'Rosa',
    nombre_cientifico: 'Rosa hybrida',
    tipo_planta: 'ORNAMENTAL',
    tipo_luz: 'DIRECTA',
    frecuencia_riego: 3,
    nivel_dificultad: 'DIFÍCIL',
    tipo_poda: 'FRECUENTE',
    descripcion: 'La reina de las flores requiere atención constante: 6+ horas de sol, riego al suelo (no a las hojas), poda formativa en invierno y protección contra pulgones y hongos. La recompensa es una floración espectacular y duradera.',
    sprite_key: 'rosa'
  },
  {
    nombre_planta: 'Hortensia',
    nombre_cientifico: 'Hydrangea macrophylla',
    tipo_planta: 'ORNAMENTAL',
    tipo_luz: 'INDIRECTA',
    frecuencia_riego: 3,
    nivel_dificultad: 'DIFÍCIL',
    tipo_poda: 'OCASIONAL',
    descripcion: 'Sus grandes flores esféricas cambian de color según el pH del suelo: azul en suelos ácidos, rosa en alcalinos. Necesita mucha agua y nunca debe secarse. Sensible al sol directo en verano. La poda incorrecta elimina los futuros brotes florales.',
    sprite_key: 'hortensia'
  },
  {
    nombre_planta: 'Gardenia',
    nombre_cientifico: 'Gardenia jasminoides',
    tipo_planta: 'ORNAMENTAL',
    tipo_luz: 'INDIRECTA',
    frecuencia_riego: 4,
    nivel_dificultad: 'DIFÍCIL',
    tipo_poda: 'OCASIONAL',
    descripcion: 'Una de las flores más fragantes del mundo. Extremadamente exigente: necesita alta humedad, temperatura constante (15-24°C), agua sin cal y luz indirecta brillante. Los capullos caen si el ambiente cambia. Gratificante cuando florece.',
    sprite_key: 'gardenia'
  },
  {
    nombre_planta: 'Jazmín',
    nombre_cientifico: 'Jasminum officinale',
    tipo_planta: 'AROMATICA',
    tipo_luz: 'DIRECTA',
    frecuencia_riego: 5,
    nivel_dificultad: 'DIFÍCIL',
    tipo_poda: 'FRECUENTE',
    descripcion: 'Enredadera trepadora con flores blancas de fragancia intensa, usada en perfumería. Necesita soporte para trepar, sol directo y poda post-floración para estimular nuevos brotes. Sensible al frío. Su aroma es máximo en las noches de verano.',
    sprite_key: 'jazmin'
  },
  {
    nombre_planta: 'Limonero',
    nombre_cientifico: 'Citrus limon',
    tipo_planta: 'FRUTAL',            // ✅ categoría correcta del diccionario
    tipo_luz: 'DIRECTA',
    frecuencia_riego: 5,
    nivel_dificultad: 'DIFÍCIL',
    tipo_poda: 'FRECUENTE',
    descripcion: 'Árbol frutal cítrico cultivable en maceta. Necesita mínimo 8 horas de sol, riego regular y abono específico para cítricos. La poda formativa controla su tamaño y estimula la producción de frutos. Florece con aroma intenso antes de fructificar.',
    sprite_key: 'limonero'
  },
]

// Solo se ejecuta una vez: la primera vez que corre la app.
function seedPlants() {
  const count = db.prepare('SELECT COUNT(*) as total FROM plantas').get()

  if (count.total > 0) {
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
    db.transaction((plants) => {
      for (const p of plants) updateStmt.run(p)
    })(PLANT_CATALOG)
    console.log('Catálogo actualizado')
    return
  }

  const insert = db.prepare(`
    INSERT INTO plantas
      (nombre_planta, nombre_cientifico, tipo_planta, tipo_luz,
       frecuencia_riego, nivel_dificultad, tipo_poda, descripcion, sprite_key)
    VALUES
      (@nombre_planta, @nombre_cientifico, @tipo_planta, @tipo_luz,
       @frecuencia_riego, @nivel_dificultad, @tipo_poda, @descripcion, @sprite_key)
  `)
  db.transaction((plants) => {
    for (const p of plants) insert.run(p)
  })(PLANT_CATALOG)
  console.log('Catálogo insertado: 20 especies reales')
}

// ── Consultas de plantas ──────────────────────────────────────────────────

// Devuelve todas las plantas del catálogo
function getAllPlants() {
  return db.prepare('SELECT * FROM plantas ORDER BY nivel_dificultad, nombre_planta').all()
}

// Devuelve una planta por su id
function getPlantById(id_planta) {
  return db.prepare('SELECT * FROM plantas WHERE id_planta = ?').get(id_planta)
}

// Devuelve las plantas que tiene un usuario, con datos de la planta incluidos
// Devuelve todas las plantas adquiridas por el jugador.
// Sin filtro de usuario: sesión local única (sin autenticación).
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

// Agrega una planta a la colección del usuario
function acquirePlant(id_planta) {
  const plant = getPlantById(id_planta)
  if (!plant) throw new Error(`Planta con id ${id_planta} no encontrada`)

  const result = db.prepare(`
    INSERT INTO plantas_usuario (id_planta) VALUES (?)
  `).run(id_planta)

  return result.lastInsertRowid
}

// Elimina una planta de la colección del jugador por su id_registro.
// Solo debe usarse cuando la planta está MUERTA (validación en frontend).
function deletePlant(id_registro) {
  const result = db.prepare(`
    DELETE FROM plantas_usuario WHERE id_registro = ?
  `).run(id_registro)

  return result.changes > 0  // true si se eliminó correctamente
}


// ── Actualiza el estado de una planta del usuario ─────────────────────────
// Recibe el id del registro y un objeto con los campos a actualizar.
// Usamos SET dinámico para actualizar solo lo que cambia.
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

const ROOM_LIGHT_CONDITIONS = {
  'SALA': 'INDIRECTA',
  'JARDÍN': 'DIRECTA',
  'DORMITORIO': 'INDIRECTA'
}

function getRoomLightCondition(ubicacion) {
  return ROOM_LIGHT_CONDITIONS[ubicacion] || 'INDIRECTA'
}

function isLightCompatible(requiredLight, roomLight) {
  if (!requiredLight || !roomLight) return true
  if (requiredLight === roomLight) return true

  // Las plantas de sombra toleran luz indirecta, pero no sol directo.
  if (requiredLight === 'SOMBRA' && roomLight === 'INDIRECTA') return true

  return false
}

function getLocationEffect(plant) {
  if (!plant.ubicacion) {
    return { isCompatible: true, roomLight: null, healthDelta: 0 }
  }

  const roomLight = getRoomLightCondition(plant.ubicacion)
  const isCompatible = isLightCompatible(plant.tipo_luz, roomLight)

  return {
    isCompatible,
    roomLight,
    // La luz incorrecta debe notarse, pero sin castigar tan rapido al jugador.
    healthDelta: isCompatible ? 0 : -2
  }
}

function getPruningIntervalDays(tipo_poda) {
  if (tipo_poda === 'FRECUENTE') return 7
  if (tipo_poda === 'OCASIONAL') return 14
  return null
}

// ── Coloca una planta en una ubicación del entorno ────────────────────────
function placePlantInRoom(id_registro, ubicacion, pos_x = null, pos_y = null) {
  const plant = db.prepare(`
    SELECT pu.*, p.tipo_luz
    FROM plantas_usuario pu
    JOIN plantas p ON pu.id_planta = p.id_planta
    WHERE pu.id_registro = ?
  `).get(id_registro)
  const roomLight = getRoomLightCondition(ubicacion)

  updatePlantState(id_registro, { ubicacion, pos_x, pos_y })

  if (plant && ubicacion && !isLightCompatible(plant.tipo_luz, roomLight)) {
    updateStats({ errores_ubicacion: 1, acciones_totales: 1 })
  }

  return roomLight
}

// ── Actualiza estadísticas del jugador ────────────────────────────────────
// Incrementa contadores en la tabla estadísticas (singleton).
// Uso: updateStats({ errores_riego: 1, acciones_totales: 1 })
function updateStats(updates) {
  getStats()

  const weeklyErrorFields = {
    errores_riego: 'errores_riego_semana',
    errores_abono: 'errores_abono_semana',
    errores_poda: 'errores_poda_semana',
    errores_ubicacion: 'errores_ubicacion_semana'
  }

  const normalizedUpdates = { ...updates }
  Object.entries(weeklyErrorFields).forEach(([totalField, weeklyField]) => {
    if (updates[totalField] && normalizedUpdates[weeklyField] === undefined) {
      normalizedUpdates[weeklyField] = updates[totalField]
    }
  })

  const allowed = [
    'acciones_totales', 'acciones_correctas',
    'acciones_correctas_hoy',
    'errores_riego', 'errores_abono',
    'errores_poda', 'errores_ubicacion',
    'errores_riego_semana', 'errores_abono_semana',
    'errores_poda_semana', 'errores_ubicacion_semana',
    'diagnosticos_correctos', 'plantas_muertas',
    'semana_simulada_actual'  // ✅ nombre corregido
  ]

  const setClauses = Object.keys(normalizedUpdates)
    .filter(key => allowed.includes(key))
    .map(key => `${key} = ${key} + @${key}`)
    .join(', ')

  if (!setClauses) return

  db.prepare(`UPDATE estadisticas SET ${setClauses}`).run(normalizedUpdates)
}

function resetDailyCorrectActions() {
  getStats()
  db.prepare('UPDATE estadisticas SET acciones_correctas_hoy = 0').run()
}

// ── Actualiza XP y nivel del jugador ──────────────────────────────────────
// Suma XP al jugador y recalcula su nivel.
// Formula: nivel = min(5, floor(XP / 100) + 1)
// Retorna el nuevo estado y si hubo subida de nivel.
function addExperience(xpAmount) {
  const current = getProgress()

  const newXP = current.experiencia + xpAmount
  const calculatedLevel = Math.floor(newXP / 100) + 1
  const newLevel = Math.min(MAX_PLAYER_LEVEL, calculatedLevel)

  updateProgress({ experiencia: newXP, nivel: newLevel })

  return {
    newXP,
    newLevel,
    leveledUp: newLevel > current.nivel
  }
}

// ── Obtiene estadísticas del jugador ──────────────────────────────────────
// Obtiene las estadísticas del jugador.
// Crea la fila inicial si es la primera ejecución.
function getStats() {
  const row = db.prepare('SELECT * FROM estadisticas LIMIT 1').get()
  if (row) return row

  db.prepare('INSERT INTO estadisticas (semana_simulada_actual) VALUES (0)').run()
  return db.prepare('SELECT * FROM estadisticas LIMIT 1').get()
}

// ── Simulación: avanza N días para todas las plantas del usuario ──────────
// Esta es la función más importante del motor de simulación.
// Avanza N días simulados para todas las plantas del jugador.
function simulateDays(daysToAdvance) {
  const safeDays = Math.max(0, Math.floor(Number(daysToAdvance) || 0))
  if (safeDays === 0) return []

  const plants  = getUserPlants()
  const results = []

  db.transaction(() => {
    for (const plant of plants) {
      if (plant.estado_planta === 'MUERTA') continue

      let { humedad, salud, dias_sin_regar, dias_transcurridos } = plant
      let nutrientes = plant.nutrientes ?? 50   // ✅ extrae nutrientes
      const locationEffect = getLocationEffect(plant)
      const pruningInterval = getPruningIntervalDays(plant.tipo_poda)

      for (let d = 0; d < safeDays; d++) {
        dias_transcurridos++
        dias_sin_regar++

        // Humedad baja según días sin regar
        if (dias_sin_regar > plant.frecuencia_riego) {
          const overdueDays = dias_sin_regar - plant.frecuencia_riego
          humedad = Math.max(0, humedad - (overdueDays * 5))
        }

        // ✅ Nutrientes bajan 1 puntos por día
        nutrientes = Math.max(0, nutrientes - 1)

        // Salud según humedad y nutrientes
        if      (humedad < 20)  salud = Math.max(0,   salud - 3)
        else if (humedad < 40)  salud = Math.max(0,   salud - 2)
        else if (humedad <= 75) {
          // Rango óptimo de humedad
          if (nutrientes > 75) {
            // Exceso de nutrientes: deterioro leve por día.
            salud = Math.max(0, salud - 1)
          } else if (nutrientes >= 30) {
            // Recuperación asistida: una planta dañada responde más rápido
            // cuando el jugador ya corrigió humedad y nutrientes.
            const recovery = salud <= 50 ? 4 : 2
            salud = Math.min(100, salud + recovery)
          } else {
            // Con nutrientes bajos todavía puede recuperarse, pero más lento.
            const recovery = salud <= 50 ? 2 : 1
            salud = Math.min(100, salud + recovery)
          }
        }
        else if (humedad <= 90) salud = Math.max(0,   salud - 2)
        else                    salud = Math.max(0,   salud - 3)

        if (locationEffect.healthDelta < 0) {
          salud = Math.max(0, salud + locationEffect.healthDelta)
        }
      }

      const estado_planta =
        salud <= 0  ? 'MUERTA'   :
        salud <= 25 ? 'ENFERMA'  :
        salud <= 50 ? 'MARCHITA' : 'SANA'
      const lastPrunedDay = plant.ultimo_poda ?? 0
      const shouldActivatePruning =
        pruningInterval !== null &&
        plant.requiere_poda_activa !== 1 &&
        dias_transcurridos - lastPrunedDay >= pruningInterval

      // ✅ Guarda nutrientes junto con el resto del estado
      updatePlantState(plant.id_registro, {
        humedad, salud, dias_sin_regar,
        dias_transcurridos, estado_planta,
        nutrientes,
        requiere_poda_activa: shouldActivatePruning ? 1 : plant.requiere_poda_activa
      })

      if (estado_planta === 'MUERTA' && plant.estado_planta !== 'MUERTA') {
        updateStats({ plantas_muertas: 1 })
      }

      results.push({
        id_registro:   plant.id_registro,
        nombre_planta: plant.nombre_planta,
        estado_planta,
        salud:         Math.round(salud),
        humedad:       Math.round(humedad),
        nutrientes:    Math.round(nutrientes),
        ubicacion:     plant.ubicacion,
        luz_ubicacion: locationEffect.roomLight,
        luz_correcta:  locationEffect.isCompatible,
        requiere_poda_activa: shouldActivatePruning ? 1 : plant.requiere_poda_activa
      })
    }
  })()

  const progress = getProgress()
  updateProgress({ dia_actual: Math.max(1, (progress.dia_actual || 1) + safeDays) })

  processStreakForAdvancedDays(safeDays)
  checkAndGrantAchievements()
  return results
}

function processStreakForAdvancedDays(daysToAdvance) {
  const safeDays = Math.max(0, Math.floor(Number(daysToAdvance) || 0))
  if (safeDays === 0) return

  const stats = getStats()
  const hadCorrectActionToday = (stats?.acciones_correctas_hoy || 0) > 0

  updateStreak(hadCorrectActionToday)
  resetDailyCorrectActions()

  if (safeDays > 1) {
    updateStreak(false)
  }
}

// ── Acciones de cuidado ───────────────────────────────────────────────────

function waterPlant(id_registro) {
  const plant = db.prepare(`
    SELECT pu.*, p.frecuencia_riego, p.nombre_planta
    FROM plantas_usuario pu
    JOIN plantas p ON pu.id_planta = p.id_planta
    WHERE pu.id_registro = ?
  `).get(id_registro)

  if (!plant) return { success: false, error: 'Planta no encontrada' }
  if (plant.estado_planta === 'MUERTA') {
    return { success: false, error: 'No puedes regar una planta muerta' }
  }

  // ✅ Siempre sube +20%, puede llegar a 100%
  const newHumedad = Math.min(100, plant.humedad + 20)
  let feedback, xpGained, isError

  if (plant.humedad >= 76) {
    // ❌ Ya había exceso — empeoró la situación
    feedback = `Tu ${plant.nombre_planta} ya tenía la tierra saturada. ` +
      `El exceso de agua impide que las raíces respiren.`
    xpGained = 0
    isError = true
    updateStats({ errores_riego: 1, acciones_totales: 1 })

  } else if (plant.humedad >= 56) {
    // ⚠️ Riego prematuro — entrará en exceso
    feedback = `La tierra de tu ${plant.nombre_planta} aún estaba húmeda. ` +
      `${newHumedad > 75 ? 'Ahora quedó demasiado mojada; observa antes de volver a regar.' : 'Conviene esperar señales de sequedad antes de regar otra vez.'}`
    xpGained = 5
    isError = true
    updateStats({ errores_riego: 1, acciones_totales: 1 })

  } else if (plant.humedad >= 20) {
    // ✅ Riego correcto — rango bajo u óptimo
    feedback = `La tierra estaba seca. ` +
      `Tu ${plant.nombre_planta} respondió bien al riego.`
    xpGained = 15
    isError = false
    updateStats({ acciones_correctas: 1, acciones_correctas_hoy: 1, acciones_totales: 1 })

  } else {
    // ✅ Riego urgente — estaba muy seca
    feedback = `La tierra estaba muy seca. ` +
      `Riega con cuidado y observa si las hojas se recuperan.`
    xpGained = 15
    isError = false
    updateStats({ acciones_correctas: 1, acciones_correctas_hoy: 1, acciones_totales: 1 })
  }

  updatePlantState(id_registro, {
    humedad: newHumedad,
    ultimo_riego: plant.dias_transcurridos,
    dias_sin_regar: 0
  })

  const xpResult = addExperience(xpGained)
  checkAndGrantAchievements()
  return { success: true, feedback, xpGained, isError, xpResult }
}

// El abono aporta nutrientes al sustrato — no cura directamente.
// Con nutrientes altos, la simulación diaria recupera salud extra.
// Abonar con nutrientes altos quema las raíces.
function fertilizePlant(id_registro) {
  const plant = db.prepare(`
    SELECT pu.*, p.nombre_planta
    FROM plantas_usuario pu
    JOIN plantas p ON pu.id_planta = p.id_planta
    WHERE pu.id_registro = ?
  `).get(id_registro)

  if (!plant || plant.estado_planta === 'MUERTA') {
    return { success: false, error: 'No se puede abonar esta planta' }
  }

  const nutrientes = plant.nutrientes ?? 50
  let feedback, xpGained, newNutrientes, healthChange, isError

  if (nutrientes > 75) {
    // ❌ Exceso de nutrientes — quema raíces
    feedback = `Tu ${plant.nombre_planta} ya tenía suficiente alimento en el sustrato. ` +
      `Demasiado abono puede quemar las raíces.`
    xpGained = 0
    newNutrientes = nutrientes          // no sube más
    healthChange = -5                  // daño por exceso
    isError = true
    updateStats({ errores_abono: 1, acciones_totales: 1 })

  } else if (nutrientes >= 40) {
    // ⚠️ Abono prematuro — aún tiene nutrientes
    feedback = `El sustrato de tu ${plant.nombre_planta} aún tenía nutrientes. ` +
      `El abono ayuda más cuando la planta muestra desgaste.`
    xpGained = 5
    newNutrientes = Math.min(100, nutrientes + 15)
    healthChange = 0
    isError = true
    updateStats({ errores_abono: 1, acciones_totales: 1 })

  } else {
    // ✅ Abono correcto — nutrientes bajos
    feedback = `El sustrato estaba pobre en nutrientes. ` +
      `El abono ayudará a tu ${plant.nombre_planta} a recuperarse poco a poco.`
    xpGained = 12
    newNutrientes = Math.min(100, nutrientes + 25)
    healthChange = 0    // no cura inmediatamente — la recuperación es gradual
    isError = false
    updateStats({ acciones_correctas: 1, acciones_correctas_hoy: 1, acciones_totales: 1 })
  }

  const newSalud = Math.min(100, Math.max(0, plant.salud + healthChange))
  updatePlantState(id_registro, {
    salud: newSalud,
    nutrientes: newNutrientes
  })

  const xpResult = addExperience(xpGained)
  checkAndGrantAchievements()
  return { success: true, feedback, xpGained, isError, xpResult }
}

// Drena el exceso de agua de una planta.
// Disponible solo cuando la tierra está saturada.
// Simula: inclinar maceta, secar sustrato, mejorar ventilación.
function drainPlant(id_registro) {
  const plant = db.prepare(`
    SELECT pu.*, p.nombre_planta
    FROM plantas_usuario pu
    JOIN plantas p ON pu.id_planta = p.id_planta
    WHERE pu.id_registro = ?
  `).get(id_registro)

  if (!plant) return { success: false, error: 'Planta no encontrada' }
  if (plant.estado_planta === 'MUERTA') {
    return { success: false, error: 'No puedes drenar una planta muerta' }
  }

  let feedback, xpGained, isError, newHumedad

  if (plant.humedad <= 75) {
    // ❌ No hay exceso — drenaje innecesario
    newHumedad = Math.max(0, plant.humedad - 10)  // penalización leve
    feedback = `La tierra de tu ${plant.nombre_planta} no estaba saturada. ` +
      `Drenar sin necesidad puede secar demasiado el sustrato.`
    xpGained = 0
    isError = true
    updateStats({ errores_riego: 1, acciones_totales: 1 })

  } else {
    // ✅ Drenaje correcto — reduce ~25%
    newHumedad = Math.max(40, plant.humedad - 25)
    feedback = `La tierra estaba saturada. ` +
      `Drenar ayudó a sacar el exceso de agua y proteger las raíces.`
    xpGained = 12
    isError = false
    updateStats({ acciones_correctas: 1, acciones_correctas_hoy: 1, acciones_totales: 1 })
  }

  updatePlantState(id_registro, { humedad: newHumedad })
  const xpResult = addExperience(xpGained)
  checkAndGrantAchievements()
  return { success: true, feedback, xpGained, isError, xpResult }
}
// RF-09: la poda requiere nivel >= 2, tipo_poda !== 'NUNCA'
// y requiere_poda_activa === true.
function prunePlant(id_registro) {
  const progress = getProgress()

  // Condición de nivel: bloqueado antes de nivel 2
  if (progress.nivel < 2) {
    return {
      success: false,
      feedback: '🔒 La herramienta de poda se desbloquea al alcanzar el nivel 2.',
      xpGained: 0,
      isError: false
    }
  }

  const plant = db.prepare(`
    SELECT pu.*, p.nombre_planta, p.tipo_poda
    FROM plantas_usuario pu
    JOIN plantas p ON pu.id_planta = p.id_planta
    WHERE pu.id_registro = ?
  `).get(id_registro)

  if (!plant) return { success: false, error: 'Planta no encontrada' }

  // Esta planta nunca se poda
  if (plant.tipo_poda === 'NUNCA') {
    updateStats({ errores_poda: 1, acciones_totales: 1 })
    return {
      success: true,
      feedback: `El ${plant.nombre_planta} no requiere poda. Cortarlo sin necesidad puede debilitarlo.`,
      xpGained: 0,
      isError: true
    }
  }

  // La planta sí acepta poda, pero no la necesita ahora
  if (!plant.requiere_poda_activa) {
    updateStats({ errores_poda: 1, acciones_totales: 1 })
    return {
      success: true,
      feedback: `Tu ${plant.nombre_planta} no necesita poda ahora. Espera a ver hojas secas o crecimiento desordenado.`,
      xpGained: 0,
      isError: true
    }
  }

  // Poda correcta
  const newSalud = Math.min(100, plant.salud + 10)
  updatePlantState(id_registro, {
    salud: newSalud,
    requiere_poda_activa: 0,
    ultimo_poda: plant.dias_transcurridos
  })
  updateStats({ acciones_correctas: 1, acciones_correctas_hoy: 1, acciones_totales: 1 })
  const xpResult = addExperience(20)
  checkAndGrantAchievements()

  return {
    success: true,
    feedback: `Poda realizada con cuidado. Tu ${plant.nombre_planta} puede concentrar energía en brotes sanos.`,
    xpGained: 20,
    isError: false,
    xpResult
  }
}


// ── Obtiene las 3 acciones más frecuentes del usuario ─────────────────────
// Se usa en la revisión semanal activa (LM5 / RF-36)
// Devuelve las 3 acciones con más errores para la revisión semanal (RF-32).
function getTopActions() {
  const stats = getStats()
  if (!stats) return []

  const actions = [
    {
      key: 'riego',
      label: 'Riego excesivo o prematuro',
      errorCount: stats.errores_riego_semana,
      explanation: 'El exceso de riego deja a las raíces sin aire. Observa la tierra antes de volver a regar.'
    },
    {
      key: 'abono',
      label: 'Abono innecesario',
      errorCount: stats.errores_abono_semana,
      explanation: 'El abono ayuda cuando la planta lo necesita. Usarlo de más puede estresar las raíces.'
    },
    {
      key: 'poda',
      label: 'Poda incorrecta',
      errorCount: stats.errores_poda_semana,
      explanation: 'La poda debe tener propósito: retirar partes secas o controlar crecimiento.'
    },
    {
      key: 'ubicacion',
      label: 'Mala ubicación',
      errorCount: stats.errores_ubicacion_semana,
      explanation: 'La ubicación cambia la luz que recibe la planta. Un mal lugar la debilita poco a poco.'
    },
  ]

  return actions
    .sort((a, b) => b.errorCount - a.errorCount)
    .slice(0, 3)
}

// ── Registra resultado del quiz ───────────────────────────────────────────
function recordQuizResult(correct) {
  if (correct) {
    updateStats({ acciones_correctas: 1, acciones_correctas_hoy: 1, acciones_totales: 1 })
    const xpResult = addExperience(8)
    checkAndGrantAchievements()  // ✅
    return xpResult
  } else {
    updateStats({ acciones_totales: 1 })
    return null
  }
}

// ── Comprueba si debe activarse la revisión semanal ──────────────────────
// Retorna true cuando el día simulado actual alcanza una semana no revisada.
function shouldTriggerWeeklyReview(currentDay) {
  if (currentDay < 7) return false

  const stats = getStats()
  if (!stats) return false

  const currentWeek = Math.floor(currentDay / 7)
  const lastReviewedWeek = stats.semana_simulada_actual ?? 0

  // Dispara cuando la semana actual supera la última evaluada.
  const shouldTrigger = currentWeek > lastReviewedWeek
  console.log(`[Weekly] Día ${currentDay}, semana ${currentWeek}, última evaluada ${lastReviewedWeek}, dispara: ${shouldTrigger}`)
  return shouldTrigger
}

// Función de corrección para resetear semana_simulada_actual.
// Útil cuando el contador se desfasó por bugs previos.
function fixWeeklyCounter(value) {
  db.prepare(`
    UPDATE estadisticas SET semana_simulada_actual = ?
  `).run(value)
}

function recordWeeklyReview(wasCorrect, reviewedWeek = null) {
  const parsedReviewedWeek = Number(reviewedWeek)
  let currentWeek = Number.isFinite(parsedReviewedWeek) && parsedReviewedWeek > 0
    ? Math.floor(parsedReviewedWeek)
    : null

  if (currentWeek === null) {
    const maxDayResult = db.prepare(
      'SELECT MAX(dias_transcurridos) as maxDay FROM plantas_usuario'
    ).get()
    const maxDay = maxDayResult?.maxDay || 0
    currentWeek = Math.floor(maxDay / 7)
  }

  const stats = getStats()
  const lastReviewedWeek = stats?.semana_simulada_actual ?? 0
  currentWeek = Math.max(currentWeek, lastReviewedWeek)

  db.prepare(`
    UPDATE estadisticas
    SET semana_simulada_actual = ?,
        errores_riego_semana = 0,
        errores_abono_semana = 0,
        errores_poda_semana = 0,
        errores_ubicacion_semana = 0
  `).run(currentWeek)

  if (wasCorrect) {
    // ✅ Logro de evaluación correcta
    const existingIds = db.prepare(`SELECT clave_logro FROM logros WHERE clave_logro != ''`)
      .all().map(r => r.clave_logro)

    if (!existingIds.includes('evaluacion_correcta')) {
      const progress = getProgress()
      db.prepare(`
        INSERT INTO logros (clave_logro, nombre_logro, descripcion_logro, fecha_obtencion, tipo_logro)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        'evaluacion_correcta',
        'Evaluador Reflexivo',
        'Identifica correctamente la decisión más perjudicial en la revisión semanal',
        String(progress.nivel),
        'EVALUACION'
      )
    }
    return addExperience(25)
  }
  return null
}

function clearUserPlants() {
  db.prepare('DELETE FROM plantas_usuario').run()
}

// Regresa una planta al panel lateral limpiando ubicación y posición.
function returnPlantToPanel(id_registro) {
  db.prepare(`
    UPDATE plantas_usuario
    SET ubicacion = NULL, pos_x = NULL, pos_y = NULL
    WHERE id_registro = ?
  `).run(id_registro)
}

// Guarda el timestamp actual como último cierre.
// Se llama desde main.js cuando la app se cierra.
function saveLastClose() {
  db.prepare(`UPDATE progreso SET ultimo_cierre = ?`).run(Date.now())
}

// Calcula cuántos días pasaron desde el último cierre.
// Máximo 3 días para no castigar al jugador.
// Retorna 0 si es la primera vez o si cerró hace menos de 10 minutos.
function getOfflineDays() {
  const progress = db.prepare('SELECT ultimo_cierre FROM progreso LIMIT 1').get()
  if (!progress || !progress.ultimo_cierre) return 0

  const msPerDay = 10 * 60 * 1000  // 10 minutos = 1 día de juego
  const elapsed = Date.now() - progress.ultimo_cierre
  const rawDays = Math.floor(elapsed / msPerDay)

  return Math.min(rawDays, 3)  // máximo 3 días offline
}

// Obtiene todos los logros obtenidos por el jugador.
function getAchievements() {
  return db.prepare(`
    SELECT clave_logro AS id_logro, nombre_logro, descripcion_logro,
           fecha_obtencion, tipo_logro
    FROM logros
    ORDER BY fecha_obtencion DESC
  `).all()
}

// Incrementa la racha si el jugador tuvo acciones correctas hoy.
// Resetea a 0 si no cumplió el requisito educativo (RF-22).
function updateStreak(hadCorrectActionToday) {
  const progress = getProgress()
  const newStreak = hadCorrectActionToday
    ? progress.racha_dias + 1
    : 0
  updateProgress({ racha_dias: newStreak })
  return newStreak
}

// Verifica y asigna logros según el estado actual del jugador (RF-21).
// Se llama después de cada acción significativa.
// Solo asigna logros que aún no han sido obtenidos.
function checkAndGrantAchievements() {
  const progress = getProgress()
  const stats = getStats()
  const plants = getUserPlants()
  const existingIds = db.prepare(
    `SELECT clave_logro FROM logros WHERE clave_logro != ''`
  ).all().map(r => r.clave_logro)

  const grant = (id, nombre, descripcion, tipo) => {
    if (existingIds.includes(id)) return  // ya obtenido
    db.prepare(`
      INSERT INTO logros (clave_logro, nombre_logro, descripcion_logro, fecha_obtencion, tipo_logro)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      id, nombre, descripcion,
      String(progress.nivel),  // usamos nivel como fecha aproximada
      tipo
    )
  }

  // ── Logros de progreso ──────────────────────────────────────────────
  if (plants.length >= 1)
    grant('primera_planta', 'Primer Brote', 'Adquiere tu primera planta', 'PROGRESO')

  if (plants.length >= 5)
    grant('cinco_plantas', 'Pequeño Jardín', 'Ten 5 plantas en tu colección', 'PROGRESO')

  if (progress.nivel >= 2)
    grant('primer_nivel', 'Cuidador Novato', 'Alcanza el nivel 2', 'PROGRESO')

  if (progress.nivel >= 3)
    grant('planta_nivel3', 'Verde Experto', 'Alcanza el nivel 3', 'PROGRESO')

  // ── Logros educativos ───────────────────────────────────────────────
  if (stats.diagnosticos_correctos >= 10)
    grant('diagnostico_perfecto', 'Ojo Clínico', 'Acierta 10 diagnósticos previos', 'EDUCATIVO')

  // Semana perfecta: completó una semana sin ningún error
  const totalErrors = stats.errores_riego + stats.errores_abono +
    stats.errores_poda + stats.errores_ubicacion
  const semana = stats.semana_simulada_actual
  if (semana >= 1 && totalErrors === 0)
    grant('sin_errores_semana', 'Semana Perfecta', 'Completa una semana sin errores de cuidado', 'EDUCATIVO')

  // ── Logros de racha ─────────────────────────────────────────────────
  if (progress.racha_dias >= 5)
    grant('racha_5', 'Constante', 'Mantén una racha de 5 días', 'RACHA')

  if (progress.racha_dias >= 10)
    grant('racha_10', 'Dedicado', 'Mantén una racha de 10 días', 'RACHA')
}

function grantQuizPerfectAchievement() {
  const existingIds = db.prepare(`SELECT clave_logro FROM logros WHERE clave_logro != ''`)
    .all().map(r => r.clave_logro)

  if (existingIds.includes('quiz_perfecto')) return

  const progress = getProgress()
  db.prepare(`
    INSERT INTO logros (clave_logro, nombre_logro, descripcion_logro, fecha_obtencion, tipo_logro)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    'quiz_perfecto',
    'Maestro Botanista',
    'Responde correctamente las 5 preguntas del quiz',
    String(progress.nivel),
    'EDUCATIVO'
  )
}

// Verifica si el jugador ya completó el tutorial.
function isTutorialCompleted() {
  const progress = db.prepare('SELECT tutorial_completado FROM progreso LIMIT 1').get()
  return progress ? progress.tutorial_completado === 1 : false
}

// Marca el tutorial como completado.
function completeTutorial() {
  db.prepare('UPDATE progreso SET tutorial_completado = 1').run()
}

// Reinicia completamente el juego eliminando todo el progreso.
// Útil para pruebas y como opción de "nueva partida" para el jugador.
function resetGame() {
  db.prepare('DELETE FROM plantas_usuario').run()
  db.prepare('DELETE FROM estadisticas').run()
  db.prepare('DELETE FROM logros').run()
  db.prepare('UPDATE progreso SET nivel = 1, experiencia = 0, racha_dias = 0, dia_actual = 1, tutorial_completado = 0, ultimo_cierre = NULL').run()
}

// Resetea el tutorial para que vuelva a mostrarse.
// Se usa en "Nueva Partida" y para pruebas de desarrollo.
function resetTutorial() {
  db.prepare('UPDATE progreso SET tutorial_completado = 0').run()
}


// Exportamos todo lo que necesitan los demás módulos
module.exports = {
  initializeDatabase,
  // Catálogo
  getAllPlants,
  getPlantById,
  // Plantas del jugador
  getUserPlants,
  acquirePlant,
  deletePlant,
  updatePlantState,
  placePlantInRoom,
  // Progreso (reemplaza usuarios)
  getProgress,
  updateProgress,
  addExperience,
  // Estadísticas
  getStats,
  updateStats,
  // Simulación
  simulateDays,
  // Acciones de cuidado
  waterPlant,
  fertilizePlant,
  prunePlant,
  // Mecánicas LM-GM
  getTopActions,
  recordWeeklyReview,
  recordQuizResult,
  shouldTriggerWeeklyReview,
  fixWeeklyCounter,
  clearUserPlants,
  returnPlantToPanel,
  saveLastClose,
  getOfflineDays,
  getAchievements,
  updateStreak,
  checkAndGrantAchievements,
  grantQuizPerfectAchievement,
  isTutorialCompleted,
  completeTutorial,
  resetGame,
  resetTutorial,
  drainPlant

}
