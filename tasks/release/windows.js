'use strict';

var async = require('async');
var childProcess = require('child_process');
var fs = require('fs-extra');
var utils = require('../utils');
var constants = require('../constants');
var packageJson = constants.packageJson;
var rcedit = require('rcedit');

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

	readInstallerNsi: function(callback) {
		var installScript = 'resources/windows/installer.nsi';
		utils.logger.start('Parsing installer.nsi', installScript);
		fs.readFile(installScript, 'utf-8', function(error, data) {
			if (error) {
				utils.handleErrors(error);
				callback ? callback(error) : error;
				return;
			}
			utils.logger.end('Parsed installer.nsi');
			return callback ? callback(null, data) : data;
		});
	},

	writeInstallScript: function(installScript, callback) {
		utils.logger.start('Creating installer');
		var finalPackageName = 'setup.exe';

		installScript = utils.replace(installScript, {
			name: packageJson.name,
			productName: packageJson.productName,
			author: packageJson.author,
			version: packageJson.version,
			src: '.',
			dest: finalPackageName,
			icon: '../../../resources/windows/icon.ico',
			setupIcon: '../../../resources/windows/setup-icon.ico',
			banner: '../../../resources/windows/setup-banner.bmp',
		});

		utils.logger.end('Finished creating installer');

		utils.writeFile(APP_DIR + '/installer.nsi', installScript);

		return callback ? callback(null) : installScript;
	},

	createInstaller: function(callback) {

		utils.logger.start('Building installer with NSIS');

		// Note: NSIS have to be added to PATH (environment variables).
		var nsis = childProcess.spawn('makensis', [
			APP_DIR + '/installer.nsi'
		], {
			stdio: 'inherit'
		});

		nsis.on('error', function(error) {
			if (error) {
				utils.handleErrors(error);
				callback ? callback(error) : error;
				return;
			}
		});

		nsis.on('close', function() {
			utils.logger.end('Finished building installer with NSIS');
		});
	}
}

module.exports = function() {
	return function() {
		async.waterfall([tasks.copyIcon, tasks.setExeProperties, tasks.readInstallerNsi, tasks.writeInstallScript, tasks.createInstaller])
	};
};
