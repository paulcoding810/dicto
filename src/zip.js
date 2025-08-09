import gulp from 'gulp'
import zip from 'gulp-zip'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const manifest = require('../build/manifest.json')
const browser = process.env.BROWSER ?? 'chrome'
const name = browser[0].toUpperCase() + browser.slice(1)

gulp
  .src('build/**')
  .pipe(zip(`${manifest.name.replaceAll(' ', '-')}-${name}-${manifest.version}.zip`))
  .pipe(gulp.dest('package/'))
