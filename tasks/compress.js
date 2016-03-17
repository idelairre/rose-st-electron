'use strict';

var BUILD_DIR = require('./constants').buildDir;
var MODULES = BUILD_DIR + '/node_modules';

module.exports = function(gulp, $) {
	gulp.task('minify:js', function() {
		return gulp.src(BUILD_DIR + '/scripts/**/*.js')
			.pipe($.uglify({
				mangle: false
			}))
			.pipe(gulp.dest(BUILD_DIR))
			.pipe($.size());
	});

	gulp.task('minify:css', function() {
		return gulp.src('dist/styles/**/*.css')
			.pipe($.uncss({
				html: ['app/**/*.html', 'app/index.html']
			}))
			.pipe($.cssnano())
			.pipe(gulp.dest(BUILD_DIR + '/styles'))
			.pipe($.size());
	});

	gulp.task('minify:dependencies', function() {
		return gulp.src(MODULES + '/**/*.js')
			.pipe($.uglify({
				mangle: false
			}))
			.pipe(gulp.dest())
	})
  
	return function() {
		gulp.task('minify', ['minify:js']);
	}
}
