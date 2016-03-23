'use strict';

var async = require('async');
var childProcess = require('child_process');
var fs = require('fs-extra');
var utils = require('../utils');
var constants = require('../constants');
var packageJson = constants.packageJson;
var rcedit = require('rcedit');
var squirrelBuilder = require('electron-installer-squirrel-windows');

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
					'OriginalFilename': packageJson.productName + '.exe'
				}
			},
			function(error) {
				if (!error) {
					utils.logger.error(error);
					callback ? callback(error) : error;
					return;
				}
			});
		utils.logger.end('Finished writing .exe properties');
		return callback ? callback(null) : null;
	},

	createInstaller: function(installScript, callback) {
		utils.logger.start('Creating installer');
		var finalPackageName = 'setup.exe';

		squirrelBuilder({
				exe: 'Setup.exe',
				path: APP_DIR,
				product_name: packageJson.productName,
				authors: packageJson.author,
				version: packageJson.version,
				out: WIN_DIR,
				setup_icon: '../../../resources/windows/setup-icon.ico',
				debug: true
			}, function(error) {
				if (error) {
					utils.handleErrors(error);
					return;
				}

				utils.logger.end('Finished creating installer');

				return callback ? callback(null) : installScript;
			});
	}
}

module.exports = function() {
	return function() {
		async.waterfall([tasks.copyIcon, tasks.setExeProperties, tasks.createInstaller])
	};
};
