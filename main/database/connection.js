const Database = require('better-sqlite3')
const path = require('path')
const { app } = require('electron')

const DB_PATH = path.join(app.getPath('userData'), 'game.db')
const db = new Database(DB_PATH)

module.exports = {
  db,
  DB_PATH
}
