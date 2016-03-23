var async = require('async');
var getSize = require('get-folder-size');
var argv = require('yargs').argv;
var os = require('os');
var fs = require('fs-extra');
var notify = require('gulp-notify');
var util = require('gulp-util');
var prettyHrtime = require('pretty-hrtime');
var path = require('path');

var startTime;

var handleErrors = function() {
	var args = Array.prototype.slice.call(arguments);
	console.log(args);

	notify.logLevel(2);

	// Send error to notification center with gulp-notify
	notify.onError({
		title: 'Compile Error',
		message: '<%= error %>'
	}).apply(this, args);

	// Keep gulp from hanging on this task
	this && this.emit ? this.emit('end') : null;
};

var logger = {
	start: function(event, filepath) {
		startTime = process.hrtime();
		if (filepath) {
			util.log(util.colors.white(event + ':'), util.colors.magenta(filepath));
		} else {
			util.log(util.colors.white(event + '...'));
		}
	},
	end: function(event, filepath) {
		var taskTime = process.hrtime(startTime);
		var prettyTime = prettyHrtime(taskTime);
		util.log(util.colors.green(event), 'after', util.colors.magenta(prettyTime));
	}
};

var readSizeRecursive = function(dir, callback) {
	logger.start('Getting directory size', dir);
	getSize(dir, function(error, size) {
		if (error) {
			handleErrors(error);
			callback ? callback(error) : error;
			return;
		}
		var total = Math.round(size / 1024);
		logger.end('Directory size: ' + total);
	  return callback ? callback(null, total) : total;
	});
}

module.exports.copyDir = function(source, target, callback) {
	logger.start('Copying ' + source + ' to ' + target);
	if (!fs.existsSync(path.parse(target).dir)) {
		fs.mkdirSync(path.parse(target).dir);
	}
	fs.copy(source, target, function(error) {
		console.error(error);
		if (error) {
			handleErrors(error);
			callback ? callback(error, null) : null;
			return;
		} else {
			logger.end('Finished copying ' + source);
			return callback ? callback(null) : null;
		}
	});
};

module.exports.copyFile = function(source, target, callback) {
	logger.start('Copying ' + source + ' to ' + target);
	if (!fs.existsSync(path.parse(target).dir)) {
		fs.mkdirSync(path.parse(target).dir);
	}
	fs.copy(source, target, function(error) {
		if (error) {
			handleErrors(error)
			callback ? callback(error, null) : error;
			return;
		}
		logger.end('Finished copying ' + source);
		return callback ? callback(null) : null;
	});
}

module.exports.writeFile = function(path, data, callback) {
	logger.start('Writing file', path);
	fs.ensureFile(path, function(error) {
		if (error) {
			handleErrors(error);
			callback ? callback(error, null) : error;
			return;
		}
		fs.writeFile(path, data, function(error, data) {
			if (error) {
				handleErrors(error);
				callback ? callback(error, null) : error;
				return;
			}
			logger.end('Finished writing file');
			return callback ? callback(null, data) : data;
		});
	});
}

module.exports.os = function() {
	switch (os.platform()) {
		case 'darwin':
			return 'osx';
		case 'linux':
			return 'linux';
		case 'win32':
			return 'windows';
	}
	return 'unsupported';
};

module.exports.replace = function(str, patterns) {
	Object.keys(patterns).forEach(function(pattern) {
		var matcher = new RegExp('{{' + pattern + '}}', 'g');
		str = str.replace(matcher, patterns[pattern]);
	});
	return str;
};

module.exports.getEnvName = function() {
	return argv.env || 'development';
};

module.exports.getSigningId = function() {
	return argv.sign;
};

// Fixes https://github.com/nodejs/node-v0.x-archive/issues/2318
module.exports.spawnablePath = function(path) {
	if (process.platform === 'win32') {
		return path + '.cmd';
	}
	return path;
};

module.exports.handleErrors = handleErrors;

module.exports.logger = logger;

module.exports.readSizeRecursive = readSizeRecursive;
