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

      // optsClasses.hidden = navClasses.hidden
      // if (navClasses.contains('up')) {
      //   navClasses.remove('up')
      // } else {
      //   navClasses.add('up')
      // }
      //
      // if (optsClasses.contains('up')) {
      //   optsClasses.remove('up')
      // } else {
      //   optsClasses.add('up')
      // }
    })

  const buttons = ['quit', 'opacity', 'click', 'back', 'forward', 'refresh']
  for (let btn of buttons) {
    document.getElementById(btn).addEventListener('mouseup', () => ipcRenderer.send(btn, true))
  }
})
