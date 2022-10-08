// import { AppWindow } from './models/window'
//
// function main({ config, views, templates }) {
//   views.main = new AppWindow(Object.assign({}, config.main))
//   return views.main.load(templates.main)
// }
//
// function navigation({ config, views, templates }) {
//   const { x, y } = views.main.view.getBounds()
//   views.nav = new AppWindow(Object.assign({ x, y: y - 60 }, ...config.nav))
//   return views.nav.view.load(templates.nav)
// }
//
// function settings({ config, views, templates }) {
//   views.settings = new AppWindow(Object.assign({}, ...config.settings))
//   return views.settings.load(templates.settings)
// }
//
// function handleMoving(context) {
//   let resizing = false
//   let resizeTimeout
//
//   context.views.nav.view.on('move', () => {
//     if (!resizing) {
//       const [x, y] = context.views.nav.view.getPosition()
//       context.views.main.setPosition(x, y + 60)
//     }
//   })
//
//   context.views.main.on('resize', () => {
//     resizing = true
//     const [x, y] = context.views.main.view.getPosition()
//     context.views.nav.view.setPosition(x, y - 60)
//     resizeTimeout = setTimeout(() => {
//       resizing = false
//     }, 100)
//   })
// }
//
// function setup(context) {
//   const windows = [main, navigation, settings].map(w => w(context))
//   return Promise.all(windows)
//     .then(windows => {
//       const { views, quit } = context
//       Object.keys(views)
//         .filter(v => v)
//         .forEach(viewName => {
//           const view = views[viewName]
//           // view.setAlwaysOnTop(true, 'floating', 100)
//           // view.setVisibleOnAllWorkspaces(true, {
//           //   visibleOnFullScreen: true
//           // })
//
//           view.on('close', quit)
//         })
//
//       context.forceTopMost = setInterval(() => {
//         if (context.config.hidden) {
//           return
//         }
//
//         if (!context.config.clickThrough) {
//           views.nav.view.moveTop()
//         }
//
//         views.main.view.moveTop()
//       }, 10000)
//
//       views.main.view.webContents.on('will-navigate', (event, url) => {
//         views.nav.view.webContents.send('will-navigate', url)
//       })
//
//       views.nav.view.on('focus', () => {
//         views.main.view.focus()
//       })
//
//       handleMoving(context)
//
//       return windows
//     })
// }
//
// module.exports = { setup }
