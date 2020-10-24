const electron = require('electron')
const { app, globalShortcut, ipcMain } = electron

const windows = require('./src/windows')
const adblock = require('./src/adblock')
const operations = require('./src/operations')
const tray = require('./src/tray')

const Store = require('electron-store')
const store = new Store()

const config = store.get('config', require('./src/config'))

const context = {
  system: { app, adblock, store },
  config,
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
  quit
}

function quit() {
  const { config, views, adblock: { blocker, session } } = context
  Object.assign(config.main, views.main.getBounds())
  Object.assign(config.nav, views.nav.getBounds())
  config.adblock = blocker.isBlockingEnabled(session)
  config.mute = views.main.isAudioMuted()
  store.set('config', config)
  app.quit()
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
      shortcuts
        .map(({ key, click }) => ({ key, click }))
        .map(s => globalShortcut.register(...Object.values(s)))



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
