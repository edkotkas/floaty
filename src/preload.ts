import { ipcRenderer, contextBridge } from 'electron'

contextBridge.exposeInMainWorld("api", {
  willNavigate: (func) => {
    ipcRenderer.on('will-navigate', (_, ...args) => func(...args))
  },
  act: (name, data) => {
    ipcRenderer.send('act', name, data)
  },
  active: (func) => {
    ipcRenderer.on('active', (_, args) => {
      func(args)
    })
  },
  retryHttp: () => {
    ipcRenderer.send('act', 'retryHttp')
  }
})
