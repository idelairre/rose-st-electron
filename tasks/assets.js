'use strict';

var BUILD_DIR = require('./constants').buildDir;

module.exports = function(gulp, $) {
	var tasks = [
    function css() {
			return gulp.src(['app/**/*.css', 'node_modules/angular-chart.js/dist/angular-chart.css', '!app/assets/**/*.css'])
				.pipe($.autoprefixer('last 1 version'))
				.pipe($.concat('styles.css'))
				.pipe(gulp.dest(BUILD_DIR + '/styles'))
				.pipe($.size());
		},
		function html() {
			return gulp.src('app/index.html')
				.pipe(gulp.dest(BUILD_DIR))
				.pipe($.size());
		},
		function extras() {
			return gulp.src(['app/*.txt', 'app/*.ico', 'app/**/*.svg', 'app/**/*.json'])
				.pipe(gulp.dest(BUILD_DIR))
				.pipe($.size());
		},
		function assets() {
			return gulp.src('app/assets/**/*.*')
				.pipe(gulp.dest(BUILD_DIR + '/assets'))
				.pipe($.size())
		}
  ];
  return {
    tasks: tasks
  }
}
