document.addEventListener('DOMContentLoaded', function () {
  const api = window.api

  const urlInput = document.querySelector('#url')

  function navigate() {
    api.act('url', urlInput.value)
  }

  urlInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
      navigate()
    }
  })

  document.querySelector('#go').addEventListener('mouseup', () => navigate())

  document.querySelector('#options').addEventListener('mouseup', () => {
    document.querySelector('.nav-wrapper').classList.toggle('hidden')
  })

  document.querySelectorAll('.btn').forEach(el => {
    el.addEventListener('mouseup', () => api.act(el.id))
  })

  api.active(data => {
    Object.keys(data).forEach(key => {
      const btn = document.querySelector(`#${key}`)
      if (btn) {
        btn.classList.toggle('active', !!data[key])
      }
    })
  })

  api.willNavigate(args => {
    urlInput.value = args
    urlInput.defaultValue = args
    urlInput.dispatchEvent(new Event('change'))
  })
})
