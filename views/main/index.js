const {ipcRenderer} = require('electron')

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('github')
    .addEventListener('mouseup', () => ipcRenderer.send('github'))
})
