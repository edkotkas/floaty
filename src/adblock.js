const { ElectronBlocker } = require('@cliqz/adblocker-electron')
const { fetch } = require('cross-fetch')

function setup({ adblock, config, views: { main } }) {
  adblock.session = main.webContents.session
  adblock.state = config.adblock
  ElectronBlocker
    .fromPrebuiltAdsAndTracking(fetch)
    .then((blocker) => {
      adblock.blocker = blocker
      if (adblock.state) {
        blocker.enableBlockingInSession(adblock.session)
      }
    })
}

function toggle({ views: { main }, adblock }) {
  const { blocker, session } = adblock
  if (!blocker && !session) {
    return
  }

  if (blocker.isBlockingEnabled(session)) {
    blocker.disableBlockingInSession(session)
  } else {
    blocker.enableBlockingInSession(session)
  }

  main.reload()
}

module.exports = { setup, toggle }
