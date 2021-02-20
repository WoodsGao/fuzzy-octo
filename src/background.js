'use strict'

import { app, protocol, BrowserWindow, Tray, Menu, ipcMain, globalShortcut } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
const fs = require('fs')
const isDevelopment = process.env.NODE_ENV !== 'production'

console.log('new')
app.dock.hide()

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {
      secure: true,
      standard: true
    }
  }
])

Menu.setApplicationMenu(null)

// main widgets
let win = null
let tray = null

// variables
let config = new Object()

// custom functions
function loadConfig() {
  fs.readFile(`${__static}/config.json`, 'utf8', (err, data) => {
    // You should always specify the content type header,
    // when you don't use 'res.json' for sending JSON.  
    if (err) {
      console.log(err)
    }
    else {
      config = JSON.parse(data)
      console.log(config)
      win.webContents.send('reload', config.modules)
    }
  })
}

function swicthMainWindow() {
  if (win.isVisible()) {
    win.hide()
  }
  else {
    win.show()
    win.webContents.send('focus', true)
  }

}

function createTray() {
  tray = new Tray(`${__static}/a.png`)
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Reload',
      type: 'normal',
      click: () => {
        loadConfig()
      }
    },
    {
      label: 'Exit',
      type: 'normal',
      click: () => {
        app.quit()
      }
    }
  ])
  tray.setToolTip('This is my application.')
  tray.setContextMenu(contextMenu)
}

async function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    useContentSize: true,
    frame: false,
    center: true,
    alwaysOnTop: true,
    darkTheme: false,
    transparent: false,
    // opacity: 0.2,
    webPreferences: {
      enableRemoteModule: true,
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
    }
  })
  win.setMenu(null)
  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }
}


// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  // if (process.platform !== 'darwin') {
  //   app.quit()
  // }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()
  createTray()
  win.on('blur', () => {
    win.hide()
  })
  win.webContents.once('did-finish-load', () => {
    console.log('ready and load')
    loadConfig()
    win.webContents.send('focus', true)
  })
  // global shortcut
  const ret = globalShortcut.register('CommandOrControl+Space', () => {
    swicthMainWindow()
  })

  if (!ret) {
    console.log('registration failed')
  }

  // 检查快捷键是否注册成功
  console.log(globalShortcut.isRegistered('CommandOrControl+Space'))
})

app.on('will-quit', () => {
  // 注销所有快捷键
  globalShortcut.unregisterAll()
})

// ipc handles
ipcMain.on('asynchronous-message', (event, arg) => {
  console.log(arg) // prints "ping"
  event.reply('asynchronous-reply', 'pong')
})
// ipc handles end

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
