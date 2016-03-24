'use strict';

module.exports = function(gulp, $) {
  return {
    minor: function () {
      return gulp.src('./package.json')
        .pipe($.bump({ type: 'minor' }))
        .pipe(gulp.dest('./'))
    },
    major: function () {
      return gulp.src('./package.json')
        .pipe($.bump({ type: 'major' }))
        .pipe(gulp.dest('./'))
    },
    patch: function () {
      return gulp.src('./package.json')
        .pipe($.bump({ type: 'patch' }))
        .pipe(gulp.dest('./'))
    }
  }
}
