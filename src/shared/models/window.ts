import { BrowserWindowConstructorOptions, BrowserWindow } from 'electron'
import path from 'path'

export default class AppWindow {

  private readonly config: Partial<BrowserWindowConstructorOptions> = {
    fullscreenable: false,
    fullscreen: true,
    backgroundColor: '#2e2c29',
    frame: false,
    skipTaskbar: true,
    show: false
  }

  public view: BrowserWindow

  get url() {
    return this.view.webContents.getURL()
  }

  get session() {
    return this.view.webContents.session
  }

  public setOpacity(opacity: number) {
    this.view.setOpacity(opacity)
  }

  constructor(
    private readonly name: string,
    private readonly opts: BrowserWindowConstructorOptions
  ) {
    this.config = Object.assign({}, this.config, this.opts)

    const view = new BrowserWindow(this.config)

    view.setAlwaysOnTop(true, 'screen-saver', 1)
    view.setVisibleOnAllWorkspaces(true)
    view.setFullScreenable(false)

    this.view = view
  }

  public init(): Promise<void> {
    const templatePath = path.join('views', this.name, 'index.html')

    this.setupEvents()

    return this.view.loadFile(templatePath)
  }

  private setupEvents() {
    this.ready(() => {
      if (this.name !== 'settings') {
        this.view.show()
      }
    })
  }

  public onMove(func: any) {
    this.view.on('move', () => func(...this.view.getPosition()))
  }

  public onResize(func: any) {
    this.view.on('resize', () => func(...this.view.getPosition()))
  }

  public onClose(func: any) {
    this.view.on('close', () => func())
  }

  public setPosition(x: number, y: number) {
    this.view.setPosition(x, y)
  }

  public getPosition() {
    const [ x, y] = this.view.getPosition()
    return { x, y }
  }

  public getBounds() {
    return this.view.getBounds()
  }

  public toggleVisibility(state: boolean) {
    const mode = state ? 'hide' : 'show'
    this.view[mode]()
  }

  public setClickThrough(state: boolean) {
    this.view.setIgnoreMouseEvents(state)
  }

  public setMute(state: boolean) {
    this.view.webContents.audioMuted = state

  }

  public navigating(func: any) {
    this.view.webContents.on('did-navigate', func)
    this.view.webContents.on('did-navigate-in-page', func)
    this.view.webContents.on('did-redirect-navigation', func)
  }

  public willNavigate(url: string) {
    this.view.webContents.send('will-navigate', url)
  }

  public activeOptions(data: any) {
    this.view.webContents.send('active', data)
  }

  public ready(func: any) {
    this.view.on('ready-to-show', func)
  }

  public back() {
    this.view.webContents.goBack()
  }

  public forward() {
    this.view.webContents.goForward()
  }

  public refresh() {
    this.view.webContents.reload()
  }

  public loadUrl(url: string): Promise<void> {
    return this.view.loadURL(url)
  }

  public loadFile(path: string): Promise<void> {
    return this.view.loadFile(path)
  }
}
