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

gulp.task('package:win', getTask('release/windows'));

gulp.task('clean', function() {
	return del.sync([constants.buildDir, constants.releaseDir, constants.tempDir]);
});

gulp.task('compress', getTask('compress'));

gulp.task('styles', assets.tasks[0]); // this is mad ugly but whatevs

gulp.task('html', assets.tasks[1]);

gulp.task('extras', assets.tasks[2]); // this is mad ugly but whatevs

gulp.task('assets', ['styles', 'html', 'extras'], assets.tasks[3]);

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
	gulp.watch(['app/scripts/**/*.css'], ['styles', electron.reload]);
	gulp.watch(['app/scripts/**/*.html', 'app/**/*.js'], ['scripts', electron.reload]);
	gulp.watch(['app/index.js', 'app/events.js', 'app/menu.js', 'app/index.html'], ['build', electron.restart]);
});

gulp.task('build:production', gulpsync.sync(['clean', 'set-production', 'assets', 'bundle']));

gulp.task('default', ['build']);

gulp.task('serve:production', gulpsync.sync(['build:production', 'serve']));

gulp.task('watch', gulpsync.async(['clean', 'assets', 'build', ['bundle', 'serve']])),
	function() {
		bundler.watch();
	};
