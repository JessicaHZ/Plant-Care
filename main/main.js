const { app, BrowserWindow, Menu, ipcMain } = require('electron')
const path = require('path')
const { initializeDatabase, saveLastClose } = require('./database')
const { registerIpcHandlers } = require('./ipc-handlers')

let gameWindow = null

function createGameWindow() {
  let closeConfirmed = false
  let closePromptOpen = false

  gameWindow = new BrowserWindow({
    width:           1280,
    height:          720,
    minWidth:        1024,
    minHeight:       640,
    resizable:       true,
    maximizable:     true,
    fullscreenable:  true,
    title:           'My Plant Home',
    frame:           false,
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

  const confirmClose = () => {
    closeConfirmed = true
    saveLastClose()
    if (!gameWindow.isDestroyed()) gameWindow.close()
  }

  const cancelClose = () => {
    closePromptOpen = false
  }

  const minimizeWindow = () => {
    if (!gameWindow.isDestroyed()) gameWindow.minimize()
  }

  const toggleMaximizeWindow = () => {
    if (gameWindow.isDestroyed()) return
    if (gameWindow.isMaximized()) {
      gameWindow.unmaximize()
    } else {
      gameWindow.maximize()
    }
  }

  const requestClose = () => {
    if (!gameWindow.isDestroyed()) gameWindow.close()
  }

  ipcMain.on('app:confirm-close', confirmClose)
  ipcMain.on('app:cancel-close', cancelClose)
  ipcMain.on('app:minimize-window', minimizeWindow)
  ipcMain.on('app:toggle-maximize-window', toggleMaximizeWindow)
  ipcMain.on('app:request-close', requestClose)

  gameWindow.on('closed', () => {
    ipcMain.removeListener('app:confirm-close', confirmClose)
    ipcMain.removeListener('app:cancel-close', cancelClose)
    ipcMain.removeListener('app:minimize-window', minimizeWindow)
    ipcMain.removeListener('app:toggle-maximize-window', toggleMaximizeWindow)
    ipcMain.removeListener('app:request-close', requestClose)
    gameWindow = null
  })

  gameWindow.on('close', (event) => {
    if (closeConfirmed) return

    event.preventDefault()

    if (closePromptOpen) return

    closePromptOpen = true
    gameWindow.webContents.send('app:close-requested')

  })

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
