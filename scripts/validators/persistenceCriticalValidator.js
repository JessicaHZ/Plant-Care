const assert = require('assert/strict')
const fs = require('fs')
const path = require('path')

function readProjectFile(...segments) {
  return fs.readFileSync(path.join(__dirname, '..', '..', ...segments), 'utf8')
}

function assertIncludes(source, expected, message) {
  assert.ok(source.includes(expected), message)
}

function validatePersistenceCriticalContracts() {
  const schema = readProjectFile('main', 'database', 'schema.js')
  const plantRepository = readProjectFile('main', 'database', 'repositories', 'plantRepository.js')
  const progressRepository = readProjectFile('main', 'database', 'repositories', 'progressRepository.js')
  const databaseFacade = readProjectFile('main', 'database.js')
  const ipcHandlers = readProjectFile('main', 'ipc-handlers.js')
  const achievementHandlers = readProjectFile('main', 'ipc', 'handlers', 'achievementHandlers.js')
  const careHandlers = readProjectFile('main', 'ipc', 'handlers', 'careHandlers.js')
  const minigameHandlers = readProjectFile('main', 'ipc', 'handlers', 'minigameHandlers.js')
  const plantHandlers = readProjectFile('main', 'ipc', 'handlers', 'plantHandlers.js')
  const simulationProgressHandlers = readProjectFile('main', 'ipc', 'handlers', 'simulationProgressHandlers.js')
  const tutorialResetHandlers = readProjectFile('main', 'ipc', 'handlers', 'tutorialResetHandlers.js')
  const weeklyHandlers = readProjectFile('main', 'ipc', 'handlers', 'weeklyHandlers.js')
  const preload = readProjectFile('main', 'preload.js')

  const requiredUserPlantColumns = [
    'estado_planta',
    'ubicacion',
    'humedad',
    'salud',
    'dias_sin_regar',
    'ultimo_riego',
    'dias_transcurridos',
    'requiere_poda_activa',
    'ultimo_poda',
    'pos_x',
    'pos_y',
    'nutrientes'
  ]

  for (const column of requiredUserPlantColumns) {
    assertIncludes(schema, column, `schema.js debe conservar la columna ${column}`)
    assertIncludes(plantRepository, `'${column}'`, `plantRepository debe permitir actualizar ${column}`)
  }

  assertIncludes(
    plantRepository,
    'pu.*',
    'getUserPlants debe recuperar todos los campos persistidos de plantas_usuario'
  )
  assertIncludes(
    plantRepository,
    'updatePlantState(id_registro, { ubicacion, pos_x, pos_y })',
    'updatePlantLocation debe persistir ubicacion y posicion'
  )
  assertIncludes(
    plantRepository,
    'SET ubicacion = NULL, pos_x = NULL, pos_y = NULL',
    'returnPlantToPanel debe limpiar ubicacion y posicion'
  )

  const requiredProgressColumns = [
    'nivel',
    'experiencia',
    'racha_dias',
    'dia_actual',
    'ultimo_cierre',
    'tutorial_completado'
  ]

  for (const column of requiredProgressColumns) {
    assertIncludes(schema, column, `schema.js debe conservar la columna de progreso ${column}`)
  }

  assertIncludes(progressRepository, 'function getProgress()', 'progressRepository debe leer progreso')
  assertIncludes(progressRepository, 'function updateProgress(fields)', 'progressRepository debe actualizar progreso')
  assertIncludes(progressRepository, 'function saveLastClose(timestamp)', 'progressRepository debe guardar ultimo cierre')

  const criticalFacadeFunctions = [
    'getUserPlants',
    'deletePlant',
    'updatePlantState',
    'placePlantInRoom',
    'getProgress',
    'updateProgress',
    'simulateDays',
    'waterPlant',
    'fertilizePlant',
    'prunePlant',
    'returnPlantToPanel',
    'saveLastClose',
    'getOfflineDays'
  ]

  for (const functionName of criticalFacadeFunctions) {
    assertIncludes(
      databaseFacade,
      `${functionName},`,
      `database.js debe exportar ${functionName} en la fachada publica`
    )
  }

  const criticalIpcChannels = [
    'plants:getUserPlants',
    'plant:place',
    'simulation:advance',
    'care:water',
    'care:fertilize',
    'care:prune',
    'progress:get',
    'plants:delete',
    'plants:moveToRoom',
    'simulation:getOfflineDays',
    'weekly:getTopActions',
    'weekly:submit',
    'weekly:shouldTrigger',
    'achievements:get',
    'achievements:grantQuizPerfect',
    'tutorial:isCompleted',
    'tutorial:complete',
    'tutorial:reset',
    'game:reset',
    'quiz:submit',
    'minigame:defense:complete'
  ]

  const ipcRegistrationSources = [
    ipcHandlers,
    plantHandlers,
    careHandlers,
    simulationProgressHandlers,
    weeklyHandlers,
    achievementHandlers,
    tutorialResetHandlers,
    minigameHandlers
  ].join('\n')

  for (const channel of criticalIpcChannels) {
    assertIncludes(
      ipcRegistrationSources,
      channel,
      `IPC debe registrar ${channel}`
    )
    assertIncludes(preload, channel, `preload debe exponer wrapper para ${channel}`)
  }
}

module.exports = {
  validatePersistenceCriticalContracts
}
