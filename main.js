const electron = require('electron')
const { app, globalShortcut, ipcMain } = electron

const windows = require('./src/windows')
const adblock = require('./src/adblock')
const operations = require('./src/operations')
const tray = require('./src/tray')

const Store = require('electron-store')
const store = new Store()

const context = {
  system: { app, adblock, store },
  config: store.get('config', require('./src/config')),
  url: null,
  tray: null,
  adblock: {
    session: null,
    blocker: null
  },
  views: {
    main: null,
    nav: null
  },
  templates: {
    main: './views/main/index.html',
    nav: './views/navigation/index.html'
  },
  quit: () => {
    updateConfig()
    app.exit()
  }
}

function updateConfig() {
  const { config, views, adblock: { blocker, session } } = context
  Object.assign(config.main, views.main.getBounds())
  Object.assign(config.nav, views.nav.getBounds())
  config.adblock = blocker.isBlockingEnabled(session)
  config.mute = views.main.webContents.isAudioMuted()
  store.set('config', config)
}

if (app.dock) {
  app.dock.hide()
}

app.on('ready', () => {
  const { events, shortcuts } = operations.setup(context)
  events.map(e => ipcMain.on(...Object.values(e)))
  tray.create(shortcuts, context)
  windows.setup(context)
    .then(() => {
      shortcuts.forEach(({ key, click }) => {
        globalShortcut.register(...Object.values({ key, click }))
      })
      adblock.setup(context)
    }).catch(err => console.error('err', err))
})

app.on('will-quit', () => {
  const { tray } = context

  globalShortcut.unregisterAll()

  if (tray) {
    tray.destroy()
  }
})

app.commandLine.appendSwitch('high-dpi-support', '1')
app.commandLine.appendSwitch('force-device-scale-factor', '1')
