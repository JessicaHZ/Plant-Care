function getAllPlants(plantRepository) {
  return plantRepository.getAllPlants()
}

function getPlantById(plantRepository, plantId) {
  return plantRepository.getPlantById(plantId)
}

function seedPlants(plantRepository, plantCatalog) {
  const totalPlants = plantRepository.countCatalogPlants()

  if (totalPlants > 0) {
    plantRepository.updateCatalogPlants(plantCatalog)
    return { action: 'updated', total: plantCatalog.length }
  }

  plantRepository.insertCatalogPlants(plantCatalog)
  return { action: 'inserted', total: plantCatalog.length }
}

module.exports = {
  getAllPlants,
  getPlantById,
  seedPlants
}
