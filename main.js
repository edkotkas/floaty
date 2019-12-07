const electron = require('electron')
const {app, BrowserWindow, Tray, Menu, globalShortcut, ipcMain, screen} = electron
const path = require('path')

const config = require('./src/config')

const views = {
  main: './views/main/index.html',
  toolbox: './views/toolbox/index.html'
}

let url, tray, window, toolbox
app.dock && app.dock.hide()

function toggleClickThrough() {
  config.clickThrough = !config.clickThrough
  config.clickThrough ? toolbox.hide() : toolbox.show()
  window.setIgnoreMouseEvents(config.clickThrough)
}

const shortcuts = [
  {
    key: 'CommandOrControl+Shift+O',
    label: 'Open Externally',
    click: () => url && electron.shell.openExternal(window.webContents.getURL())
  },
  {
    key: 'CommandOrControl+Shift+X',
    label: 'Click-Through',
    click: toggleClickThrough
  },
  {
    key: 'CommandOrControl+Shift+C',
    label: 'Close',
    click: app.quit
  }
]

const createWindow = () => {
  window = new BrowserWindow(config.main)
  window.setAlwaysOnTop(true, "floating", 1)
  window.setVisibleOnAllWorkspaces(true)
  window.setIgnoreMouseEvents(config.clickThrough)
  return window.loadFile(views.main)
}

const createToolbox = () => {
  const {x, y} = window.getBounds()
  toolbox = new BrowserWindow({x, y: y - 60, ...config.toolbox})
  toolbox.setAlwaysOnTop(true, "floating", 1)
  toolbox.setVisibleOnAllWorkspaces(true)
  return toolbox.loadFile(views.toolbox)
}

const createTray = () => {
  tray = new Tray(path.join(__dirname, 'icon.png'))
  tray.setToolTip(`Floaty`)

  tray.on('click', () => {
    window.isVisible() ? window.hide() : window.show()

    if (!window.isVisible()) {
      toolbox.hide()
    }

    if (!config.clickThrough && window.isVisible()) {
      toolbox.show()
    }
  })

  tray.setContextMenu(Menu.buildFromTemplate(shortcuts))
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
  Promise.all([createWindow(), createToolbox()]).then(() => {
    shortcuts.map(x => globalShortcut.register(x.key, x.click))
    createEventListeners()
  })
})

function createEventListeners() {
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
}

function correctToolboxPosition() {
  const {x, y} = window.getBounds()
  toolbox.setPosition(x, y - 60)
}

function loadPage(address) {
  if (!/(?:^https?:\/\/).+/.test(address)) {
    address = `http://${address}`
  }

  url = address

  return window.loadURL(url)
}

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
  tray.destroy()
})

app.commandLine.appendSwitch('high-dpi-support', 1)
app.commandLine.appendSwitch('force-device-scale-factor', 1)
