const {ipcRenderer} = require('electron')

function navigate() {
  let url = document.getElementById('url').value
  ipcRenderer.send('url', url)
}

document.addEventListener('DOMContentLoaded', function() {
  const urlInput = document.getElementById('url')
  urlInput
    .addEventListener('keyup', (e) => e.key === 'Enter' && navigate())
  document.getElementById('go')
    .addEventListener('mouseup', () => navigate())

  document.getElementById('options')
    .addEventListener('mouseup', () => {
      const nav = document.getElementById('nav-container')
      const opts = document.getElementById('options-container')

      const toggleVisible = (item) => {
        if (window.getComputedStyle(item).display === 'none') {
          item.style.display = 'block'
        } else {
          item.style.display = 'none'
        }
      }

      toggleVisible(nav)
      toggleVisible(opts)
    })

  const btnElements = document.getElementsByClassName('btn')
  const buttons = Array.from(btnElements).map(btn => btn.id)
  for (let btn of buttons) {
    document.getElementById(btn).addEventListener('mouseup', () => ipcRenderer.send(btn, true))
  }

  ipcRenderer.on('will-navigate', (event, args) => {
    urlInput.setAttribute('value', args)
  })
})
