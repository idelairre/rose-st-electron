'use strict';

var async = require('async');
var childProcess = require('child_process');
var fs = require('fs-extra');
var utils = require('../utils');
var constants = require('../constants');
var packageJson = constants.packageJson;
var rcedit = require('rcedit');
var squirrelBuilder = require('electron-installer-squirrel-windows');
var path = require('path');
var inflected = require('inflected');

var APP_NAME = constants.appName;
var BUILD_DIR = constants.buildDir;
var RELEASE_DIR = constants.releaseDir;
var TEMP_DIR = constants.tempDir;
var WIN_DIR = RELEASE_DIR + '/win32/';
var APP_DIR = RELEASE_DIR + '/win32/' + APP_NAME + '-win32-x64'

var tasks = {
	copyIcon: function(callback) {
		return utils.copyFile('resources/icon.png', APP_DIR + '/icon.png', callback);
	},

	setExeProperties: function(callback) {
		// Replace Electron icon for your own.
		utils.logger.start('Writing .exe properties');
		var path = APP_DIR + '/' + APP_NAME + '.exe';
		rcedit(path, {
			'icon': 'resources/windows/icon.ico',
			'version-string': {
				'ProductName': packageJson.productName,
				'FileDescription': packageJson.description,
				'ProductVersion': packageJson.version,
				'CompanyName': packageJson.author,
				'LegalCopyright': packageJson.copyright,
				'OriginalFilename': packageJson.name + '.exe'
			}
		}, function(error) {
			if (error) {
				utils.handleErrors(error);
				callback ? callback(error, null) : error;
				return;
			} else {
				utils.logger.end('Finished writing .exe properties');
				return callback ? callback(null) : null;
			}
		});
	},

	packageInstaller: function(callback) {
		utils.logger.start('Creating installer');
		var opts = {
			name: packageJson.productName,
			exe: packageJson.name + '.exe',
			path: path.normalize(APP_DIR),
			product_name: packageJson.productName,
			// loading_gif: path.resolve(process.cwd(), 'resources', 'install-spinner.gif'),
			authors: packageJson.author,
			version: packageJson.version,
			out: path.normalize(WIN_DIR),
			setup_icon: path.resolve(process.cwd(), 'resources/windows', 'setup-icon.ico'),
			overwrite: true,
			debug: true
		};

		squirrelBuilder(opts, function done(error) {
			if (error) {
				utils.handleErrors(error);
				callback ? callback(error, null) : error;
				return;
			} else {
				utils.logger.end('Finished creating installer');
				return callback ? callback(null) : null;
			}
		});
	},

	clearReleaseFolder(callback) {
		var dirPath = APP_DIR;
		utils.logger.start('Clearing release folder', dirPath);
		fs.remove(dirPath, function(error) {
			if (error) {
				utils.handleErrors(error);
				callback ? callback(error, null) : error;
				return;
			} else {
				utils.logger.end('Finished clearing release folder');
				return callback(null);
			}
		});
	}
}

module.exports = function() {
	return function() {
		async.waterfall([tasks.copyIcon, tasks.packageInstaller, tasks.clearReleaseFolder]);
	}
}
