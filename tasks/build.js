'use strict';

var async = require('async');
var cloneDeep = require('lodash').cloneDeep;
var merge = require('merge2');
var exec = require('child_process').exec;
var fs = require('fs-extra');
var packager = require('electron-packager');
var path = require('path');
var utils = require('./utils');
var babel = require('babel-core');

var constants = require('./constants');

var BUILD_DIR = constants.buildDir;
var BABEL_PRESET = constants.babelPreset;
var ELECTRON_VERSION = constants.electronVersion;
var RELEASE_DIR = constants.releaseDir;
var TEMP_DIR = constants.tempDir;
var APP_NAME = constants.packageJson.name;
var OUT_DIR;

function writeFile(data, filePath, callback) {
	utils.logger.start('Writing file', filePath);
	fs.writeFile(filePath, data, function(error) {
		if (error) {
			utils.handleErrors(error);
			callback ? callback(error) : error;
			return;
		}
		utils.logger.end('Finished writing file ' + path.parse(filePath).base);
	});
}

function moveDir(source, dest, callback) {
	utils.logger.start('Moving directory', dest);
	fs.move(source, dest, function(error) {
		if (error) {
			utils.handleErrors(error);
			callback ? callback(error) : error;
			return;
		}
		utils.logger.end('Finished moving directory');
	});
}

var tasks = {
	buildElectron: function(callback) {
		utils.logger.start('Building electron');
		['app/events.js', 'app/menu.js', 'app/index.js'].map(function(entry) {
			var file = path.parse(entry).base;
			var filePath = BUILD_DIR + '/' + file;
			fs.readFile(entry, 'utf-8', function(error, data) {
				if (error) {
					utils.handleErrors(error);
					callback ? callback(error) : error;
					return;
				}
				data = babel.transform(data, BABEL_PRESET);
				writeFile(data.code, filePath, callback);
			});
		});
		utils.logger.end('Finished building electron');
		return callback ? callback(null) : null;
	},

	buildRuntime: function(callback) {
		utils.logger.start('Building runtime');
		['node_modules/electron-prebuilt', 'node_modules/electron-debug'].map(function(entry) {
			utils.copyDir(entry, BUILD_DIR + '/' + entry, function(error) {
				if (error) {
					utils.handleErrors(error);
					callback ? callback(error) : error;
					return;
				}
			});
		});
		utils.logger.end('Finished building runtime');
		return callback ? callback(null) : null;
	},

	install: function(callback) {
		utils.logger.start('Installing npm modules');
		exec('cd build && npm install', function(error, out, code) {
			if (error) {
				utils.handleErrors(error);
				callback ? callback(error) : null;
				return;
			}
			utils.logger.end('Finished installing npm modules');
			return callback ? callback(null) : null;
		});
	},
	// Write a package.json for distribution
	packageJson: function(callback) {
		utils.logger.start('Copying package.json');
		function replacer(key, value) {
			if (key === 'devDependencies') {
				return undefined;
			}
			if (key === 'main') {
				return 'index.js';
			}
			if (key === 'environment' && process.env.NODE_ENV === 'production') {
				return 'production';
			}
			return value;
		}
		var json = cloneDeep(require('./constants').packageJson);
		json.dependencies["babel-polyfill"] = "^6.3.14";

		if (!fs.existsSync(BUILD_DIR)) {
			fs.mkdirSync(BUILD_DIR);
		}
		fs.writeFile(BUILD_DIR + '/package.json', JSON.stringify(json, replacer, 3), function(error) {
			if (error) {
				utils.handleErrors(error);
				callback ? callback(error) : error;
				return;
			}
			utils.logger.end('Finished copying package.json');
			return callback ? callback(null) : null;
		});
	},

	packageDist: function(callback) {
		utils.logger.start('Packaging distribution');
		// var done = 0;
		var targets = ['win32', 'linux', 'darwin'];
		targets.map(function(platform) {
			OUT_DIR = RELEASE_DIR + '/' + platform;
			var taskName = 'package:' + platform;

			packager({
				asar: true,
				dir: BUILD_DIR,
				name: APP_NAME,
				arch: 'x64',
				platform: platform,
				out: (platform === 'linux' ? OUT_DIR + '/' + APP_NAME + '-linux-x64' + '/opt' : OUT_DIR),
				overwrite: true,
				version: ELECTRON_VERSION
			}, function done(error) {
				if (error) {
					utils.handleErrors(error);
					callback ? callback(error) : error;
					return;
				}
				// done++;
				utils.logger.start('Finished packaging distribution');
			});
		});
		return callback ? callback(null) : null;
	},

	build: function(callback) {
		utils.logger.start('Building electron files');
		async.waterfall([tasks.buildElectron, tasks.buildRuntime, tasks.packageJson, tasks.install],
			function(error, data) {
				if (error) {
					utils.handleErrors(error);
					callback ? callback(error) : null;
					return;
				}
				utils.logger.end('Finished building electron files');
				return callback ? callback(data) : data;
			});
	}
};

module.exports = function() {
	return {
		buildDist: function() {
			async.waterfall([tasks.buildElectron, tasks.buildRuntime, tasks.packageJson, tasks.install, tasks.packageDist]);
		},
		build: function() {
			tasks.build();
		}
	}
}
