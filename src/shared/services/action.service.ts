import { App, clipboard, shell, ipcMain, globalShortcut } from 'electron'

import AdBlockService from './ad-block.service'
import StoreService from './store.service'
import WindowService from './window.service'

export default class ActionService {

  constructor(
    private app: App,
    private storeService: StoreService,
    private windowService: WindowService,
    private adBlockService: AdBlockService
  ) {
  }

  public async init() {
    this.setupEvents()
  }

  private setupEvents() {
    const { actions } = this.storeService.get('actions')

    const acts = actions.filter(a => a.action && !!this[a.action])

    acts
      .filter(a => a.key)
      .forEach((a) => {
        globalShortcut.register(a.key, () => this[a.action]())
      })

    ipcMain.on('act', async (_, name, data) => {
      if (acts.find(a => a.action === name)) {
        await this.get(name, data)
      }
    })
  }

  public visibility() {
    this.windowService.toggleVisibility()
  }

  public clickThrough() {
    this.windowService.toggleClickThrough()
  }

  public mute() {
    this.windowService.toggleMute()
  }

  public async external() {
    await shell.openExternal(this.windowService.getURL())
  }

  public adBlock() {
    this.adBlockService.toggle()
  }

  public async paste() {
    const copy = clipboard.readText()
    await this.url(copy)
  }

  public quit() {
    this.app.quit()
  }

  public async url(input: string) {
    if (!/(?:^https?:\/\/).+/.test(input)) {
      input = `https://${input}`
    }
    await this.windowService.navigate(input)
  }

  public async retryHttp() {
    await this.windowService.redirectHttp()
  }

  public settings() {
    this.windowService.toggleSettings()
  }

  public opacity() {
    const presets = [1, 0.8, 0.5, 0.2, 0.1]
    const { opacity } = this.storeService.get('opacity')
    let current = presets.indexOf(opacity)
    if (current === presets.length - 1) {
      current = 0
    } else {
      current += 1
    }

    this.windowService.setOpacity(presets[current])
  }

  public back() {
    this.windowService.back()
  }

  public forward() {
    this.windowService.forward()
  }

  public refresh() {
    this.windowService.refresh()
  }

  public reset() {
    this.storeService.clear()
    this.app.relaunch()
    this.app.exit()
  }

  public async help() {
    await shell.openExternal('https://github.com/edkotkas/floaty/blob/master/README.md')
  }

  public async get(action: string, data?: any) {
    const res = await this[action](data)
    this.windowService.active()
    return res
  }
}
