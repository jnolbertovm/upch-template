import ts from 'gulp-typescript';
import bsync from 'browser-sync';

const tsc = ts.createProject('tsconfig.json');

export default {
  autoprefixer: require('gulp-autoprefixer'),
  sourcemaps: require('gulp-sourcemaps'),
  cleanCSS: require('gulp-clean-css'),
  loadJson: require('load-json-file'),
  notifier: require('node-notifier'),
  plumber: require('gulp-plumber'),
  gulpif: require('gulp-if'),
  concat: require('gulp-concat'),
  notify: require('gulp-notify'),
  reload: bsync.reload,
  uglify: require('gulp-uglify'),
  gColor: require('ansi-colors'),
  rename: require('gulp-rename'),
  babel: require('gulp-babel'),
  gBeep: require('beeper'),
  watch: require('gulp-watch'),
  bsync: bsync,
  noop: require('through2'),
  file: require('gulp-file'),
  pump: require('pump'),
  less: require('gulp-less'),
  sass: require('gulp-sass'),
  glob: require('glob'),
  del: require('del'),
  run: require('run-sequence'),
  log: require('fancy-log'),
  tsc: tsc,
  ts: ts
};