const { ipcMain } = require('electron')

function registerHandler(channel, action, fallback, errorMessage) {
  ipcMain.handle(channel, async (event, ...args) => {
    try {
      return action(event, ...args)
    } catch (error) {
      console.error(errorMessage, error)
      return fallback
    }
  })
}

module.exports = {
  registerHandler
}
