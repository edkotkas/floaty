function loadPage(address, context) {
  if (!/(?:^https?:\/\/).+/.test(address)) {
    address = `http://${address}`
  }

  context.url = address

  return context.views.main.loadURL(context.url)
}

function rotateOpacity({ config, views }) {
  const presets = [1, 0.8, 0.5, 0.2, 0.1]
  let current = presets.indexOf(config.opacity)
  if (current === presets.length - 1) {
    current = 0
  } else {
    current += 1
  }

  config.opacity = presets[current]

  views.main.setOpacity(config.opacity)
}

function toggleVisibility({ config, views: { main, nav }}) {
  config.hidden = !config.hidden
  if (main) {
    if (config.hidden) {
      main.hide()
    } else {
      main.show()
    }
  }

  if (nav) {
    if (config.hidden) {
      nav.hide()
    } else {
      nav.show()
    }
  }
}

function toggleClickThrough({ config, views }) {
  config.clickThrough = !config.clickThrough
  config.clickThrough ? views.nav.hide() : views.nav.show()
  views.main.setIgnoreMouseEvents(config.clickThrough)
}

function openExternal({ url, system: { shell }, views: { main } }) {
  if (url) {
    shell.openExternal(main.webContents.getURL())
  }
}

function operations(context) {
  return [
    {
      shortcut: {
        key: 'CommandOrControl+Shift+V',
        label: 'Show/Hide'
      },
      event: () => toggleVisibility(context)
    },
    {
      shortcut: {
        key: 'CommandOrControl+Shift+X',
        label: 'Click-Through'
      },
      channel: 'click',
      event: () => toggleClickThrough(context)
    },
    {
      shortcut: {
        key: 'CommandOrControl+Shift+E',
        label: 'Open Externally'
      },
      channel: 'external',
      event: () => openExternal(context)
    },
    {
      shortcut: {
        key: 'CommandOrControl+Shift+B',
        label: 'Toggle AdBlock'
      },
      channel: 'adblock',
      event: () => context.system.adblock.toggle(context)
    },
    {
      shortcut: {
        key: 'CommandOrControl+Shift+Q',
        label: 'Close'
      },
      channel: 'quit',
      event: () => context.system.app.quit()
    },
    {
      channel: 'url',
      event: (event, args) => args && loadPage(args, context)
    },
    {
      channel: 'opacity',
      event: () => rotateOpacity(context)
    },
    {
      channel: 'github',
      event: () => context.system.shell.openExternal('https://github.com/edkotkas')
    },
    {
      channel: 'back',
      event: () => context.views.main.webContents.goBack()
    },
    {
      channel: 'forward',
      event: () => context.views.main.webContents.goForward()
    },
    {
      channel: 'refresh',
      event: () => context.views.main.webContents.reload()
    },
    {
      channel: 'help',
      event: () => context.system.shell.openExternal('https://github.com/edkotkas/floaty/blob/master/README.md')
    }
  ]
}

function setup(context) {
  const ops = operations(context)
  return {
    events: ops
      .filter(o => o.channel)
      .map(o => ({
        channel: o.channel,
        event: o.event
      })),
    shortcuts: ops
      .filter(o => o.shortcut)
      .map(o => ({
        ...o.shortcut,
        click: o.event
      }))
  }
}

module.exports = { setup }
