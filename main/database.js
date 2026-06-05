const { db, getDatabasePath } = require('./database/connection')
const achievementRepository = require('./database/repositories/achievementRepository')
const plantRepository = require('./database/repositories/plantRepository')
const progressRepository = require('./database/repositories/progressRepository')
const statsRepository = require('./database/repositories/statsRepository')
const PLANT_CATALOG = require('./database/seeds/plantCatalog')
const { initializeSchema, initializeSchemaIndexes } = require('./database/schema')
const {
  ACHIEVEMENTS,
  LEGACY_ACHIEVEMENT_KEYS
} = require('./domain/achievementDefinitions')
const {
  getTopWeeklyActions,
  normalizeWeeklyReviewPayload,
  recordWeeklyReview: recordWeeklyReviewFromService,
  shouldTriggerWeeklyReview: shouldTriggerWeeklyReviewRule
} = require('./services/weeklyReviewService')
const {
  checkAndGrantAchievements: checkAndGrantAchievementsFromService,
  getAchievements: getAchievementsFromService,
  grantAchievement,
  grantQuizPerfectAchievement: grantQuizPerfectAchievementFromService,
  migrateLegacyAchievements
} = require('./services/achievementService')
const plantCatalogService = require('./services/plantCatalogService')
const plantCollectionService = require('./services/plantCollectionService')
const { calculatePlacementResult } = require('./services/plantPlacementService')
const progressService = require('./services/progressService')
const careService = require('./services/careService')
const diagnosisService = require('./services/diagnosisService')
const minigameService = require('./services/minigameService')
const quizService = require('./services/quizService')
const resetService = require('./services/resetService')
const simulationService = require('./services/simulationService')
const statsService = require('./services/statsService')
const streakService = require('./services/streakService')
const sessionState = {
  responsibleCareAwardedThisSession: false,
  streakBlockedThisSession: false
}

function initializeDatabase() {
  initializeSchema(db)

  migrateCurrentDayFromPlantState()

  initializeSchemaIndexes(db)

  migrateLegacyAchievements(achievementRepository, LEGACY_ACHIEVEMENT_KEYS)

  seedPlants()

  console.log('Base de datos inicializada en:', getDatabasePath())
}

// Obtiene el estado global del jugador.
// Crea la fila inicial si el juego se ejecuta por primera vez.
function getProgress() {
  return progressService.getProgress(progressRepository)
}

// Actualiza uno o más campos del progreso del jugador.
// Uso: updateProgress({ experiencia: 150, nivel: 2 })
function updateProgress(fields) {
  progressService.updateProgress(progressRepository, fields)
}

function migrateCurrentDayFromPlantState() {
  progressService.migrateCurrentDayFromPlantState({
    progressRepository,
    plantRepository
  })
}

// Solo se ejecuta una vez: la primera vez que corre la app.
function seedPlants() {
  const result = plantCatalogService.seedPlants(plantRepository, PLANT_CATALOG)
  console.log(result.action === 'updated'
    ? 'Catálogo actualizado'
    : 'Catálogo insertado: 20 especies reales')
}

// ── Consultas de plantas ──────────────────────────────────────────────────

// Devuelve todas las plantas del catalogo
function getAllPlants() {
  return plantCatalogService.getAllPlants(plantRepository)
}

// Devuelve una planta por su id
function getPlantById(id_planta) {
  return plantCatalogService.getPlantById(plantRepository, id_planta)
}

// Devuelve todas las plantas adquiridas por el jugador.
// Sin filtro de usuario: sesion local unica (sin autenticacion).
function getUserPlants() {
  return plantCollectionService.getUserPlants(plantRepository)
}

// Agrega una planta a la coleccion del usuario.
function acquirePlant(id_planta) {
  const registroId = plantCollectionService.acquirePlant(plantRepository, id_planta)
  checkAndGrantAchievements()
  return registroId
}

// Elimina una planta de la coleccion del jugador por su id_registro.
// Solo debe usarse cuando la planta esta MUERTA (validacion en frontend).
function deletePlant(id_registro) {
  return plantCollectionService.deletePlant(plantRepository, id_registro)
}

// Actualiza el estado de una planta del usuario.
function updatePlantState(id_registro, fields) {
  plantCollectionService.updatePlantState(plantRepository, id_registro, fields)
}

