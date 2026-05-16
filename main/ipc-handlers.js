const { ipcMain } = require('electron')
const db = require('./database')

// Registra todos los canales IPC entre el proceso main y el renderer.
// Se invoca una sola vez desde main.js al iniciar la app.
function registerIpcHandlers() {

  // ── Catálogo de plantas ─────────────────────────────────────────────────

  // Devuelve todas las plantas del vivero.
  ipcMain.handle('plants:getAll', async () => {
    try {
      const plants = db.getAllPlants()
      return { success: true, plants }
    } catch (error) {
      console.error('Error obteniendo catálogo:', error)
      return { success: false, error: 'No se pudo cargar el catálogo' }
    }
  })

  // Devuelve el detalle de una planta por id.
  ipcMain.handle('plants:getById', async (event, id_planta) => {
    try {
      const plant = db.getPlantById(id_planta)
      return { success: true, plant }
    } catch (error) {
      console.error('Error obteniendo planta:', error)
      return { success: false, error: 'No se pudo cargar la planta' }
    }
  })

  // ── Colección del jugador ───────────────────────────────────────────────

  // Devuelve todas las plantas adquiridas por el jugador.
  ipcMain.handle('plants:getUserPlants', async () => {
    try {
      const plants = db.getUserPlants()
      return { success: true, plants }
    } catch (error) {
      console.error('Error cargando colección:', error)
      return { success: false, error: 'No se pudo cargar tu colección' }
    }
  })

  // Adquiere una planta del vivero y la agrega a la colección.
  ipcMain.handle('plants:acquire', async (event, id_planta) => {
    try {
      const registroId = db.acquirePlant(id_planta)
      return { success: true, registroId }
    } catch (error) {
      console.error('Error adquiriendo planta:', error)
      return { success: false, error: 'No se pudo adquirir la planta' }
    }
  })

  // ── Entorno ─────────────────────────────────────────────────────────────

  // Coloca o mueve una planta a una ubicación del entorno (RF-02, RF-03).
  // Retorna la condición de luz calculada para esa ubicación.
  ipcMain.handle('plant:place', async (event, { id_registro, ubicacion, pos_x, pos_y }) => {
    try {
      const lightCondition = db.placePlantInRoom(id_registro, ubicacion, pos_x, pos_y)
      return { success: true, lightCondition }
    } catch (error) {
      console.error('Error colocando planta:', error)
      return { success: false, error: 'No se pudo colocar la planta' }
    }
  })

  // ── Simulación ──────────────────────────────────────────────────────────

  // Avanza N días simulados y actualiza el estado de todas las plantas.
  ipcMain.handle('simulation:advance', async (event, days) => {
    try {
      const results = db.simulateDays(days)
      return { success: true, results }
    } catch (error) {
      console.error('Error en simulación:', error)
      return { success: false, error: 'Error en la simulación' }
    }
  })

  // ── Acciones de cuidado ─────────────────────────────────────────────────

  // RF-07: Regar una planta.
  ipcMain.handle('care:water', async (event, id_registro) => {
    try {
      return db.waterPlant(id_registro)
    } catch (error) {
      console.error('Error en riego:', error)
      return { success: false, error: 'Error al regar' }
    }
  })

  // RF-08: Aplicar abono a una planta.
  ipcMain.handle('care:fertilize', async (event, id_registro) => {
    try {
      return db.fertilizePlant(id_registro)
    } catch (error) {
      console.error('Error en abono:', error)
      return { success: false, error: 'Error al abonar' }
    }
  })

  // RF-09: Podar una planta (requiere nivel >= 2, tipo_poda !== 'NUNCA',
  // requiere_poda_activa === true).
  ipcMain.handle('care:prune', async (event, id_registro) => {
    try {
      return db.prunePlant(id_registro)
    } catch (error) {
      console.error('Error en poda:', error)
      return { success: false, error: 'Error al podar' }
    }
  })

  // ── Diagnóstico previo (RF-31 / LM4 — Analizar) ─────────────────────────

  // Registra el resultado del diagnóstico antes de una acción de cuidado.
  // Si fue correcto, otorga XP adicional y registra en diagnosticos_correctos.
  ipcMain.handle('diagnosis:submit', async (event, wasCorrect) => {
    try {
      if (wasCorrect) {
        db.updateStats({ diagnosticos_correctos: 1 })
        const xpResult = db.addExperience(10)
        return { success: true, xpGained: 10, xpResult }
      }
      return { success: true, xpGained: 0 }
    } catch (error) {
      console.error('Error en diagnóstico:', error)
      return { success: false, error: 'Error registrando diagnóstico' }
    }
  })

  // ── Progreso del jugador ────────────────────────────────────────────────

  // Devuelve nivel, experiencia y racha_dias del jugador.
  ipcMain.handle('progress:get', async () => {
    try {
      const progress = db.getProgress()
      return { success: true, progress }
    } catch (error) {
      console.error('Error cargando progreso:', error)
      return { success: false, error: 'Error cargando progreso' }
    }
  })

  // Devuelve las estadísticas de desempeño del jugador.
  ipcMain.handle('stats:get', async () => {
    try {
      const stats = db.getStats()
      return { success: true, stats }
    } catch (error) {
      console.error('Error cargando estadísticas:', error)
      return { success: false, error: 'Error cargando estadísticas' }
    }
  })

  // ── Minijuegos ──────────────────────────────────────────────────────────

  // Registra resultado del quiz (HU-14).
  // Una respuesta correcta cuenta para la racha diaria (RF-22).
  ipcMain.handle('quiz:submit', async (event, correct) => {
    try {
      const xpResult = db.recordQuizResult(correct)
      return { success: true, xpResult }
    } catch (error) {
      console.error('Error en quiz:', error)
      return { success: false, error: 'Error registrando resultado del quiz' }
    }
  })

  // Registra resultado del minijuego de plagas (HU-13).
  ipcMain.handle('minigame:pests:complete', async (event, correct) => {
    try {
      const xpAmount = correct ? 20 : 0
      const xpResult = correct ? db.addExperience(xpAmount) : null

      db.updateStats(
        correct
          ? { acciones_correctas: 1, acciones_correctas_hoy: 1, acciones_totales: 1 }
          : { acciones_totales: 1 }
      )

      return { success: true, xpGained: xpAmount, xpResult }
    } catch (error) {
      console.error('Error en minijuego de plagas:', error)
      return { success: false, error: 'Error en minijuego de plagas' }
    }
  })

  // ── Revisión semanal activa (RF-32 / LM5 — Evaluar) ────────────────────

  // Devuelve las 3 acciones con más errores para presentar al jugador.
  ipcMain.handle('weekly:getTopActions', async () => {
    try {
      const actions = db.getTopActions()
      return { success: true, actions }
    } catch (error) {
      console.error('Error cargando acciones:', error)
      return { success: false, error: 'Error cargando acciones de revisión' }
    }
  })

  // Registra si el jugador evaluó correctamente su peor decisión.
  ipcMain.handle('weekly:submit', async (event, wasCorrect) => {
    try {
      const xpResult = db.recordWeeklyReview(wasCorrect)
      return { success: true, xpResult, xpGained: wasCorrect ? 25 : 0 }
    } catch (error) {
      console.error('Error registrando revisión semanal:', error)
      return { success: false, error: 'Error registrando revisión' }
    }
  })

  // Verifica si el día simulado actual debe disparar la revisión semanal.
  ipcMain.handle('weekly:shouldTrigger', async (event, currentDay) => {
    try {
      const should = db.shouldTriggerWeeklyReview(currentDay)
      return { success: true, should }
    } catch (error) {
      console.error('Error verificando revisión semanal:', error)
      return { success: false, should: false }
    }
  })

  // Elimina una planta muerta de la colección del jugador.
  ipcMain.handle('plants:delete', async (event, id_registro) => {
    try {
      const deleted = db.deletePlant(id_registro)
      return { success: deleted }
    } catch (error) {
      console.error('Error eliminando planta:', error)
      return { success: false, error: 'No se pudo eliminar la planta' }
    }
  })

  ipcMain.handle('stats:fixWeekly', async (event, value) => {
    try {
      db.fixWeeklyCounter(value)
      return { success: true }
    } catch (error) {
      return { success: false }
    }
  })

  ipcMain.handle('plants:clear', async () => {
    try {
      db.clearUserPlants()
      return { success: true }
    } catch (error) {
      return { success: false }
    }
  })

  ipcMain.handle('plants:moveToRoom', async (event, { id_registro }) => {
    try {
      db.returnPlantToPanel(id_registro)
      return { success: true }
    } catch (error) {
      console.error('Error regresando planta al panel:', error)
    return { success: false }
    }
  })

  // Devuelve los días que pasaron mientras el juego estuvo cerrado.
  ipcMain.handle('simulation:getOfflineDays', async () => {
    try {
      const days = db.getOfflineDays()
      return { success: true, days }
    } catch (error) {
      return { success: true, days: 0 }
    }
  })

  ipcMain.handle('achievements:get', async () => {
    try {
      const achievements = db.getAchievements()
      return { success: true, achievements }
    } catch (error) {
      return { success: false, achievements: [] }
    }
  })

  ipcMain.handle('achievements:grantQuizPerfect', async () => {
    try {
      db.grantQuizPerfectAchievement()
      return { success: true }
    } catch (error) {
      return { success: false }
    }
  })

  ipcMain.handle('tutorial:isCompleted', async () => {
  try {
    const completed = db.isTutorialCompleted()
    return { success: true, completed }
  } catch (error) {
    return { success: true, completed: false }
  }
  })

  ipcMain.handle('tutorial:complete', async () => {
  try {
    db.completeTutorial()
    return { success: true }
  } catch (error) {
    return { success: false }
  }
  })

}



module.exports = { registerIpcHandlers }