const {ipcRenderer} = require('electron')

function navigate() {
  let url = document.getElementById('url').value
  ipcRenderer.send('url', url)
}

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('url')
    .addEventListener('keyup', (e) => e.key === 'Enter' && navigate())
  document.getElementById('go')
    .addEventListener('mouseup', () => navigate())

  const buttons = ['close', 'opacity', 'click', 'back', 'forward', 'refresh']
  for (let btn of buttons) {
    document.getElementById(btn).addEventListener('mouseup', () => ipcRenderer.send(btn, true))
  }
})
