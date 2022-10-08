import { app } from 'electron'
import Store from 'electron-store'

import Application from './application'
import ActionService from './shared/services/action.service'
import AdBlockService from './shared/services/ad-block.service'
import StoreService from './shared/services/store.service'
import TrayService from './shared/services/tray.service'
import WindowService from './shared/services/window.service'

void function() {
  const storeService = new StoreService(new Store())
  const windowService = new WindowService(app, storeService)
  const adBlockService = new AdBlockService(storeService, windowService)
  const actionService = new ActionService(app, storeService, windowService, adBlockService)
  const trayService = new TrayService(storeService, windowService, actionService)

  new Application(
    app,
    windowService,
    actionService,
    adBlockService,
    trayService
  ).init()
}()
