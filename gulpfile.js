/*!
 * gulp
 * $ npm install gulp-ruby-sass gulp-autoprefixer gulp-minify-css gulp-jshint gulp-concat gulp-uglify gulp-imagemin gulp-notify gulp-rename gulp-livereload gulp-cache del --save-dev
 */
 
// Load plugins
var gulp = require('gulp'),
    lr,
    sass = require('gulp-ruby-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    livereload = require('gulp-livereload'),
    del = require('del'),
    htmlreplace = require('gulp-html-replace'),
    fileinclude = require('gulp-file-include'),
    open = require("gulp-open");

function startExpress() {
  var express = require('express');
  var app = express();
  app.use(require('connect-livereload')());
  app.use(express.static(__dirname+'/dist/'));
  app.listen(4000);
}
function startLivereload() {
  lr = require('tiny-lr')();
  lr.listen(35729);
}
function notifyLivereload(event) {
  gulp.src(event.path, {read: false})
      .pipe(require('gulp-livereload')(lr));
}
 
// Styles
gulp.task('styles', function() {
  return gulp.src('src/scss/*.scss')
    .pipe(sass({ style: 'expanded', }))
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(gulp.dest('dist/css'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(minifycss())
    .pipe(gulp.dest('dist/css'))
});
// JS Plugins
// These don't need to be linted.
gulp.task('plugins', function() {
  return gulp.src('src/js/plugins/*.js')
    .pipe(gulp.dest('dist/js/plugins'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(uglify())
    .pipe(gulp.dest('dist/js/plugins'))
});
// Scripts -- dev
gulp.task('scripts', function() {
  return gulp.src('src/js/*.js')
    //.pipe(jshint('.jshintrc'))
    //.pipe(jshint.reporter('default'))
    .pipe(concat('all.js'))
    .pipe(gulp.dest('dist/js'))
});
gulp.task('jshint', function() {
  return gulp.src('src/js/*.js')
    .pipe(jshint('.jshintrc'))

}); 
// Images
gulp.task('images', function() {
  return gulp.src('src/images/**/*')
    .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
    .pipe(gulp.dest('dist/images'))
});
// Fonts
gulp.task('fonts', function() {
  return gulp.src('src/fonts/**/*')
    .pipe(gulp.dest('dist/fonts'))
});
 
// HTML 
gulp.task('templates', function() {
  gulp.src('src/templates/*.html')
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(gulp.dest('dist/'));
});

// Clear Gulp Cache
gulp.task('clear', function (done) {
  return cache.clearAll(done);
});

// Clean
gulp.task('clean', function(cb) {
    del(['dist/css/**/*', 'dist/js/**/*', 'dist/images/**/*', 'dist/*.html'], cb)
});

// Default task
gulp.task('default', ['clean'], function() {
    gulp.start('clear', 'styles', 'plugins', 'scripts', 'images', 'templates');
});

 
// Watch
gulp.task('watch', function() {

  // Watch .scss files
  gulp.watch('src/scss/**/*.scss', ['styles']);
   
  // Watch .js plugin files
  gulp.watch('src/js/plugins/*.js', ['plugins']);

  // Watch .js files
  gulp.watch('src/js/**/*.js', ['scripts']);
 
  // Watch image files
  gulp.watch('src/images/**/*', ['images']);

  // Watch HTML files
  gulp.watch('src/content/**/*.html', ['content']);

  // Watch HTML files
  gulp.watch('src/**/*.html', ['templates']);

 
  // Create LiveReload server
  livereload.listen();
 
  // Watch any files in dist/, reload on change
  gulp.watch(['dist/**']).on('change', livereload.changed);

  startExpress();
  startLivereload();

  gulp.src("./dist/index.html")
    .pipe(open("", {url: "http://localhost:4000/"})); 
 
});