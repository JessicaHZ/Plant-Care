const Database = require('better-sqlite3')
const path = require('path')

let dbInstance = null
let dbPath = null

function getElectronApp() {
  const { app } = require('electron')
  if (!app) {
    throw new Error('Electron app no está disponible para inicializar SQLite.')
  }
  return app
}

function getDatabasePath() {
  if (!dbPath) {
    dbPath = path.join(getElectronApp().getPath('userData'), 'game.db')
  }
  return dbPath
}

function getDb() {
  if (!dbInstance) {
    dbInstance = new Database(getDatabasePath())
  }
  return dbInstance
}

const db = new Proxy({}, {
  get(_target, property) {
    const value = getDb()[property]
    return typeof value === 'function' ? value.bind(getDb()) : value
  },
  set(_target, property, value) {
    getDb()[property] = value
    return true
  }
})

module.exports = {
  db,
  getDb,
  getDatabasePath
}
