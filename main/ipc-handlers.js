const { registerAchievementHandlers } = require('./ipc/handlers/achievementHandlers')
const { registerCareHandlers } = require('./ipc/handlers/careHandlers')
const { registerMinigameHandlers } = require('./ipc/handlers/minigameHandlers')
const { registerPlantHandlers } = require('./ipc/handlers/plantHandlers')
const { registerSimulationProgressHandlers } = require('./ipc/handlers/simulationProgressHandlers')
const { registerWeeklyHandlers } = require('./ipc/handlers/weeklyHandlers')
const { registerTutorialResetHandlers } = require('./ipc/handlers/tutorialResetHandlers')
const { registerHandler } = require('./ipc/registerHandler')

// Registra todos los canales IPC entre el proceso main y el renderer.
// Se invoca una sola vez desde main.js al iniciar la app.
function registerIpcHandlers() {
  registerPlantHandlers({ registerHandler })
  registerCareHandlers({ registerHandler })
  registerSimulationProgressHandlers({ registerHandler })
  registerWeeklyHandlers({ registerHandler })
  registerAchievementHandlers({ registerHandler })
  registerTutorialResetHandlers({ registerHandler })
  registerMinigameHandlers({ registerHandler })
}



module.exports = { registerIpcHandlers }
