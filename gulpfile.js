'use strict';

var del = require('del');
var gulp = require('gulp');
var gulpsync = require('gulp-sync')(gulp);
var electron = require('electron-connect').server.create();
var constants = require('./tasks/constants');

var $ = require('gulp-load-plugins')({
	DEBUG: false,
	scope: ['devDependencies'],
	lazy: true
});

var bundler = getTask('browserify');

var assets = getTask('assets');

function getTask(task) {
  return require('./tasks/' + task)(gulp, $);
}

gulp.task('package:debian', getTask('release/linux'));

gulp.task('assets', assets.bundle);

gulp.task('clean', function() {
	return del.sync([constants.buildDir, constants.releaseDir, constants.tempDir]);
});

gulp.task('compress', getTask('compress'));

gulp.task('html', assets.tasks[1]);

gulp.task('styles', assets.tasks[0]); // this is mad ugly but whatevs

gulp.task('build', getTask('build').build);

gulp.task('build:dist', ['set-production'], getTask('build').buildDist);

gulp.task('bundle:scripts', function() {
	bundler.init();
	return bundler.bundle();
});

gulp.task('bundle:build', bundler.stop.bind(bundler));

gulp.task('bundle', gulpsync.sync(['bundle:scripts', 'bundle:build']));

gulp.task('scripts', ['bundle:scripts']);

gulp.task('set-production', function() {
	process.env.NODE_ENV = 'production';
});

gulp.task('serve', function() {
	electron.start();
	gulp.watch(['app/scripts/**/*.css'], ['styles', electron.restart]);
	gulp.watch(['app/scripts/**/*.html', 'app/**/*.js'], ['html', 'scripts', electron.restart]);
	gulp.watch(['app/index.js', 'app/events.js', 'app/menu.js', 'app/index.html'], ['build:electron', electron.reload]);
});

gulp.task('build:production', gulpsync.sync(['clean', 'set-production', 'assets', 'bundle']));

gulp.task('default', ['build']);

gulp.task('serve:production', gulpsync.sync(['build:production', 'serve']));

gulp.task('watch', gulpsync.async(['clean', 'assets', 'build', ['bundle', 'serve']])),
	function() {
		bundler.watch();
	};
