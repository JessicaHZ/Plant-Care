const assert = require('assert/strict')
const fs = require('fs')
const path = require('path')

function readProjectFile(...segments) {
  return fs.readFileSync(path.join(__dirname, '..', '..', ...segments), 'utf8')
}

function assertIncludes(source, expected, message) {
  assert.ok(source.includes(expected), message)
}

function validateMainGameplayContracts() {
  const careActions = readProjectFile('renderer', 'js', 'CareActions.js')
  const environment = readProjectFile('renderer', 'js', 'Environment.js')
  const simulation = readProjectFile('renderer', 'js', 'Simulation.js')
  const diagnosis = readProjectFile('renderer', 'js', 'Diagnosis.js')
  const careService = readProjectFile('main', 'services', 'careService.js')

  const careActionContracts = [
    ['Diagnosis.run(plant, \'water\')', 'regar debe pasar por diagnostico previo'],
    ['window.gameAPI.waterPlant(plant.id_registro)', 'regar debe llamar al IPC de riego'],
    ['Diagnosis.run(plant, \'fertilize\')', 'abonar debe pasar por diagnostico previo'],
    ['window.gameAPI.fertilizePlant(plant.id_registro)', 'abonar debe llamar al IPC de abono'],
    ['window.gameAPI.getProgress()', 'podar debe consultar progreso para bloqueo por nivel'],
    ['window.gameAPI.prunePlant(plant.id_registro)', 'podar debe llamar al IPC de poda'],
    ['window.dispatchEvent(new CustomEvent(\'xp:gained\'', 'acciones de cuidado deben notificar XP'],
    ['tutorial:care-action:completed', 'acciones de cuidado deben notificar tutorial']
  ]

  for (const [expected, message] of careActionContracts) {
    assertIncludes(careActions, expected, message)
  }

  const environmentContracts = [
    ['window.gameAPI.getUserPlants()', 'Environment debe cargar plantas del usuario'],
    ['window.gameAPI.placePlant(', 'Environment debe colocar plantas via gameAPI'],
    ['window.gameAPI.deletePlant(plant.id_registro)', 'Environment debe eliminar plantas muertas via gameAPI'],
    ['window.gameAPI.updatePlantLocation(plant.id_registro', 'Environment debe devolver plantas al panel'],
    ['CareActions.water(plant, afterCareAction)', 'panel debe conectar boton de riego'],
    ['CareActions.fertilize(plant, afterCareAction)', 'panel debe conectar boton de abono'],
    ['CareActions.prune(plant, afterFinalAction)', 'panel debe conectar boton de poda'],
    ['simulation:tick', 'Environment debe refrescarse al avanzar simulacion'],
    ['plant:acquired', 'Environment debe notificar cambios de coleccion tras eliminar']
  ]

  for (const [expected, message] of environmentContracts) {
    assertIncludes(environment, expected, message)
  }

  const simulationContracts = [
    ['_isAdvancing', 'Simulation debe conservar bloqueo contra avances simultaneos'],
    ['window.gameAPI.advanceDays(days)', 'Simulation debe avanzar dias via gameAPI'],
    ['window.dispatchEvent(new CustomEvent(\'simulation:tick\'', 'Simulation debe emitir tick para refrescar pantallas'],
    ['window.gameAPI.getProgress()', 'Simulation debe sincronizar dia desde progreso'],
    ['window.gameAPI.getUserPlants()', 'Simulation debe tener fallback por plantas']
  ]

  for (const [expected, message] of simulationContracts) {
    assertIncludes(simulation, expected, message)
  }

  const diagnosisContracts = [
    ['DiagnosisRules.shouldShowDiagnosis', 'Diagnosis debe usar reglas puras para decidir si mostrar diagnostico'],
    ['DiagnosisScenarioSelector.selectScenario', 'Diagnosis debe seleccionar escenarios centralizados'],
    ['window.gameAPI.drainPlant(plant.id_registro)', 'Diagnosis debe poder drenar en escenario correcto'],
    ['resolve(drainExecuted ? \'drained\' : true)', 'Diagnosis debe evitar riego posterior si ya dreno'],
    ['window.gameAPI.submitDiagnosis(answeredCorrectly)', 'Diagnosis debe registrar resultado educativo']
  ]

  for (const [expected, message] of diagnosisContracts) {
    assertIncludes(diagnosis, expected, message)
  }

  const careServiceContracts = [
    ['if (!plant) return { success: false', 'careService debe manejar planta inexistente'],
    ['plant.estado_planta === \'MUERTA\'', 'careService debe bloquear cuidado de plantas muertas'],
    ['updateStats(careResult.statsUpdates)', 'careService debe actualizar estadisticas'],
    ['updatePlantState(idRegistro', 'careService debe persistir cambios de planta'],
    ['addExperience(careResult.xpGained)', 'careService debe otorgar experiencia'],
    ['recordResponsibleCareSession()', 'careService debe registrar racha en acciones correctas'],
    ['checkAndGrantAchievements()', 'careService debe revisar logros tras acciones']
  ]

  for (const [expected, message] of careServiceContracts) {
    assertIncludes(careService, expected, message)
  }
}

module.exports = {
  validateMainGameplayContracts
}
