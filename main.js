const electron = require('electron')
const { app, BrowserWindow, Tray, Menu, globalShortcut, ipcMain, screen } = electron
const path = require('path')

let url, tray, window, positioner

app.dock && app.dock.hide()


const config = {
  clickable: false
}


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

  window.loadFile('./index.html')
}

const createTray = () => {
  tray = new Tray(path.join(__dirname, 'icon.png'))
  tray.setToolTip(`Floaty - ${url}`)

  tray.on('click', () => {
    window.isVisible() ? window.hide() : window.show()
  })

  tray.setContextMenu(
    Menu.buildFromTemplate([
      {
        label: 'Setup',
        click: () => {
          window.loadFile('./index.html')
        }
      },
      { type: 'separator' },
      {
        label: 'Open Externally',
        click: () => {
          electron.shell.openExternal(url)
        }
      },
      { type: 'separator' },
      {
        label: 'Options', submenu: [
          {
            label: 'Opacity', submenu: [
              { label: '10%', click: () => window.setOpacity(0.1) },
              { label: '20%', click: () => window.setOpacity(0.2) },
              { label: '50%', click: () => window.setOpacity(0.5) },
              { label: '80%', click: () => window.setOpacity(0.8) },
              { label: '100%', click: () => window.setOpacity(1) }
            ]
          }
        ]
      },
      { type: 'separator' },
      {
        label: 'Icons', submenu: [
          {
            label: 'Cat Footprint icon by Icons8',
            click: () => {
              electron.shell.openExternal('https://icons8.com/icon/121198/cat-footprint')
            }
          },
          {
            label: 'Arrows icon by Icons8',
            click: () => {
              electron.shell.openExternal('https://www.flaticon.com/authors/those-icons')
            }
          }
        ]
      },
      { type: 'separator' },
      {
        label: 'Shortcuts', submenu: [
          { label: 'CmdOrCtrl+Shift+X', sublabel: 'Click-Through' },
          { label: 'CmdOrCtrl+Shift+C', sublabel: 'Close' },
          { label: 'CmdOrCtrl+Shift+S', sublabel: 'Setup' },
          { label: 'CmdOrCtrl+Shift+M', sublabel: 'Minimize' },
          { label: 'CmdOrCtrl+Shift+P', sublabel: 'Positioner' }
        ]
      },
      { type: 'separator' },
      {
        label: 'Close',
        click: () => window.close()
      }
    ])
  )
}

app.on('ready', () => {
  createTray()
  createWindow()

  globalShortcut.register('CommandOrControl+Shift+X', () => {
    config.clickable = !config.clickable
    window.setIgnoreMouseEvents(config.clickable)
  })

  globalShortcut.register('CommandOrControl+Shift+C', () => {
    window.close()
  })

  globalShortcut.register('CommandOrControl+Shift+S', () => {
    window.loadFile('./index.html')
  })

  globalShortcut.register('CommandOrControl+Shift+M', () => {
    window.hide()
  })

  globalShortcut.register('CommandOrControl+Shift+L', () => {
    if (url) {
      window.loadURL(url)
    }
  })

  globalShortcut.register('CommandOrControl+Shift+P', () => {
    if (positioner) {
      return clearInterval(positioner)
    }
    positioner = setInterval(() => {
      const { x, y } = screen.getCursorScreenPoint()
      const { width: pwidth, height: pheight } = screen.getPrimaryDisplay().bounds
      const { width, height } = window.getBounds()

      const top = (y - height / 2) > 5
      const left = (x - width / 2) > 5
      const bottom = pheight - (y + height / 2) > 5
      const right = pwidth - (x + width / 2) > 5

      if (!(top && left && bottom && right)) return

      window.setPosition(x - width / 2, y - height / 2)
    })
  })

  ipcMain.on('url', (event, arg) => {
    if (arg) {
      url = arg
      window.loadURL(url)
    }
  })
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
  tray.destroy()
})
