document.addEventListener('DOMContentLoaded', function() {
  const {ipcRenderer} = require('electron')

  document.getElementById('quit')
    .addEventListener('mouseup', () => ipcRenderer.send('exit-settings'))
})
