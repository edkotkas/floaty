const electron = require('electron')
const { app, BrowserWindow, Tray, Menu, globalShortcut, ipcMain } = electron
const path = require('path')

const {config, write} = require('./src/settings')

const views = {
  main: './views/main/index.html',
  navigation: './views/navigation/index.html'
}

let url, tray, main, navigation
app.dock && app.dock.hide()

function toggleClickThrough() {
  config.clickThrough = !config.clickThrough
  config.clickThrough ? navigation.hide() : navigation.show()
  main.setIgnoreMouseEvents(config.clickThrough)
}

const shortcuts = [
  {
    key: 'CommandOrControl+Shift+E',
    label: 'Open Externally',
    click: () => url && electron.shell.openExternal(main.webContents.getURL())
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
  if (main) {
    config.hidden ? main.hide() : main.show()
  }

  if (navigation) {
    config.hidden ? navigation.hide() : navigation.show()
  }
}

function createWindow() {
  main = new BrowserWindow(config.main)
  main.setAlwaysOnTop(true, "floating", 1)
  main.setVisibleOnAllWorkspaces(true)
  main.setIgnoreMouseEvents(config.clickThrough)
  return main.loadFile(views.main)
}

function createNavigation() {
  const { x, y } = main.getBounds()
  navigation = new BrowserWindow(Object.assign({x, y: y - 60}, { ...config.navigation }))
  navigation.setAlwaysOnTop(true, "floating", 1)
  navigation.setVisibleOnAllWorkspaces(true)
  return navigation.loadFile(views.navigation)
}

function createTray() {
  tray = new Tray(path.join(__dirname, 'icon.png'))
  tray.setToolTip(`Floaty`)

  tray.on('click', () => {
    main.isVisible() ? main.hide() : main.show()

    if (!main.isVisible()) {
      navigation.hide()
    }

    if (!config.clickThrough && main.isVisible()) {
      navigation.show()
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
  main.setOpacity(config.opacity)
}

app.on('ready', () => {
  createTray()
  const windows = [createWindow, createNavigation].map(x => x())
  Promise.all(windows).then(() => {
    shortcuts.map(x => globalShortcut.register(x.key, x.click))
    createEventListeners()
  }).catch(err => console.error('err', err))
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
}, {
  channel: 'back',
  listener: () => main.webContents.goBack()
}, {
  channel: 'forward',
  listener: () => main.webContents.goForward()
}, {
  channel: 'refresh',
  listener:() => main.webContents.reload()
}]

function createEventListeners() {
  events.map(e =>  ipcMain.on(e.channel, e.listener))
  navigation.on('move', () => {
    const [x, y] = navigation.getPosition()
    main.setPosition(x, y + 60)
  })

  main.on('close', beforeClose)
  navigation.on('close', beforeClose)
}

function beforeClose() {
  Object.assign(config.main, main.getBounds())
  console.log(main.getOpacity())
  Object.assign(config.navigation, navigation.getBounds())

  write()

  app.quit()
}

function loadPage(address) {
  if (!/(?:^https?:\/\/).+/.test(address)) {
    address = `http://${address}`
  }

  url = address

  return main.loadURL(url)
}

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
  tray && tray.destroy()
})

app.commandLine.appendSwitch('high-dpi-support', 1)
app.commandLine.appendSwitch('force-device-scale-factor', 1)
