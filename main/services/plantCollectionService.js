function acquirePlant(plantRepository, plantId) {
  const plant = plantRepository.getPlantById(plantId)
  if (!plant) throw new Error(`Planta con id ${plantId} no encontrada`)

  return plantRepository.acquirePlant(plantId)
}

function clearUserPlants(plantRepository) {
  plantRepository.clearUserPlants()
}

function getUserPlants(plantRepository) {
  return plantRepository.getUserPlants()
}

function getUserPlantWithLight(plantRepository, idRegistro) {
  return plantRepository.getUserPlantWithLight(idRegistro)
}

function deletePlant(plantRepository, idRegistro) {
  return plantRepository.deletePlant(idRegistro)
}

function returnPlantToPanel(plantRepository, idRegistro) {
  plantRepository.returnPlantToPanel(idRegistro)
}

function updatePlantState(plantRepository, idRegistro, fields) {
  plantRepository.updatePlantState(idRegistro, fields)
}

function updatePlantLocation(plantRepository, idRegistro, ubicacion, posX = null, posY = null) {
  plantRepository.updatePlantLocation(idRegistro, ubicacion, posX, posY)
}

module.exports = {
  acquirePlant,
  clearUserPlants,
  deletePlant,
  getUserPlantWithLight,
  getUserPlants,
  returnPlantToPanel,
  updatePlantLocation,
  updatePlantState
}
