'use strict';

var async = require('async');
var appdmg = require('appdmg');
var utils = require('../utils');
var exec = require('child_process').exec;

var APP_NAME = constants.appName;
var BUILD_DIR = constants.buildDir;
var RELEASE_DIR = constants.releaseDir;
var TEMP_DIR = constants.tempDir;
var DARWIN_DIR = RELEASE_DIR + '/darwin/';
var APP_DIR = RELEASE_DIR + '/darwin/' + APP_NAME + '-darwin-x64'

projectDir = jetpack;
tmpDir = projectDir.dir('./tmp', {
	empty: true
});
releasesDir = projectDir.dir('./releases');
finalAppDir = tmpDir.cwd(packageJson.productName + '.app');

var finalize = function() {
	// Prepare main Info.plist
	var info = projectDir.read('resources/osx/Info.plist');
	info = utils.replace(info, {
		productName: packageJson.productName,
		identifier: packageJson.identifier,
		version: packageJson.version,
		copyright: packageJson.copyright
	});
	finalAppDir.write('Contents/Info.plist', info);

	// Prepare Info.plist of Helper apps
	[' EH', ' NP', ''].forEach(function(helper_suffix) {
		info = projectDir.read('resources/osx/helper_apps/Info' + helper_suffix + '.plist');
		info = utils.replace(info, {
			productName: packageJson.productName,
			identifier: packageJson.identifier
		});
		finalAppDir.write('Contents/Frameworks/Electron Helper' + helper_suffix + '.app/Contents/Info.plist', info);
	});

	// Copy icon
	projectDir.copy('resources/osx/icon.icns', finalAppDir.path('Contents/Resources/icon.icns'));

};

var signApp = function() {
	var identity = utils.getSigningId();
	if (identity) {
		var cmd = 'codesign --deep --force --sign "' + identity + '" "' + finalAppDir.path() + '"';
		utils.logger.start('Signing with: ' + cmd);
		child_process.exec, cmd);
} else {}
};

var packToDmgFile = function() {
	var dmgName = packageJson.name + '_' + packageJson.version + '.dmg';

	// Prepare appdmg config
	var dmgManifest = require('resources/osx/appdmg.json');

	dmgManifest = utils.replace(dmgManifest, {
		productName: packageJson.productName,
		appPath: finalAppDir.path(),
		dmgIcon: projectDir.path('resources/osx/dmg-icon.icns'),
		dmgBackground: projectDir.path('resources/osx/dmg-background.png')
	});

	utils.writeFile('appdmg.json', dmgManifest);

	utils.logger.start('Packaging to DMG file...');

	var readyDmgPath = releasesDir.path(dmgName);

	appdmg({
			source: tmpDir.path('appdmg.json'),
			target: readyDmgPath
		})
		.on('error', function(error) {
			utils.handleErrors(error);
		})
		.on('finish', function() {
			utils.logger.end('DMG file ready!' + readyDmgPath);
		});
};
module.exports = function() {

};
