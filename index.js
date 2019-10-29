function send() {
  let url = document.getElementById('url').value
  const {ipcRenderer} = require('electron')
  ipcRenderer.send('url', url )
}


document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('start').addEventListener('click', () => {
    send()
  })
})
