'use strict';

var async = require('async');
var exec = require('child_process').exec;
var fs = require('fs-extra');
var os = require('os');
var utils = require('../utils');
var constants = require('../constants');
var packageJson = constants.packageJson;

var APP_SIZE;
var APP_NAME = constants.appName;
var BUILD_DIR = constants.buildDir;
var RELEASE_DIR = constants.releaseDir;
var TEMP_DIR = constants.tempDir;
var FILE_NAME = APP_NAME + '-linux-x64';
var DEB_FILE_NAME = APP_NAME + '.deb';
var DEB_PATH = RELEASE_DIR + '/linux/' + APP_NAME + '-linux-x64';

var tasks = {
	configureDesktop: function(callback) { // works
		// Create .desktop file from the template
		var path = 'resources/linux/app.desktop';
		utils.logger.start('Parsing desktop file', path);
		fs.readFile(path, 'utf8', function(error, data) {
			if (error) {
				utils.handleErrors(error);
				callback ? callback(error) : error;
				return;
			}
			data = utils.replace(data, {
				name: packageJson.name,
				productName: packageJson.productName,
				description: packageJson.description,
				version: packageJson.version,
				author: packageJson.author,
				os: 'linux',
				arch: 'x64'
			});

			utils.logger.end('Parsed desktop file');
			return callback ? callback(null, data) : data;
		});
	},

	writeDesktopFile: function(desktop, callback) {
		var path = DEB_PATH + '/usr/share/applications/' + FILE_NAME + '.desktop';
		utils.logger.start('Writing desktop file', path);

		utils.writeFile(path, desktop);

		utils.logger.end('Finished writing desktop file');
	},

	copyIcon: function(callback) {
		return utils.copyFile('resources/icon.png', DEB_PATH + '/opt/' + FILE_NAME + '/icon.png', callback);
	},

	readDebianControl: function(data, callback) {
		var path = './resources/linux/DEBIAN/control';
		utils.logger.start('Parsing DEB control', path);
		// Preparing debian control file
		fs.readFile(path, 'utf-8', function(error, data) {
			if (error) {
				utils.handleErrors(error)
				callback ? callback(error) : error;
				return;
			}
			utils.logger.end('Parsed DEB control');
			return callback ? callback(null, data) : data;
		});
	},

	writeDebianControl: function(data, callback) {
		var path = DEB_PATH + '/DEBIAN/control';
		utils.logger.start('Writing DEB control', path);

		utils.readSizeRecursive(DEB_PATH, function(error, result) {
			data = utils.replace(data, {
				name: constants.packageJson.name,
				description: constants.packageJson.description,
				version: constants.packageJson.version,
				author: constants.packageJson.author,
				email: constants.packageJson.email,
				size: result
			});

			utils.writeFile(path, data);
			utils.logger.end('Finished writing DEB control');
		});
	},

	packageDebFile: function(data, callback) {
		var path = DEB_PATH.replace(/\s/g, '\\ ') + ' ' + RELEASE_DIR + '/linux/'.replace(/\s/g, '\\ ');
		utils.logger.start('Creating DEB package', path);

		var buildCmd = 'fakeroot dpkg-deb -Zxz --build ' + path;

		// Build the package...
		exec(buildCmd, function(error, stdout, stderr) {
			if (error || stderr) {
				console.error('ERROR while building DEB package:');
				console.error(error);
				console.error(stderr);
				utils.handleErrors(error)
				callback ? callback(error) : null;
				return;
			} else {
				utils.logger.end('DEB package ready!');
				return callback ? callback(null, data) : data;
			}
		});
	}
};

module.exports = function() {
	return function() {
		if (os.platform() === 'win32' || os.platform() === 'darwin') {
			utils.handleErrors(new Error('Incompatable archicture: ' + os.platform()) + 'skipping...');
			return;
		}
		async.waterfall([tasks.copyIcon, tasks.configureDesktop, tasks.writeDesktopFile, tasks.readDebianControl, tasks.writeDebianControl, tasks.packageDebFile])
	};
}