// Coloca una planta en una ubicacion del entorno.
function placePlantInRoom(id_registro, ubicacion, pos_x = null, pos_y = null) {
  const plant = plantCollectionService.getUserPlantWithLight(plantRepository, id_registro)
  const placementResult = calculatePlacementResult({ plant, ubicacion })

  plantCollectionService.updatePlantLocation(plantRepository, id_registro, ubicacion, pos_x, pos_y)

  if (placementResult.shouldRecordLocationError) {
    updateStats({ errores_ubicacion: 1, acciones_totales: 1 })
  }

  return placementResult.roomLight
}

// ── Actualiza estadísticas del jugador ────────────────────────────────────
// Incrementa contadores en la tabla estadísticas (singleton).
// Uso: updateStats({ errores_riego: 1, acciones_totales: 1 })
function updateStats(updates) {
  statsService.updateStats(statsRepository, updates)
}

// ── Actualiza XP y nivel del jugador ──────────────────────────────────────
// Suma XP al jugador y recalcula su nivel.
// Formula: nivel = min(5, floor(XP / 100) + 1)
// Retorna el nuevo estado y si hubo subida de nivel.
function addExperience(xpAmount) {
  return progressService.addExperience(progressRepository, xpAmount)
}

// ── Obtiene estadísticas del jugador ──────────────────────────────────────
// Obtiene las estadísticas del jugador.
// Crea la fila inicial si es la primera ejecución.
function getStats() {
  return statsService.getStats(statsRepository)
}

// ── Simulación: avanza N días para todas las plantas del usuario ──────────
// Esta es la función más importante del motor de simulación.
// Avanza N días simulados para todas las plantas del jugador.
function simulateDays(daysToAdvance) {
  return simulationService.simulateDays({
    daysToAdvance,
    getUserPlants,
    updatePlantState,
    updateStats,
    getProgress,
    updateProgress,
    resetStreakForPlantDeath,
    checkAndGrantAchievements,
    runInTransaction: callback => db.transaction(callback)()
  })
}

// ── Acciones de cuidado ───────────────────────────────────────────────────

function waterPlant(id_registro) {
  return careService.waterPlant({
    idRegistro: id_registro,
    plantRepository,
    updateStats,
    updatePlantState,
    addExperience,
    recordResponsibleCareSession,
    checkAndGrantAchievements
  })
}

// El abono aporta nutrientes al sustrato — no cura directamente.
// Con nutrientes altos, la simulación diaria recupera salud extra.
// Abonar con nutrientes altos quema las raíces.
function fertilizePlant(id_registro) {
  return careService.fertilizePlant({
    idRegistro: id_registro,
    plantRepository,
    updateStats,
    updatePlantState,
    addExperience,
    recordResponsibleCareSession,
    checkAndGrantAchievements
  })
}

// Drena el exceso de agua de una planta.
// Disponible solo cuando la tierra está saturada.
// Simula: inclinar maceta, secar sustrato, mejorar ventilación.
function drainPlant(id_registro) {
  return careService.drainPlant({
    idRegistro: id_registro,
    plantRepository,
    updateStats,
    updatePlantState,
    addExperience,
    recordResponsibleCareSession,
    checkAndGrantAchievements
  })
}
// RF-09: la poda requiere nivel >= 2, tipo_poda !== 'NUNCA'
// y requiere_poda_activa === true.
function prunePlant(id_registro) {
  return careService.prunePlant({
    idRegistro: id_registro,
    plantRepository,
    getProgress,
    updateStats,
    updatePlantState,
    addExperience,
    recordResponsibleCareSession,
    checkAndGrantAchievements
  })
}


// ── Obtiene las 3 acciones más frecuentes del usuario ─────────────────────
// Se usa en la revisión semanal activa (LM5 / RF-36)
// Devuelve las 3 acciones con más errores para la revisión semanal (RF-32).
function getTopActions() {
  const stats = getStats()
  return getTopWeeklyActions(stats)
}

// ── Registra resultado del quiz ───────────────────────────────────────────
function recordQuizResult(correct) {
  return quizService.recordQuizResult({
    correct,
    updateStats,
    addExperience,
    checkAndGrantAchievements
  })
}

function recordDiagnosisResult(wasCorrect) {
  return diagnosisService.recordDiagnosisResult({
    wasCorrect,
    updateStats,
    addExperience,
    recordResponsibleCareSession,
    checkAndGrantAchievements
  })
}

function completeDefenseGame(xpAmount) {
  return minigameService.completeDefenseGame({
    xpAmount,
    addExperience,
    updateStats,
    checkAndGrantAchievements
  })
}

