const db = require('./database')
const { registerHandler } = require('./ipc/registerHandler')

// Registra todos los canales IPC entre el proceso main y el renderer.
// Se invoca una sola vez desde main.js al iniciar la app.
function registerIpcHandlers() {

  // ── Catálogo de plantas ─────────────────────────────────────────────────

  // Devuelve todas las plantas del vivero.
  registerHandler(
    'plants:getAll',
    () => {
      const plants = db.getAllPlants()
      return { success: true, plants }
    },
    { success: false, error: 'No se pudo cargar el catálogo' },
    'Error obteniendo catálogo:'
  )

  // Devuelve el detalle de una planta por id.
  registerHandler(
    'plants:getById',
    (event, id_planta) => {
      const plant = db.getPlantById(id_planta)
      return { success: true, plant }
    },
    { success: false, error: 'No se pudo cargar la planta' },
    'Error obteniendo planta:'
  )

  // ── Colección del jugador ───────────────────────────────────────────────

  // Devuelve todas las plantas adquiridas por el jugador.
  registerHandler(
    'plants:getUserPlants',
    () => {
      const plants = db.getUserPlants()
      return { success: true, plants }
    },
    { success: false, error: 'No se pudo cargar tu colección' },
    'Error cargando colección:'
  )

  // Adquiere una planta del vivero y la agrega a la colección.
  registerHandler(
    'plants:acquire',
    (event, id_planta) => {
      const registroId = db.acquirePlant(id_planta)
      return { success: true, registroId }
    },
    { success: false, error: 'No se pudo adquirir la planta' },
    'Error adquiriendo planta:'
  )

  // ── Entorno ─────────────────────────────────────────────────────────────

  // Coloca o mueve una planta a una ubicación del entorno (RF-02, RF-03).
  // Retorna la condición de luz calculada para esa ubicación.
  registerHandler(
    'plant:place',
    (event, { id_registro, ubicacion, pos_x, pos_y }) => {
      const lightCondition = db.placePlantInRoom(id_registro, ubicacion, pos_x, pos_y)
      return { success: true, lightCondition }
    },
    { success: false, error: 'No se pudo colocar la planta' },
    'Error colocando planta:'
  )

  // ── Simulación ──────────────────────────────────────────────────────────

  // Avanza N días simulados y actualiza el estado de todas las plantas.
  registerHandler(
    'simulation:advance',
    (event, days) => {
      const simulation = db.simulateDays(days)
      return {
        success: true,
        results: simulation.results,
        streakEvent: simulation.streakEvent
      }
    },
    { success: false, error: 'Error en la simulación' },
    'Error en simulación:'
  )

  // ── Acciones de cuidado ─────────────────────────────────────────────────

  // RF-07: Regar una planta.
  registerHandler(
    'care:water',
    (event, id_registro) => db.waterPlant(id_registro),
    { success: false, error: 'Error al regar' },
    'Error en riego:'
  )

  // RF-08: Aplicar abono a una planta.
  registerHandler(
    'care:fertilize',
    (event, id_registro) => db.fertilizePlant(id_registro),
    { success: false, error: 'Error al abonar' },
    'Error en abono:'
  )

  // RF-09: Podar una planta (requiere nivel >= 2, tipo_poda !== 'NUNCA',
  // requiere_poda_activa === true).
  registerHandler(
    'care:prune',
    (event, id_registro) => db.prunePlant(id_registro),
    { success: false, error: 'Error al podar' },
    'Error en poda:'
  )

  // ── Diagnóstico previo (RF-31 / LM4 — Analizar) ─────────────────────────

  // Registra el resultado del diagnóstico antes de una acción de cuidado.
  // Si fue correcto, otorga XP adicional y registra en diagnosticos_correctos.
  registerHandler(
    'diagnosis:submit',
    (event, wasCorrect) => {
      const result = db.recordDiagnosisResult(wasCorrect)
      return { success: true, ...result }
    },
    { success: false, error: 'Error registrando diagnóstico' },
    'Error en diagnóstico:'
  )

  // ── Progreso del jugador ────────────────────────────────────────────────

  // Devuelve nivel, experiencia y racha_dias del jugador.
  registerHandler(
    'progress:get',
    () => {
      const progress = db.getProgress()
      return { success: true, progress }
    },
    { success: false, error: 'Error cargando progreso' },
    'Error cargando progreso:'
  )

  // Devuelve las estadísticas de desempeño del jugador.
  registerHandler(
    'stats:get',
    () => {
      const stats = db.getStats()
      return { success: true, stats }
    },
    { success: false, error: 'Error cargando estadísticas' },
    'Error cargando estadísticas:'
  )

  // ── Minijuegos ──────────────────────────────────────────────────────────

  // Registra resultado del quiz (HU-14).
  // Una respuesta correcta cuenta para la racha diaria (RF-22).
  registerHandler(
    'quiz:submit',
    (event, correct) => {
      const xpResult = db.recordQuizResult(correct)
      return { success: true, xpResult }
    },
    { success: false, error: 'Error registrando resultado del quiz' },
    'Error en quiz:'
  )

  // Registra Defensa del Brote con recompensa calculada por desempeno.
  registerHandler(
    'minigame:defense:complete',
    (event, xpAmount) => {
      const result = db.completeDefenseGame(xpAmount)
      return { success: true, ...result }
    },
    { success: false, error: 'Error en Defensa del Brote' },
    'Error en Defensa del Brote:'
  )

  // ── Revisión semanal activa (RF-32 / LM5 — Evaluar) ────────────────────

  // Devuelve las 3 acciones con más errores para presentar al jugador.

  registerHandler(
    'weekly:getTopActions',
    () => {
      const actions = db.getTopActions()
      return { success: true, actions }
    },
    { success: false, error: 'Error cargando acciones de revisión' },
    'Error cargando acciones:'
  )

  // Registra si el jugador evaluó correctamente su peor decisión.
  registerHandler(
    'weekly:submit',
    (event, payload) => {
      const { wasCorrect, reviewedWeek } = db.normalizeWeeklyReview(payload)
      const xpResult = db.recordWeeklyReview(wasCorrect, reviewedWeek)
      return { success: true, xpResult, xpGained: wasCorrect ? 25 : 0 }
    },
    { success: false, error: 'Error registrando revisión' },
    'Error registrando revisión semanal:'
  )

  // Verifica si el día simulado actual debe disparar la revisión semanal.
  registerHandler(
    'weekly:shouldTrigger',
    (event, currentDay) => {
      const should = db.shouldTriggerWeeklyReview(currentDay)
      return { success: true, should }
    },
    { success: false, should: false },
    'Error verificando revisión semanal:'
  )

  // Elimina una planta muerta de la colección del jugador.
  registerHandler(
    'plants:delete',
    (event, id_registro) => {
      const deleted = db.deletePlant(id_registro)
      return { success: deleted }
    },
    { success: false, error: 'No se pudo eliminar la planta' },
    'Error eliminando planta:'
  )

  registerHandler(
    'stats:fixWeekly',
    (event, value) => {
      db.fixWeeklyCounter(value)
      return { success: true }
    },
    { success: false },
    'Error corrigiendo contador semanal:'
  )

  registerHandler(
    'plants:clear',
    () => {
      db.clearUserPlants()
      return { success: true }
    },
    { success: false },
    'Error limpiando plantas del jugador:'
  )

  registerHandler(
    'plants:moveToRoom',
    (event, { id_registro }) => {
      db.returnPlantToPanel(id_registro)
      return { success: true }
    },
    { success: false },
    'Error regresando planta al panel:'
  )

  // Devuelve los días que pasaron mientras el juego estuvo cerrado.
  registerHandler(
    'simulation:getOfflineDays',
    () => {
      const days = db.getOfflineDays()
      return { success: true, days }
    },
    { success: true, days: 0 },
    'Error calculando dias offline:'
  )

  registerHandler(
    'achievements:get',
    () => {
      const achievements = db.getAchievements()
      return { success: true, achievements }
    },
    { success: false, achievements: [] },
    'Error cargando logros:'
  )

  registerHandler(
    'achievements:grantQuizPerfect',
    () => {
      db.grantQuizPerfectAchievement()
      return { success: true }
    },
    { success: false },
    'Error otorgando logro de quiz perfecto:'
  )

  registerHandler(
    'tutorial:isCompleted',
    () => {
      const completed = db.isTutorialCompleted()
      return { success: true, completed }
    },
    { success: true, completed: false },
    'Error consultando estado del tutorial:'
  )

  registerHandler(
    'tutorial:complete',
    () => {
      db.completeTutorial()
      return { success: true }
    },
    { success: false },
    'Error completando tutorial:'
  )

  registerHandler(
    'game:reset',
    () => {
      db.resetGame()
      return { success: true }
    },
    { success: false },
    'Error reiniciando partida:'
  )

  registerHandler(
    'tutorial:reset',
    () => {
      db.resetTutorial()
      return { success: true }
    },
    { success: false },
    'Error reiniciando tutorial:'
  )

  registerHandler(
    'care:drain',
    (event, id_registro) => db.drainPlant(id_registro),
    { success: false, error: 'Error al drenar' },
    'Error en drenaje:'
  )

}



module.exports = { registerIpcHandlers }
