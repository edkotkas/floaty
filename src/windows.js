const { BrowserWindow } = require('electron')

function main({ config, views, templates }) {
  views.main = new BrowserWindow(config.main)
  const { main } = views

  main.setAlwaysOnTop(true, "floating", 10)
  main.setVisibleOnAllWorkspaces(true)
  main.setIgnoreMouseEvents(config.clickThrough)

  return main.loadFile(templates.main)
}

function navigation({ config, views, templates }) {
  const { x, y } = views.main.getBounds()

  views.nav = new BrowserWindow(Object.assign({ x, y: y - 60 }, { ...config.navigation }))
  const { nav } = views

  nav.setAlwaysOnTop(true, "floating", 10)
  nav.setVisibleOnAllWorkspaces(true)

  return nav.loadFile(templates.nav)
}

function setup(context) {
  const windows = [main, navigation].map(w => w(context))
  return Promise.all(windows)
    .then(windows => {
      Object.values(context.views).map(view => view.on('close', context.quit))

      let resizing = false
      let resizeTimeout

      context.views.nav.on('move', () => {
        if (!resizing) {
          const [x, y] = context.views.nav.getPosition()
          context.views.main.setPosition(x, y + 60)
        }
      })

      context.views.main.on('resize', () => {
        resizing = true
        const [x, y] = context.views.main.getPosition()
        context.views.nav.setPosition(x, y - 60)
        resizeTimeout = setTimeout(() => {
          resizing = false
        }, 100)
      })

      return windows
    })
}

module.exports = { setup }
