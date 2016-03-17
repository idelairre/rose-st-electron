'use strict';

var del = require('del');
var gulp = require('gulp');
var gulpsync = require('gulp-sync')(gulp);
var electron = require('electron-connect').server.create();
var constants = require('./tasks/constants');

var $ = require('gulp-load-plugins')({
	DEBUG: true,
	scope: ['devDependencies'],
	lazy: true
});

var bundler = getTask('browserify');

var assets = getTask('assets');

function getTask(task) {
  return require('./tasks/' + task)(gulp, $);
}

gulp.task('assets', assets.bundle);

gulp.task('styles', assets.tasks[0]);

gulp.task('html', assets.tasks[1]);

gulp.task('build:electron', getTask('build').buildElectron);

gulp.task('build:package', getTask('build').buildPackage);

gulp.task('build:runtime', getTask('build').buildRuntime);

gulp.task('build:packageJson', getTask('build').packageJson);

gulp.task('build:install', ['build:packageJson'], getTask('build').install);

gulp.task('build:app', ['build:runtime', 'build:install', 'build:electron']);

gulp.task('bundle:scripts', function() {
	bundler.init();
	return bundler.bundle();
});

gulp.task('bundle:build', bundler.stop.bind(bundler));

gulp.task('bundle', gulpsync.sync(['bundle:scripts', 'bundle:build']));

gulp.task('scripts', ['bundle:scripts']);

gulp.task('clean', function() {
	return del.sync([constants.buildDir, constants.releaseDir]);
});

gulp.task('set-production', function() {
	process.env.NODE_ENV = 'production';
});

gulp.task('build', ['build:runtime', 'build:packageJson', 'build:install', 'build:electron', 'build:package']);

gulp.task('serve', function() {
	electron.start();
	gulp.watch(['app/scripts/**/*.css'], ['styles', electron.restart]);
	gulp.watch(['app/scripts/**/*.html', 'app/**/*.js'], ['html', 'scripts', electron.restart]);
	gulp.watch(['app/index.js', 'app/events.js', 'app/menu.js', 'app/index.html'], ['build:electron', electron.reload]);
});

gulp.task('build:production', gulpsync.sync(['clean', 'set-production', 'bundle', 'build']));

gulp.task('default', ['build']);

gulp.task('serve:production', gulpsync.sync(['build:production', 'serve']));

gulp.task('watch', gulpsync.async(['clean', 'assets', 'build:app', ['bundle', 'serve']])),
	function() {
		bundler.watch();
	};
