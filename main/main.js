const { app, BrowserWindow, Menu } = require('electron')
const path = require('path')
const { initializeDatabase, saveLastClose } = require('./database')
const { registerIpcHandlers } = require('./ipc-handlers')

function createGameWindow() {
  const gameWindow = new BrowserWindow({
    width:           1280,
    height:          720,
    minWidth:        1024,
    minHeight:       640,
    resizable:       true,
    maximizable:     true,
    fullscreenable:  true,
    title:           'My Plant Home',
    menuBarVisible:  false,
    autoHideMenuBar: true,
    webPreferences: {
      preload:          path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration:  false
    }
  })

  gameWindow.maximize()

  gameWindow.loadFile(path.join(__dirname, '../renderer/index.html'))

  // DevTools solo en desarrollo (no en build final)
  if (!app.isPackaged) {
    gameWindow.webContents.openDevTools({ mode: 'detach' })
  }
}

app.whenReady().then(() => {
  try {
    // Elimina el menú de la aplicación para que no aparezca File/Edit/View/Window
    Menu.setApplicationMenu(null)

    // 1. Inicializamos la BD antes de abrir la ventana.
    //    Si falla aquí, no tiene sentido continuar.
    initializeDatabase()

    // 2. Registramos todos los canales IPC.
    registerIpcHandlers()

    // 3. Creamos la ventana principal del juego.
    //    El renderer carga directamente el menú principal (sin login).
    createGameWindow()

  } catch (error) {
    console.error('Error crítico al inicializar la aplicación:', error)
    app.quit()
  }

  // En macOS se recrea la ventana al hacer clic en el dock si no hay ninguna abierta
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createGameWindow()
  })
})

app.on('window-all-closed', () => {
  saveLastClose()
  if (process.platform !== 'darwin') app.quit()
})
