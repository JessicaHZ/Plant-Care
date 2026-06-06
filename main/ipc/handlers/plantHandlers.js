const achievementRepository = require('../../database/repositories/achievementRepository')
const plantRepository = require('../../database/repositories/plantRepository')
const progressRepository = require('../../database/repositories/progressRepository')
const statsRepository = require('../../database/repositories/statsRepository')
const {
  checkAndGrantAchievements
} = require('../../services/achievementService')
const plantCatalogService = require('../../services/plantCatalogService')
const plantCollectionService = require('../../services/plantCollectionService')
const { calculatePlacementResult } = require('../../services/plantPlacementService')
const progressService = require('../../services/progressService')
const statsService = require('../../services/statsService')

function getProgress() {
  return progressService.getProgress(progressRepository)
}

function getStats() {
  return statsService.getStats(statsRepository)
}

function getUserPlants() {
  return plantCollectionService.getUserPlants(plantRepository)
}

function updateStats(updates) {
  statsService.updateStats(statsRepository, updates)
}

function checkPlantAchievements() {
  return checkAndGrantAchievements({
    achievementRepository,
    getProgress,
    getStats,
    getUserPlants
  })
}

function registerPlantHandlers({ registerHandler }) {
  registerHandler(
    'plants:getAll',
    () => {
      const plants = plantCatalogService.getAllPlants(plantRepository)
      return { success: true, plants }
    },
    { success: false, error: 'No se pudo cargar el catalogo' },
    'Error obteniendo catalogo:'
  )

  registerHandler(
    'plants:getById',
    (_event, id_planta) => {
      const plant = plantCatalogService.getPlantById(plantRepository, id_planta)
      return { success: true, plant }
    },
    { success: false, error: 'No se pudo cargar la planta' },
    'Error obteniendo planta:'
  )

  registerHandler(
    'plants:getUserPlants',
    () => {
      const plants = getUserPlants()
      return { success: true, plants }
    },
    { success: false, error: 'No se pudo cargar tu coleccion' },
    'Error cargando coleccion:'
  )

  registerHandler(
    'plants:acquire',
    (_event, id_planta) => {
      const registroId = plantCollectionService.acquirePlant(plantRepository, id_planta)
      checkPlantAchievements()
      return { success: true, registroId }
    },
    { success: false, error: 'No se pudo adquirir la planta' },
    'Error adquiriendo planta:'
  )

  registerHandler(
    'plant:place',
    (_event, { id_registro, ubicacion, pos_x, pos_y }) => {
      const plant = plantCollectionService.getUserPlantWithLight(plantRepository, id_registro)
      const placementResult = calculatePlacementResult({ plant, ubicacion })

      plantCollectionService.updatePlantLocation(
        plantRepository,
        id_registro,
        ubicacion,
        pos_x,
        pos_y
      )

      if (placementResult.shouldRecordLocationError) {
        updateStats({ errores_ubicacion: 1, acciones_totales: 1 })
      }

      return { success: true, lightCondition: placementResult.roomLight }
    },
    { success: false, error: 'No se pudo colocar la planta' },
    'Error colocando planta:'
  )

  registerHandler(
    'plants:delete',
    (_event, id_registro) => {
      const deleted = plantCollectionService.deletePlant(plantRepository, id_registro)
      return { success: deleted }
    },
    { success: false, error: 'No se pudo eliminar la planta' },
    'Error eliminando planta:'
  )

  registerHandler(
    'plants:clear',
    () => {
      plantCollectionService.clearUserPlants(plantRepository)
      return { success: true }
    },
    { success: false },
    'Error limpiando plantas del jugador:'
  )

  registerHandler(
    'plants:moveToRoom',
    (_event, { id_registro }) => {
      plantCollectionService.returnPlantToPanel(plantRepository, id_registro)
      return { success: true }
    },
    { success: false },
    'Error regresando planta al panel:'
  )
}

module.exports = {
  registerPlantHandlers
}
