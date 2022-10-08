import { App } from 'electron'
import path from 'path'

import AppWindow from '../models/window'
import StoreService from './store.service'

export default class WindowService {

  private main: AppWindow
  private navigation: AppWindow
  private settings: AppWindow

  constructor(
    private app: App,
    private storeService: StoreService
  ) {
  }

  public async init() {
    this.createViews()

    await this.navigation.init()
    await this.main.init()
  }

  private createViews() {
    const { windows, main, mute, opacity } = this.storeService.get('windows', 'main', 'mute', 'opacity')

    this.main = new AppWindow('main', Object.assign(windows.main.options, main || {}))

    this.main.setMute(mute)
    this.main.setOpacity(opacity)

    const { x, y } = this.main.getPosition()
    this.navigation = new AppWindow('navigation', Object.assign({
      x, y: y - 60,
      webPreferences: {
        preload: path.join(__dirname, '..', '..', 'preload.js')
      }
    }, windows.navigation.options))

    this.setupEvents()
  }

  public toggleVisibility() {
    const { visibility } = this.storeService.toggle('visibility')
    const { clickThrough } = this.storeService.get('clickThrough')

    this.main.toggleVisibility(visibility)

    if (clickThrough) {
      this.navigation.toggleVisibility(visibility)
    }
  }

  public toggleClickThrough() {
    const { clickThrough } = this.storeService.toggle('clickThrough')
    this.navigation.toggleVisibility(!clickThrough)
    this.main.setClickThrough(!clickThrough)
  }

  public toggleMute() {
    const { mute } = this.storeService.toggle('mute')
    this.main.setMute(mute)
  }

  public allWindows(func: Function): AppWindow[] {
    const { windows } = this.storeService.get('windows')
    const views = Object.keys(windows)
      .filter(key => key !== 'settings')
      .map(key => this[key])
      .filter(x => x)

    if (func) {
      views.forEach(v => func(v))
    }

    return views
  }

  public close() {
    this.storeService.set('main', this.main.getBounds())
    this.storeService.delete('clickThrough')
    this.app.quit()
  }

  private setupEvents() {
    this.allWindows(w => w.onClose(() => this.close()))
    this.main.navigating((_, url: string) => this.navigation.willNavigate(url))
    this.navigation.ready(() => this.active())
    this.syncWindowMove()
  }

  private syncWindowMove() {
    let resizing = false
    let resizeTimeout: NodeJS.Timer

    this.navigation.onMove((x, y) => {
      if (!resizing) {
        this.main.setPosition(x, y + 60)
      }
    })

    this.main.onResize((x, y) => {
      resizing = true
      this.navigation.setPosition(x, y - 60)
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        resizing = false
      }, 100)
    })
  }
  public getURL() {
    return this.main.url
  }

  public back() {
    this.main.back()
  }

  public forward() {
    this.main.forward()
  }

  public refresh() {
    this.main.refresh()
  }

  public setOpacity(opacity: number) {
    this.storeService.set('opacity', opacity)
    this.main.setOpacity(opacity)
  }

  public async navigate(url: string) {
    try {
      await this.main.loadUrl(url)
    } catch (e) {
      if (e.code === 'ERR_CERT_AUTHORITY_INVALID') {
        return await this.main.loadFile(path.join('views', 'errors', 'cert-auth', 'index.html'))
      }

      throw e
    }
  }

  public async redirectHttp() {
    try {
      const url = new URL(this.navigation.url)
      url.protocol = 'http'

      await this.navigate(url.href)
    } catch (e) {
      throw e
    }
  }

  public getSession() {
    return this.main.session
  }

  public active() {
    const data = this.storeService.get('adBlock', 'mute')
    this.navigation.activeOptions(data)
  }

  toggleSettings() {
    this.settings.toggleVisibility(this.settings.view.isVisible())
  }
}
