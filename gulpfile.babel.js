var gulp = require('gulp');
var gulpsync = require('gulp-sync')(gulp);
var babel = require('gulp-babel');
var replace = require('gulp-replace-path');
var browserSync = require('browser-sync');
var gulpFilter = require('gulp-filter');
var fs = require('fs');
var $ = require('gulp-load-plugins')(); // loads other gulp plugins
var browserify = require('browserify');
var babelify = require('babelify');
var watchify = require('watchify');
var source = require('vinyl-source-stream');
var stringify = require('stringify');
var del = require('del');
var electron = require('electron-connect').server.create();
var winInstaller = require('electron-windows-installer');

var bundler = {
  w: null,
  init: function() {
    this.w = watchify(browserify({
      entries: ['./app/scripts/app.js'],
      extensions: ['.js'],
      debug: true
    })
    .transform(stringify({
      extensions: ['.html']
    }))
    .transform(babelify.configure({
      presets: ['es2015', 'stage-0'],
      plugins: ['transform-class-properties', 'transform-decorators-legacy', 'transform-function-bind']
    })))
  },
  bundle: function() {
    return this.w && this.w.bundle()
      .on('start', logger.start)
      .on('error', handleErrors)
      .pipe(source('app.js'))
      .pipe(gulp.dest('./dist/scripts/'))
      .pipe(browserSync.reload({
        stream: true
      }));
  },
  watch: function() {
    this.w && this.w.on('update', this.bundle.bind(this));
  },
  stop: function() {
    this.w && this.w.close();
  }
};

gulp.task('images', function() {
  return gulp.src('app/assets/**/*')
    .pipe($.cache($.imagemin({
      optimizationLevel: 3,
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('dist'))
    .pipe($.size());
});

gulp.task('tinymce', function() {
  return gulp.src('node_modules/tinymce/**/*.*')
  .pipe(gulp.dest('dist/assets'))
  .pipe($.size())
});

gulp.task('serve', function () {

  // Start browser process
  electron.start();

  // Restart browser process
  gulp.watch('app/scripts/**/*.html', ['scripts', electron.restart]);

  gulp.watch('app/scripts/**/*.js', ['scripts', electron.restart]);

  // Reload renderer process
  gulp.watch(['index.js', 'index.html'], electron.reload);
});

gulp.task('styles', function() {
  return gulp.src(['app/**/*.css', 'node_modules/angular-chart.js/dist/angular-chart.css', '!app/assets/**/*.css'])
    .on('error', handleErrors)
    .pipe($.autoprefixer('last 1 version'))
    .pipe($.concat('styles.css'))
    .pipe(gulp.dest('dist/styles'))
    .pipe(browserSync.reload({
      stream: true
    }))
    .pipe($.size());
});

gulp.task('scripts', function() {
  bundler.init();
  return bundler.bundle();
});

gulp.task('html', function() {
  return gulp.src(['app/index.html'])
    .pipe(gulp.dest('dist'))
    .pipe(browserSync.reload({
      stream: true
    }))
  .pipe($.size());
});

gulp.task('clean', function () {
  return del.sync(['dist']);
})

gulp.task('extras', function() {
  return gulp.src(['app/*.txt', 'app/*.ico', 'app/**/*.svg'])
    .pipe(gulp.dest('dist/'))
    .pipe($.size());
});

gulp.task('electron', function() {
  return gulp.src(['app/events.js', 'app/menu.js'])
    .pipe(gulp.dest('dist/'))
    .pipe($.size());
});

gulp.task('minify:js', function() {
  return gulp.src('dist/scripts/**/*.js')
    .pipe($.uglify({
      mangle: false
    }))
    .pipe(gulp.dest('dist/scripts'))
    .pipe($.size());
});

gulp.task('create-windows-installer', function(done) {
  winInstaller({
    appDirectory: './build/win32',
    outputDirectory: './release',
    arch: 'ia32'
  }).then(done).catch(done);
});

gulp.task('minify:css', function() {
  return gulp.src('dist/styles/**/*.css')
    .pipe($.uncss({
      html: ['app/**/*.html', 'app/index.html']
    }))
    .pipe($.cssnano())
    .pipe(gulp.dest('dist/styles'))
    .pipe($.size());
});

gulp.task('set-production', function() {
  process.env.NODE_ENV = 'production';
});

var logger = (function() {
  return {
    start: function(filepath) {
      console.log(arguments);
      startTime = process.hrtime();
      $.util.log('Bundling', $.util.colors.green(filepath) + '...');
    },

    watch: function(bundleName) {
      $.util.log('Watching files required by', $.util.colors.yellow(bundleName));
    },

    end: function(filepath) {
      var taskTime = process.hrtime(startTime);
      var prettyTime = prettyHrtime(taskTime);
      $.util.log('Bundled', $.util.colors.green(filepath), 'in', $.util.colors.magenta(prettyTime));
    }
  }
})();

var handleErrors = function() {
  var args = Array.prototype.slice.call(arguments);

  $.notify.logLevel(2);

  // Send error to notification center with gulp-notify
  $.notify.onError({
    title: "Compile Error",
    message: "<%= error %>"
  }).apply(this, args);

  // Keep gulp from hanging on this task
  this.emit('end');
};

gulp.task('minify', ['minify:js']);

gulp.task('build', bundler.stop.bind(bundler));

gulp.task('assets', ['styles', 'tinymce', 'electron']);

gulp.task('bundle', ['html', 'assets', 'styles', 'scripts', 'extras']);

gulp.task('build:production', gulpsync.sync(['clean', 'html', 'set-production', 'bundle', 'minify', 'build']));

gulp.task('default', ['build']);

gulp.task('watch', gulpsync.async(['clean', 'html', ['bundle', 'serve']])),
  function() {
    bundler.watch();
    gulp.watch('app/**/*.js', ['scripts']);
  };
