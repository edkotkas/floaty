import { Session } from 'electron'
import { ElectronBlocker } from '@cliqz/adblocker-electron'
import { fetch }  from 'cross-fetch'

import StoreService from './store.service'
import WindowService from './window.service'

export default class AdBlockService {

  public blocker: ElectronBlocker
  private session: Session

  constructor(
    private storeService: StoreService,
    private windowService: WindowService
  ) {
  }

  public async init() {
    this.blocker = await ElectronBlocker.fromPrebuiltAdsAndTracking(fetch)
    this.session = this.windowService.getSession()

    const { adBlock } = this.storeService.get('adBlock')
    if (adBlock) {
      this.block(true)
    }
  }

  public toggle() {
    const state = !this.blocker.isBlockingEnabled(this.session)
    this.storeService.set('adBlock', state)
    this.block(state)
    this.windowService.refresh()
  }

  private block(state: boolean) {
    const mode = state
      ? 'enableBlockingInSession'
      : 'disableBlockingInSession'

    this.blocker[mode](this.session)
  }
}
