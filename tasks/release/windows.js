'use strict';

var async = require('async');
var exec = require('child_process').exec;
var fs = require('fs-extra');
var utils = require('../utils');
var constants = require('../constants');
var packageJson = constants.packageJson;
var rcedit = require('rcedit');
var squirrelBuilder = require('electron-installer-squirrel-windows');
var path = require('path');
var inflected = require('inflected');
var token = require('./token.json').token;

var APP_NAME = constants.appName;
var BUILD_DIR = constants.buildDir;
var RELEASE_DIR = constants.releaseDir;
var RESOURCE_DIR = constants.resourceDir;
var TEMP_DIR = constants.tempDir;
var SETUP_FILE = 'RoseStAdminSetup.exe';
var WIN_DIR = RELEASE_DIR + '/win32/';
var APP_DIR = RELEASE_DIR + '/win32/' + APP_NAME + '-win32-x64'

var tasks = {
	copyCom: function(callback) {
		var source = RESOURCE_DIR + '/windows/' + APP_NAME + '.com';
		var target = RELEASE_DIR + '/win32/' + APP_NAME + '-win32-x64/' + APP_NAME + '.com';
		fs.readFile(source, function(error, data) {
			if (error) {
				utils.handleErrors(error);
				callback ? callback(error, null) : null;
				return
			} else {
				utils.writeFile(target, data);
				return callback ? callback(null) : null;
			}
		});
	},

	setExeProperties: function(callback) {
		utils.logger.start('Writing .exe properties');
		var path = APP_DIR + '/' + APP_NAME + '.exe';
		rcedit(path, {
			'icon': path.resolve(process.cwd(), 'resources/windows', 'setup-icon.ico'),
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
			description: packageJson.description,
			path: path.resolve(process.cwd(), APP_DIR),
			product_name: packageJson.productName,
			loading_gif: path.resolve(process.cwd(), 'resources', 'install-spinner.gif'),
			electron_version: constants.electronVersion,
			authors: packageJson.author,
			version: packageJson.version,
			out: path.resolve(process.cwd(), WIN_DIR),
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

	clearReleaseFolder: function(callback) {
		var path = APP_DIR;
		utils.logger.start('Clearing release folder', path);
		fs.remove(path, function(error) {
			if (error) {
				utils.handleErrors(error);
				callback ? callback(error, null) : error;
				return;
			} else {
				utils.logger.end('Finished clearing release folder');
				return callback(null);
			}
		});
	},

	readDir: function(callback) {
		var path = RELEASE_DIR + '/win32/';
		utils.logger.start('Reading electron release directory', path);
		fs.readdir(path, function (error, data) {
			if (error) {
				utils.handleErrors(error);
				callback ? callback(error, null) : error;
				return;
			} else {
				utils.logger.end('Finished reading electron release directory');
				return callback(null, data);
			}
		});
	},

	electronRelease: function(files, callback) {
		var path = RELEASE_DIR + '/win32/';
		files = files.map(function (file) {
			file = path + file;
			return file;
		});
		utils.logger.start('Running electron-release');
		var cmd = 'electron-release --app=' + files + ' --token=' + token + ' --repo=' + packageJson.repository;
		console.log(cmd);
		exec(cmd, function(error, stdout, stderr) {
			console.log(stdout);
			if (error || stderr) {
				console.error(error);
				console.error(stderr);
				utils.handleErrors(error);
				callback ? callback(error, null) : null;
				return;
			} else {
				utils.logger.end('Finished electron-release');
				return callback ? callback(null) : null;
			}
		});
	},

	clearWindowsFolder(callback) {
		var dirPath = WIN_DIR;
		utils.logger.start('Clearing release folder', dirPath);
		fs.remove(dirPath, function(error) {
			if (error) {
				utils.handleErrors(error);
				callback ? callback(error, null) : error;
				return;
			} else {
				utils.logger.end('Finished clearing release folder');
				return callback ? callback(null) : null
			}
		});
	}
}

module.exports = function() {
	return function(callback) {
		async.waterfall([tasks.copyCom, tasks.packageInstaller, tasks.clearReleaseFolder, tasks.readDir, tasks.electronRelease], function(error, result) {
			if (error) {
				console.error(error.toString());
				utils.handleErrors(error);
				callback ? callback(error, null) : null;
				return;
			} else {
				utils.logger.end('Finished packaging for windows');
				return callback ? callback() : null;
			}
		});
	}
}
