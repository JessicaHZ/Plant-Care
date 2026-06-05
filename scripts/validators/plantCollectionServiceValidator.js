const assert = require('assert/strict')

const {
  acquirePlant,
  clearUserPlants,
  deletePlant,
  getUserPlantWithLight,
  getUserPlants,
  returnPlantToPanel,
  updatePlantLocation,
  updatePlantState
} = require('../../main/services/plantCollectionService')

function validatePlantCollectionService() {
  const calls = []
  const plants = [{ id_planta: 3 }]
  const userPlants = [{ id_registro: 7 }]
  const plantWithLight = { id_registro: 9, tipo_luz: 'INDIRECTA' }
  const plantRepository = {
    getUserPlants: () => {
      calls.push({ method: 'getUserPlants' })
      return userPlants
    },
    getPlantById: idPlanta => {
      calls.push({ method: 'getPlantById', idPlanta })
      return plants.find(plant => plant.id_planta === idPlanta)
    },
    getUserPlantWithLight: idRegistro => {
      calls.push({ method: 'getUserPlantWithLight', idRegistro })
      return plantWithLight
    },
    acquirePlant: idPlanta => {
      calls.push({ method: 'acquirePlant', idPlanta })
      return 21
    },
    clearUserPlants: () => calls.push({ method: 'clearUserPlants' }),
    deletePlant: idRegistro => {
      calls.push({ method: 'deletePlant', idRegistro })
      return true
    },
    returnPlantToPanel: idRegistro => calls.push({ method: 'returnPlantToPanel', idRegistro }),
    updatePlantLocation: (idRegistro, ubicacion, posX, posY) => calls.push({
      method: 'updatePlantLocation',
      idRegistro,
      ubicacion,
      posX,
      posY
    }),
    updatePlantState: (idRegistro, fields) => calls.push({ method: 'updatePlantState', idRegistro, fields })
  }

  assert.equal(getUserPlants(plantRepository), userPlants)
  assert.equal(getUserPlantWithLight(plantRepository, 9), plantWithLight)
  assert.equal(acquirePlant(plantRepository, 3), 21)
  assert.throws(() => acquirePlant(plantRepository, 99), /Planta con id 99 no encontrada/)
  clearUserPlants(plantRepository)
  assert.equal(deletePlant(plantRepository, 8), true)
  returnPlantToPanel(plantRepository, 12)
  updatePlantLocation(plantRepository, 9, 'SALA', 20, 30)
  updatePlantState(plantRepository, 15, { salud: 80 })

  assert.deepEqual(calls, [
    { method: 'getUserPlants' },
    { method: 'getUserPlantWithLight', idRegistro: 9 },
    { method: 'getPlantById', idPlanta: 3 },
    { method: 'acquirePlant', idPlanta: 3 },
    { method: 'getPlantById', idPlanta: 99 },
    { method: 'clearUserPlants' },
    { method: 'deletePlant', idRegistro: 8 },
    { method: 'returnPlantToPanel', idRegistro: 12 },
    { method: 'updatePlantLocation', idRegistro: 9, ubicacion: 'SALA', posX: 20, posY: 30 },
    { method: 'updatePlantState', idRegistro: 15, fields: { salud: 80 } }
  ])
}

module.exports = {
  validatePlantCollectionService
}
