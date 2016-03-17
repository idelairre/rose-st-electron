'use strict';

var cloneDeep = require('lodash').cloneDeep;
var merge = require('merge2');
var exec = require('child_process').exec;
var fs = require('fs');
var packager = require('electron-packager');

var constants = require('./constants');

var BUILD_DIR = constants.buildDir;
var BABEL_PRESET = constants.babelPreset;
var ELECTRON_VERSION = constants.electronVersion;
var RELEASE_DIR = constants.releaseDir;
var APP_NAME = constants.packageJson.name;

module.exports = function(gulp, $) {
	return {
		buildElectron: function() {
			var streams = [];
			var entries = ['app/events.js', 'app/menu.js', 'app/index.js'];
			for (var i = 0; entries.length > i; i++) {
				streams.push(
					gulp.src(entries[i])
					.pipe($.babel(BABEL_PRESET))
					.pipe(gulp.dest(BUILD_DIR))
					.pipe($.size())
				);
			}
			return merge(streams);
		},
		buildRuntime: function() {
			var streams = [];
			['node_modules/electron-prebuilt', 'node_modules/electron-debug'].map(function(entry) {
				streams.push(
					gulp.src(entry + '/**/*')
					.pipe(gulp.dest(BUILD_DIR + '/' + entry))
					.pipe($.size())
				);
			});
			return merge(streams);
		},
		install: function(done) {
			exec('cd build && npm install', function(error, out, code) {
				if (error !== null) {
					console.log(error);
				}
        done();
			});
		},
		// Write a package.json for distribution
		packageJson: function() {
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
					console.error(error);
				}
			});
		},
		packageDist: function() {
			['win32', 'linux'].map(function(platform) {
				console.log('called', 'build:package');
				var taskName = 'package:' + platform;
				packager({
					asar: false,
					dir: BUILD_DIR,
					name: APP_NAME,
					arch: 'x64',
					platform: platform,
					out: RELEASE_DIR + '/' + platform,
					overwrite: true,
					version: ELECTRON_VERSION
				}, function done(error) {
					if (error) {
						console.log(error);
					}
				});
			});
		}
	}
}
