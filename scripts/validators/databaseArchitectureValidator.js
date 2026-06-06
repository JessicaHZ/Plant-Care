const assert = require('assert/strict')
const fs = require('fs')
const path = require('path')

function readProjectFile(...segments) {
  return fs.readFileSync(path.join(__dirname, '..', '..', ...segments), 'utf8')
}

function validateDatabaseArchitecture() {
  const mainProcess = readProjectFile('main', 'main.js')
  const ipcHandlers = readProjectFile('main', 'ipc-handlers.js')
  const handlerDependencies = readProjectFile('main', 'ipc', 'handlerDependencies.js')
  const minigameHandlers = readProjectFile('main', 'ipc', 'handlers', 'minigameHandlers.js')
  const weeklyHandlers = readProjectFile('main', 'ipc', 'handlers', 'weeklyHandlers.js')
  const databaseFacade = readProjectFile('main', 'database.js')

  assert.ok(
    mainProcess.includes("require('./database/lifecycle')"),
    'main.js debe inicializar la base de datos desde database/lifecycle.js'
  )
  assert.ok(
    !mainProcess.includes("require('./database')"),
    'main.js no debe depender de la fachada database.js para el ciclo de vida'
  )
  assert.ok(
    !ipcHandlers.includes("require('./database')"),
    'ipc-handlers.js no debe importar la fachada database.js'
  )
  assert.ok(
    databaseFacade.includes("require('./database/lifecycle')"),
    'database.js debe conservar initializeDatabase y saveLastClose delegando en lifecycle.js'
  )
  assert.ok(
    handlerDependencies.includes('function checkAndGrantAchievements()'),
    'handlerDependencies.js debe centralizar la revision compartida de logros para handlers IPC'
  )
  assert.ok(
    minigameHandlers.includes("require('../handlerDependencies')"),
    'minigameHandlers.js debe usar handlerDependencies.js para dependencias compartidas'
  )
  assert.ok(
    weeklyHandlers.includes("require('../handlerDependencies')"),
    'weeklyHandlers.js debe usar handlerDependencies.js para dependencias compartidas'
  )
}

module.exports = {
  validateDatabaseArchitecture
}
