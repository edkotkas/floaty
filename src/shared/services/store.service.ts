import ElectronStore from 'electron-store'

import config from '../../config.json'

export default class StoreService {

  constructor(private store: ElectronStore) {}

  public toggle(option: string) {
    const data = this.get(option)[option]

    this.set(option, !data)

    return { [option]: data }
  }

  public set(option: string, value: unknown) {
    this.store.set(option, value)
  }

  public get(...options: string[]): any {
    return options
      .reduce((acc, val) => {
        acc[val] = this.store.get(val, config[val])
        return acc
    }, {})
  }

  public clear() {
    this.store.clear()
  }

  public delete(...options: string[]) {
    options.forEach(o => this.store.delete(o))
  }
}
