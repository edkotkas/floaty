const electron = require('electron')
const { app, BrowserWindow, Tray, Menu, globalShortcut, ipcMain } = electron
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
    key: 'CommandOrControl+Shift+E',
    label: 'Open Externally',
    click: () => url && electron.shell.openExternal(window.webContents.getURL())
  },
  {
    key: 'CommandOrControl+Shift+X',
    label: 'Click-Through',
    click: toggleClickThrough
  },
  {
    key: 'CommandOrControl+Shift+V',
    label: 'Show/Hide',
    click: toggleVisibility
  },
  {
    key: 'CommandOrControl+Shift+C',
    label: 'Close',
    click: app.quit
  }
]

function toggleVisibility() {
  config.hidden = !config.hidden
  if (window) {
    config.hidden ? window.hide() : window.show()
  }

  if (toolbox) {
    config.hidden ? toolbox.hide() : toolbox.show()
  }
}

function createWindow() {
  window = new BrowserWindow(config.main)
  window.setAlwaysOnTop(true, "floating", 1)
  window.setVisibleOnAllWorkspaces(true)
  window.setIgnoreMouseEvents(config.clickThrough)
  return window.loadFile(views.main)
}

function createToolbox() {
  const { x, y } = window.getBounds()
  toolbox = new BrowserWindow({ x, y: y - 60, ...config.toolbox })
  toolbox.setAlwaysOnTop(true, "floating", 1)
  toolbox.setVisibleOnAllWorkspaces(true)
  return toolbox.loadFile(views.toolbox)
}

function createTray() {
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
  const windows = [createWindow, createToolbox].map(x => x())
  Promise.all(windows).then(() => {
    shortcuts.map(x => globalShortcut.register(x.key, x.click))
    createEventListeners()
  })
})

const events = [{
  channel: 'url',
  listener: (event, args) => args && loadPage(args)
}, {
  channel: 'click',
  listener: toggleClickThrough
}, {
  channel: 'opacity',
  listener: rotateOpacity
}, {
  channel: 'github',
  listener: () => electron.shell.openExternal('https://github.com/edkotkas/floaty')
}, {
  channel: 'close',
  listener: app.quit
}]

function createEventListeners() {
  events.map(e =>  ipcMain.on(e.channel, e.listener))
  toolbox.on('move', () => {
    const [x, y] = toolbox.getPosition()
    window.setPosition(x, y + 60)
  })
  window.on('close', () => app.quit())
  toolbox.on('close', () => app.quit())
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
