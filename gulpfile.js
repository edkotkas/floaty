const gulp = require('gulp')
const del = import('del')
const ts = require('gulp-typescript')
const sass = require('sass')
const gs = require('gulp-sass')(sass)
const merge = require('merge-stream')
const sourceMaps = require('gulp-sourcemaps')

gulp.task('clean', async function () {
  return await (await del).deleteAsync([
    'dist/**/*',
  ])
})

gulp.task('copy', function () {
  const viewsConfig = gulp.src(['src/**/*.html', 'src/**/*.js*']).pipe(gulp.dest('dist'))
  const assets = gulp.src(['assets/**/*']).pipe(gulp.dest('dist/assets'))

  return merge(viewsConfig, assets)
})

gulp.task('styles', () => {
  return gulp.src('src/**/*.scss')
    .pipe(gs().on('error', gs.logError))
    .pipe(gulp.dest('dist'))
})

gulp.task('compile', function () {
  const project = ts.createProject('tsconfig.json')
  return project.src()
    .pipe(sourceMaps.init())
    .pipe(project()).js
    .pipe(sourceMaps.write({sourceRoot: 'dist'}))
    .pipe(gulp.dest('dist'))
})

gulp.task('default', gulp.series('clean', gulp.parallel('compile', 'copy', 'styles')))

gulp.task('watch', function () {
  return gulp.watch(['src/**/*'], gulp.task('default'))
})
