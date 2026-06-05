const assert = require('assert/strict')

const {
  getAllPlants,
  getPlantById,
  seedPlants
} = require('../../main/services/plantCatalogService')

function validatePlantCatalogService() {
  const plants = [{ id_planta: 1 }, { id_planta: 2 }]
  const calls = []
  const plantRepository = {
    getAllPlants: () => {
      calls.push({ method: 'getAllPlants' })
      return plants
    },
    getPlantById: plantId => {
      calls.push({ method: 'getPlantById', plantId })
      return plants.find(plant => plant.id_planta === plantId)
    },
    countCatalogPlants: () => 0,
    insertCatalogPlants: plantCatalog => calls.push({ method: 'insertCatalogPlants', plantCatalog }),
    updateCatalogPlants: plantCatalog => calls.push({ method: 'updateCatalogPlants', plantCatalog })
  }

  assert.equal(getAllPlants(plantRepository), plants)
  assert.deepEqual(getPlantById(plantRepository, 2), { id_planta: 2 })
  assert.deepEqual(seedPlants(plantRepository, plants), { action: 'inserted', total: 2 })
  assert.deepEqual(calls, [
    { method: 'getAllPlants' },
    { method: 'getPlantById', plantId: 2 },
    { method: 'insertCatalogPlants', plantCatalog: plants }
  ])

  const updateCalls = []
  assert.deepEqual(
    seedPlants({
      countCatalogPlants: () => 3,
      insertCatalogPlants: plantCatalog => updateCalls.push({ method: 'insertCatalogPlants', plantCatalog }),
      updateCatalogPlants: plantCatalog => updateCalls.push({ method: 'updateCatalogPlants', plantCatalog })
    }, plants),
    { action: 'updated', total: 2 }
  )
  assert.deepEqual(updateCalls, [
    { method: 'updateCatalogPlants', plantCatalog: plants }
  ])
}

module.exports = {
  validatePlantCatalogService
}