function shouldTriggerWeeklyReview(currentDay) {
  const stats = getStats()
  const currentWeek = Math.floor(currentDay / 7)
  const lastReviewedWeek = stats?.semana_simulada_actual ?? 0
  const shouldTrigger = shouldTriggerWeeklyReviewRule({ currentDay, stats })
  console.log(`[Weekly] Dia ${currentDay}, semana ${currentWeek}, ultima evaluada ${lastReviewedWeek}, dispara: ${shouldTrigger}`)
  return shouldTrigger
}

// Función de corrección para resetear semana_simulada_actual.
// Útil cuando el contador se desfasó por bugs previos.
function fixWeeklyCounter(value) {
  statsService.fixWeeklyCounter(statsRepository, value)
}

function recordWeeklyReview(wasCorrect, reviewedWeek = null) {
  return recordWeeklyReviewFromService({
    wasCorrect,
    reviewedWeek,
    statsRepository,
    achievementRepository,
    evaluationAchievement: ACHIEVEMENTS.evaluacion_correcta,
    getStats,
    getProgress,
    resetWeeklyCounters: statsService.resetWeeklyCounters,
    grantAchievement,
    addExperience
  })
}

function normalizeWeeklyReview(payload) {
  return normalizeWeeklyReviewPayload(payload)
}

function clearUserPlants() {
  plantCollectionService.clearUserPlants(plantRepository)
}

// Regresa una planta al panel lateral limpiando ubicación y posición.
function returnPlantToPanel(id_registro) {
  plantCollectionService.returnPlantToPanel(plantRepository, id_registro)
}

// Guarda el timestamp actual como último cierre.
// Se llama desde main.js cuando la app se cierra.
function saveLastClose() {
  progressService.saveLastClose(progressRepository)
}

// Calcula cuántos días pasaron desde el último cierre.
// Máximo 3 días para no castigar al jugador.
// Retorna 0 si es la primera vez o si cerró hace menos de 10 minutos.
function getOfflineDays() {
  return progressService.getOfflineDays(progressRepository)
}

// Obtiene todos los logros obtenidos por el jugador.
function getAchievements() {
  return getAchievementsFromService(achievementRepository)
}

// Incrementa la racha si el jugador tuvo acciones correctas hoy.
// Resetea a 0 si no cumplió el requisito educativo (RF-22).
function recordResponsibleCareSession() {
  return streakService.recordResponsibleCareSession({
    sessionState,
    getProgress,
    updateProgress
  })
}

function resetStreakForPlantDeath() {
  return streakService.resetStreakForPlantDeath({
    sessionState,
    getProgress,
    updateProgress
  })
}

function updateStreak() {
  return recordResponsibleCareSession()
}

// Verifica y asigna logros según el estado actual del jugador (RF-21).
// Se llama después de cada acción significativa.
// Solo asigna logros que aún no han sido obtenidos.
function checkAndGrantAchievements() {
  return checkAndGrantAchievementsFromService({
    achievementRepository,
    getProgress,
    getStats,
    getUserPlants
  })
}

function grantQuizPerfectAchievement() {
  return grantQuizPerfectAchievementFromService({
    achievementRepository,
    achievement: ACHIEVEMENTS.quiz_perfecto,
    getProgress
  })
}

// Verifica si el jugador ya completó el tutorial.
function isTutorialCompleted() {
  return progressService.isTutorialCompleted(progressRepository)
}

// Marca el tutorial como completado.
function completeTutorial() {
  progressService.completeTutorial(progressRepository)
}

// Reinicia completamente el juego eliminando todo el progreso.
// Útil para pruebas y como opción de "nueva partida" para el jugador.
function resetGame() {
  resetService.resetGame({
    clearUserPlants,
    statsRepository,
    achievementRepository,
    progressRepository,
    resetSessionState: () => {
      sessionState.responsibleCareAwardedThisSession = false
      sessionState.streakBlockedThisSession = false
    }
  })
}

// Resetea el tutorial para que vuelva a mostrarse.
// Se usa en "Nueva Partida" y para pruebas de desarrollo.
function resetTutorial() {
  progressService.resetTutorial(progressRepository)
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
  completeDefenseGame,
  normalizeWeeklyReview,
  recordDiagnosisResult,
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
  recordResponsibleCareSession,
  checkAndGrantAchievements,
  grantQuizPerfectAchievement,
  isTutorialCompleted,
  completeTutorial,
  resetGame,
  resetTutorial,
  drainPlant

}
