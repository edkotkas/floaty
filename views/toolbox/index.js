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

  document.getElementById('close')
    .addEventListener('mouseup', () => ipcRenderer.send('close'))

  document.getElementById('opacity')
    .addEventListener('mouseup', () => ipcRenderer.send('opacity'))

  document.getElementById('click')
    .addEventListener('mouseup', () => ipcRenderer.send('click'))

  document.getElementById('github')
    .addEventListener('mouseup', () => ipcRenderer.send('github'))
})
