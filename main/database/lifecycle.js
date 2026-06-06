const { db, getDatabasePath } = require('./connection')
const achievementRepository = require('./repositories/achievementRepository')
const plantRepository = require('./repositories/plantRepository')
const progressRepository = require('./repositories/progressRepository')
const PLANT_CATALOG = require('./seeds/plantCatalog')
const { initializeSchema, initializeSchemaIndexes } = require('./schema')
const { LEGACY_ACHIEVEMENT_KEYS } = require('../domain/achievementDefinitions')
const { migrateLegacyAchievements } = require('../services/achievementService')
const plantCatalogService = require('../services/plantCatalogService')
const progressService = require('../services/progressService')

function migrateCurrentDayFromPlantState() {
  progressService.migrateCurrentDayFromPlantState({
    progressRepository,
    plantRepository
  })
}

function seedPlants() {
  const result = plantCatalogService.seedPlants(plantRepository, PLANT_CATALOG)
  console.log(result.action === 'updated'
    ? 'Catalogo actualizado'
    : 'Catalogo insertado: 20 especies reales')
}

function initializeDatabase() {
  initializeSchema(db)

  migrateCurrentDayFromPlantState()

  initializeSchemaIndexes(db)

  migrateLegacyAchievements(achievementRepository, LEGACY_ACHIEVEMENT_KEYS)

  seedPlants()

  console.log('Base de datos inicializada en:', getDatabasePath())
}

function saveLastClose() {
  progressService.saveLastClose(progressRepository)
}

module.exports = {
  initializeDatabase,
  saveLastClose
}
