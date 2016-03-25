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

function getTask(task) {
  return require('./tasks/' + task)(gulp, $);
}

gulp.task('clean', function() {
	return del.sync([constants.buildDir, constants.releaseDir, constants.tempDir]);
});

gulp.task('set-production', function() {
	process.env.NODE_ENV = 'production';
});

// assets

gulp.task('styles', getTask('assets').styles);

gulp.task('html', getTask('assets').html);

gulp.task('extras', getTask('assets').extras);

gulp.task('assets', ['styles', 'html', 'extras'], getTask('assets').assets);

// browserify

gulp.task('bundle:scripts', function() {
	bundler.init();
	return bundler.bundle();
});

gulp.task('bundle:build', bundler.stop.bind(bundler));

gulp.task('bundle', gulpsync.sync(['bundle:scripts', 'bundle:build']));

gulp.task('scripts', ['bundle:scripts']);

// build release

gulp.task('build', getTask('build').build);

gulp.task('build:dist', ['set-production'], getTask('build').buildDist);

// distribution

gulp.task('package:debian', getTask('release/linux'));

gulp.task('package:win', getTask('release/windows'));

gulp.task('package', ['package:debian', 'package:win']);

gulp.task('compress', getTask('compress'));

// electron

gulp.task('serve', function() {
	electron.start();
	gulp.watch(['app/scripts/**/*.css'], ['styles', electron.restart]);
	gulp.watch(['app/scripts/**/*.html', 'app/**/*.js'], ['scripts', electron.reload]);
	gulp.watch(['app/index.js', 'app/events.js', 'app/menu.js', 'app/index.html'], ['build', electron.reload]);
});

// versioning

gulp.task('patch', getTask('semver').patch);

gulp.task('patch:major', getTask('semver').major);

gulp.task('patch:minor', getTask('semver').minor);

// watch tasks

gulp.task('build:production', gulpsync.sync(['clean', 'set-production', 'assets', 'build', 'bundle']));

gulp.task('default', ['build']);

gulp.task('serve:production', gulpsync.sync(['build:production', 'serve']));

gulp.task('watch', gulpsync.sync(['clean', 'assets', 'build', 'bundle', 'serve'])),
	function() {
		bundler.watch();
	};
