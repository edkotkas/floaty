import path from 'path'
import { Tray, Menu } from 'electron'

function create(shortcuts, context) {
  context.tray = new Tray(path.join(__dirname, '..', 'icon.png'))

  const { tray, config, views } = context

  tray.setToolTip(`Floaty`)

  tray.on('click', () => {
    const{ main, nav } = views

    if (main.view.isVisible()) {
      main.view.hide()
    } else {
      main.view.show()
    }

    if (!main.view.isVisible()) {
      nav.hide()
    }

    if (!config.clickThrough && main.view.isVisible()) {
      nav.show()
    }
  })

  tray.setContextMenu(Menu.buildFromTemplate(shortcuts))
}

module.exports = { create }
