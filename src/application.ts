import { App, globalShortcut } from 'electron'

import ActionService from './shared/services/action.service'
import AdBlockService from './shared/services/ad-block.service'
import TrayService from './shared/services/tray.service'
import WindowService from './shared/services/window.service'

export default class Application {

  constructor(
    private app: App,
    private windowService: WindowService,
    private actionService: ActionService,
    private adBlockService: AdBlockService,
    private trayService: TrayService
  ) {
    this.app.commandLine.appendSwitch('high-dpi-support', '1')
    this.app.commandLine.appendSwitch('force-device-scale-factor', '1')

    if (this.app.dock) {
      this.app.dock.hide()
    }
  }

  public init() {
    this.app.on('ready', async () => await this.onReady())
    this.app.on('will-quit', () => this.onQuit())
    this.app.on('web-contents-created', (event, contents) => {
      contents.setWindowOpenHandler(() => ({ action: 'deny' }))
    })
  }

  private async onReady() {
    try {
      await this.windowService.init()
      await this.trayService.init()
      await this.actionService.init()
      await this.adBlockService.init()
    } catch (e) {
      throw  e
    }
  }

  private onQuit() {
    globalShortcut.unregisterAll()
    this.trayService.destroy()
  }
}
