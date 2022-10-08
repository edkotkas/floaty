import { Tray, Menu } from 'electron'
import path from 'path'

import ActionService from './action.service'
import StoreService from './store.service'
import WindowService from './window.service'

export default class TrayService {

  private tray: Tray

  constructor(
    private storeService: StoreService,
    private windowService: WindowService,
    private actionService: ActionService
  ) { }

  public async init() {
    this.tray = new Tray(path.join(__dirname, '..', '..', 'assets', 'icon.png'))
    this.tray.setToolTip('Floaty')
    this.setupEvents()
    this.setupContextMenu()
  }

  private setupEvents() {
    this.tray.on('click', () => {
      this.windowService.toggleVisibility()
    })
  }

  private setupContextMenu() {
    const { actions } = this.storeService.get('actions')
    const shortcuts = actions
      .filter(a => a.label && a.action)
      .map(a => ({
        label: a.label,
        click: () => this.actionService.get(a.action)
      }))

    this.tray.setContextMenu(Menu.buildFromTemplate(shortcuts))
  }

  public destroy() {
    this.tray.destroy()
  }
}
