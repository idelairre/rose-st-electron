'use strict';

var gulp = require('gulp');
var utils = require('./utils');

var releaseForOs = {
    osx: require('./release/osx'),
    linux: require('./release/linux'),
    windows: require('./release/windows'),
};

gulp.task('release', ['build'], function () {
    return releaseForOs[utils.os()]();
});
