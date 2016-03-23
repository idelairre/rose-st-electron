var async = require('async');
var exec = require('child_process').exec;
var fs = require('fs-extra');
var utils = require('../utils');
var constants = require('../constants');
var packageJson = constants.packageJson;
var token = require('./token.json').token;

var RELEASE_DIR = constants.releaseDir;
var SETUP_FILE = 'RoseStAdminSetup.exe';
var WIN_DIR = RELEASE_DIR + '/win32/';

var tasks = {
	electronRelease: function(callback) {
		var file = RELEASE_DIR + '/win32/' + SETUP_FILE;
    utils.logger.start('Running electron-release');
		var cmd = 'electron-release --app=' + file + ' --token=' + token + ' --repo=' + packageJson.repository;
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

	clearReleaseFolder(callback) {
		var dirPath = WIN_DIR;
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
		async.waterfall([tasks.electronRelease, tasks.clearReleaseFolder]);
	}
}
