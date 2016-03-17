'use strict';

var BUILD_DIR = require('./constants').buildDir;

module.exports = function(gulp, $) {
	var tasks = [
		function minifyJs() {
			return gulp.src(BUILD_DIR + '/**/*.js')
				.pipe($.uglify({
					mangle: false
				}))
				.pipe(gulp.dest(BUILD_DIR))
				.pipe($.size());
		},
		function minifyCss() {
			return gulp.src(BUILD_DIR + '/styles/**/*.css')
				.pipe($.cssnano())
				.pipe(gulp.dest(BUILD_DIR + '/styles'))
				.pipe($.size());
		}
	];
	return function() {
		gulp.task('compress', function() {
			tasks.map(function(task) {
				task();
			});
		});
	}
}
