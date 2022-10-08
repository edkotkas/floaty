document.addEventListener('DOMContentLoaded', function() {

  const api = window.api

  document.getElementById('http').addEventListener('mouseup', () => {
    api.retryHttp()
  })
})
