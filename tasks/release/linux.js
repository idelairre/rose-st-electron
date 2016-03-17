'use strict';

var async = require('async');
var exec = require('child_process').exec;
var fs = require('fs-extra');
var utils = require('../utils');
var constants = require('../constants');
var packageJson = constants.packageJson;

var APP_SIZE;
var BUILD_DIR = constants.buildDir;
var RELEASE_DIR = constants.releaseDir;
var PACK_NAME = constants.packageJson.name;
var TEMP_DIR = constants.tempDir;
var FILE_NAME = PACK_NAME + '-linux-x64';
var DEB_FILE_NAME = PACK_NAME + '.deb';
var DEB_PATH = RELEASE_DIR + '/linux/' + PACK_NAME + '-linux-x64';
var PACK_DIR = RELEASE_DIR + '/' + PACK_NAME;

module.exports = function(gulp, $) {
	var tasks = {
		configureDesktop: function(callback) { // works
			// Create .desktop file from the template
			var path = 'resources/linux/app.desktop';
			utils.logger.start('Parsing desktop file', path);
			fs.readFile(path, 'utf8', function(error, data) {
				if (error) {
					utils.handleErrors(error);
					return callback ? callback(error) : error;
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

			fs.ensureFile(path, function(error) {
				if (error) {
					utils.handleErrors(error);
					return callback ? callback(error) : error;
				}
				fs.writeFile(path, desktop, function(error, data) {
					if (error) {
						utils.handleErrors(error);
						return callback ? callback(error) : null;
					}
					utils.logger.end('Wrote desktop file');
					return callback ? callback(null, data) : data;
				});
			});
		},

		copyIcon: function(callback) { // works
			// Copy icon
			return utils.copyFile('resources/icon.png', './release/linux/rose-st-admin-linux-x64/opt/' + FILE_NAME + '/icon.png', callback);
		},

		readDebianControl: function(data, callback) {
			var path = './resources/linux/DEBIAN/control';
			utils.logger.start('Parsing DEB control', path);
			// Preparing debian control file
			fs.readFile(path, 'utf-8', function(error, data) {
				if (error) {
					utils.handleErrors(error)
					return callback ? callback(error) : error;
				}
				utils.logger.end('Parsed DEB control');
				return callback ? callback(null, data) : data;
			});
		},

		writeDebianControl: function(data, callback) {
			var releasePath = './release/linux/rose-st-admin-linux-x64';
			var path = releasePath + '/DEBIAN/control';
			utils.readSizeRecursive(releasePath, function(error, result) {
				utils.logger.start('Writing DEB control', path);

				data = utils.replace(data, {
					name: constants.packageJson.name,
					description: constants.packageJson.description,
					version: constants.packageJson.version,
					author: constants.packageJson.author,
					size: result
				});

				fs.ensureFile(path, function(error) {
					if (error) {
						utils.handleErrors(error);
						return callback ? callback(error) : error;
					}
					fs.writeFile(path, data, function(error, data) {
						if (error) {
							utils.handleErrors(error);
							return callback ? callback(error) : error;
						}
						utils.logger.end('Wrote DEB control');
						return callback ? callback(null, data) : data;
					});
				})
			});
		},

		packageDebFile: function(data, callback) {
			var path = DEB_PATH.replace(/\s/g, '\\ ') + ' ' + DEB_PATH.replace(/\s/g, '\\ ');
			utils.logger.start('Creating DEB package', path);

			var buildCmd = 'fakeroot dpkg-deb -Zxz --build ' + path;

			// Build the package...
			exec(buildCmd, function(error, stdout, stderr) {
				if (error || stderr) {
					console.error('ERROR while building DEB package:');
					console.error(error);
					console.error(stderr);
					utils.handleErrors(error)
					return callback ? callback(error) : null;
				} else {
					utils.logger.end('DEB package ready!');
					return callback ? callback(null, data) : data;
				}
			});
		}
	};

	return function() {
		async.waterfall([tasks.copyIcon, tasks.configureDesktop, tasks.writeDesktopFile, tasks.readDebianControl, tasks.writeDebianControl, tasks.packageDebFile])
	};
}
