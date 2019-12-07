const electron = require('electron')
const {app, BrowserWindow, Tray, Menu, globalShortcut, ipcMain, screen} = electron
const path = require('path')

let url, tray, window, toolbox

app.dock && app.dock.hide()

const config = {
  clickable: false,
  opacity: 1
}

function toggleClickThrough() {
  config.clickable = !config.clickable
  config.clickable ? toolbox.hide() : toolbox.show()
  window.setIgnoreMouseEvents(config.clickable)
}

const shortcuts = [
  {
    key: 'CommandOrControl+Shift+X',
    description: 'Click-Through',
    exec: toggleClickThrough
  },
  {
    key: 'CommandOrControl+Shift+C',
    description: 'Close',
    exec: app.quit
  }
]

const createWindow = () => {
  window = new BrowserWindow({
    width: 500,
    height: 400,
    fullscreenable: false,
    resizable: true,
    frame: false,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: true
    }
  })

  window.setAlwaysOnTop(true, "floating", 1)
  window.setVisibleOnAllWorkspaces(true)
  window.setIgnoreMouseEvents(config.clickable)

  window.loadFile('./views/main/index.html')
}

const createToolbox = () => {
  const {x, y} = window.getBounds()

  toolbox = new BrowserWindow({
    x,
    y: y - 60,
    width: 500,
    height: 50,
    fullscreenable: false,
    resizable: false,
    frame: false,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: true
    }
  })

  toolbox.setAlwaysOnTop(true, "floating", 1)
  toolbox.setVisibleOnAllWorkspaces(true)

  toolbox.loadFile('./views/toolbox/index.html')
}

const createTray = () => {
  tray = new Tray(path.join(__dirname, 'icon.png'))
  tray.setToolTip(`Floaty - ${url}`)

  tray.on('click', () => {
    window.isVisible() ? window.hide() : window.show()
    toolbox.isVisible() ? toolbox.hide() : toolbox.show()
  })

  tray.setContextMenu(
    Menu.buildFromTemplate([
      {
        label: 'Open Externally',
        click: () => {
          url && electron.shell.openExternal(url)
        }
      },
      {type: 'separator'},
      {
        label: 'Shortcuts', submenu: shortcuts.map(x => ({
          label: x.key, sublabel: x.description, click: x.exec
        }))
      },
      {type: 'separator'},
      {
        label: 'Close',
        click: () => window.close()
      }
    ])
  )
}

function rotateOpacity() {
  const presets = [1, 0.8, 0.5, 0.2, 0.1]
  let current = presets.indexOf(config.opacity)
  if (current === presets.length - 1) {
    current = 0
  } else {
    current += 1
  }

  config.opacity = presets[current]
  window.setOpacity(config.opacity)
}

app.on('ready', () => {
  createTray()
  createWindow()
  createToolbox()

  shortcuts.map(x => globalShortcut.register(x.key, x.exec))
  ipcMain.on('url', (event, arg) => arg && loadPage(arg))

  ipcMain.on('click', () => toggleClickThrough())
  ipcMain.on('opacity', () => rotateOpacity())

  let moving = null

  ipcMain.on('move', () => {
    if (!moving) {
      return moving = setInterval(() => {
        const {x, y} = screen.getCursorScreenPoint()
        toolbox.setBounds({
          x: x - 475,
          y: y - 26,
          width: 500,
          height: 50
        })

        window.setPosition(...toolbox.getPosition())
      }, 30)
    }

    correctToolboxPosition()

    clearInterval(moving)
    moving = null
  })

  window.on('move', () => {
    if (!moving) {
      correctToolboxPosition()
    }
  })

  window.on('close', () => app.quit())
  toolbox.on('close', () => app.quit())
})

function correctToolboxPosition() {
  const {x, y} = window.getBounds()
  toolbox.setPosition(x, y - 60)
}

function loadPage(address) {
  console.log('got the data', address)
  if (!/(?:^https?:\/\/).+/.test(address)) {
    address = `http://${address}`
  }

  url = address

  window.loadURL(url)
}

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
  tray.destroy()
})

app.commandLine.appendSwitch('high-dpi-support', 1)
app.commandLine.appendSwitch('force-device-scale-factor', 1)
