const path = require('path')
const electron = require('electron')
const { Tray, Menu } = electron

function create(shortcuts, context) {
  context.tray = new Tray(path.join(__dirname, '..', 'icon.png'))

  const { tray, config, views } = context

  tray.setToolTip(`Floaty`)

  tray.on('click', () => {
    const{ main, nav } = views

    if (main.isVisible()) {
      main.hide()
    } else {
      main.show()
    }

    if (!main.isVisible()) {
      nav.hide()
    }

    if (!config.clickThrough && main.isVisible()) {
      nav.show()
    }
  })

  tray.setContextMenu(Menu.buildFromTemplate(shortcuts))
}

module.exports = { create }
