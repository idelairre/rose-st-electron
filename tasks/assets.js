'use strict';

var BUILD_DIR = require('./constants').buildDir;

module.exports = function(gulp, $) {
  return {
		styles: function() {
			return gulp.src(['app/**/*.css', 'node_modules/angular-chart.js/dist/angular-chart.css', '!app/assets/**/*.css'])
				.pipe($.autoprefixer('last 1 version'))
				.pipe($.concat('styles.css'))
				.pipe(gulp.dest(BUILD_DIR + '/styles'))
				.pipe($.size())
		},
		html: function() {
			return gulp.src('app/index.html')
				.pipe(gulp.dest(BUILD_DIR))
				.pipe($.size())
		},
		extras: function() {
			return gulp.src(['app/*.txt', 'app/*.ico', 'app/**/*.svg', 'app/**/*.json'])
				.pipe(gulp.dest(BUILD_DIR))
				.pipe($.size())
		},
		assets: function() {
			return gulp.src('app/assets/**/*.*')
				.pipe(gulp.dest(BUILD_DIR + '/assets'))
				.pipe($.size())
		}
  }
}
