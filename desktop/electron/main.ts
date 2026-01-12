import { app, BrowserWindow } from 'electron'
import path from 'node:path'
import { registerSettingsHandlers, registerBackendHandlers, registerDialogHandlers } from './ipc'

let mainWindow: BrowserWindow | null = null

function createWindow() {
  const preloadPath = path.join(__dirname, '../preload/index.cjs')
  console.log('📁 Preload path:', preloadPath)
  console.log('📁 __dirname:', __dirname)

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 600,
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false // Allow file:// protocol for local video playback
    },
    titleBarStyle: 'hiddenInset', // macOS style
    backgroundColor: '#f3f4f6'
  })

  // Load app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  // Debug: Check if preload script loaded
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow?.webContents.executeJavaScript('typeof window.electron !== "undefined"').then(result => {
      console.log('✅ window.electron exposed:', result)
    })
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  // Register IPC handlers
  registerSettingsHandlers()
  registerBackendHandlers()
  registerDialogHandlers()

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
