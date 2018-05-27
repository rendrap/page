// 'use strict';

var path         = require('path');
var gulp         = require('gulp');
var less         = require('gulp-less');
var minifycss    = require('gulp-minify-css');
// Additional package for "Page" jekyll project
var browserSync  = require('browser-sync');
var cp           = require('child_process');
var pug          = require('gulp-pug');
var plumber      = require('gulp-plumber');
var notify       = require('gulp-notify');
const reload     = browserSync.reload;
//CONFIG PATHS
var config = {
  pages  : './pages',
  assets : './assets',
  build:'./dist'
};

var jekyll   = process.platform === 'win32' ? 'jekyll.bat' : 'jekyll';
var messages = {
    jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};


//TASKS
gulp.task('less', function () {
  gulp.src(config.pages+'/less/pages.less')
    .pipe(less({
      paths: [config.pages+'/less/']
    }))
    .pipe(plumber({
          errorHandler: notify.onError()
      }))
    .pipe(gulp.dest(config.pages+'/css/'))
    .pipe(gulp.dest('./_site/pages/css/'))
    .pipe(browserSync.reload({stream:true}));
});

// compile pug
gulp.task('pug', function() {
  return gulp.src("./_pug_includes/**/*.pug")
      .pipe(plumber({
          errorHandler: notify.onError()
      }))
      .pipe(pug({
        pretty: true,
        verbose: true
      }))
      .pipe(gulp.dest("./_includes"))
      .pipe(browserSync.stream());
});

gulp.task('js', function() {
    return gulp.src(["assets/js/**/*.js"])
        .pipe(gulp.dest("./_site/assets/js"))
        .pipe(browserSync.reload({stream:true}));
});

gulp.task('css-min', function(){
  return gulp.src( [config.build+'./assets/css/*.css' , config.build+'./pages/css/*.css'])
    .pipe(minifycss());
});

// Wait for jekyll-build, then launch the Server
gulp.task('browser-sync', ['less', 'pug', 'jekyll-rebuild'], function() {
    browserSync({
        open: false,
        logPrefix: 'Page Jekyll',
        logFileChanges: true,
        server: {
            baseDir: '_site',
        },
    });
});

gulp.task('jekyll-build', function (done) {
    browserSync.notify(messages.jekyllBuild);
    return cp.spawn( jekyll , ['build', '--incremental'], {stdio: 'inherit'})
        .on('close', done);
});

gulp.task('gh-pages', ['pug'], function (done) {
    browserSync.notify(messages.jekyllBuild);
    return cp.spawn( jekyll , ['build', '--config', '_config-ghpages.yml'], {stdio: 'inherit'})
        .on('close', done);
});

// Rebuild Jekyll & do page reload
gulp.task('jekyll-rebuild', ['jekyll-build'], function () {
    browserSync.reload();
});

gulp.task('watch', function () {
    gulp.watch(config.pages+'/less/*.less', ['less']);
    gulp.watch('./_pug_includes/**/*.pug', ['pug']);
    gulp.watch('assets/js/*.js', ['js']);
    gulp.watch(['*.md','_sections/**/*.md'], ['jekyll-rebuild']);
    gulp.watch(['*.yml','_data/*.yml'], ['jekyll-rebuild']);
    gulp.watch(['./*.html', '_layouts/*.html', '_includes/*.html', '_includes/*.md',
    '_posts/*'], ['jekyll-rebuild']);
});

gulp.task('default', ['browser-sync', 'watch']);