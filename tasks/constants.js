'use strict';

var packageJson = require('../package.json');

var APP_NAME = packageJson.name;
var BABEL_PRESET = {
	presets: ['es2015', 'stage-0'],
	plugins: ['transform-function-bind', 'transform-class-properties', 'transform-decorators-legacy']
};
var BUILD_DIR = 'build';
var ELECTRON_VERSION = packageJson.devDependencies['electron-prebuilt'].replace(/\^/, '');
var RELEASE_DIR = 'release'; // directory for application packages
var RESOURCE_DIR = 'resources';
var TEMP_DIR = 'staging';

module.exports = {
	appName: APP_NAME,
  buildDir: BUILD_DIR,
  babelPreset: BABEL_PRESET,
  releaseDir: RELEASE_DIR,
  resourceDir: RESOURCE_DIR,
  tempDir: TEMP_DIR,
  electronVersion: ELECTRON_VERSION,
  packageJson: packageJson
};
