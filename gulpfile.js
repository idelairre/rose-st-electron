var _ = require('lodash');
var gulp = require('gulp');
var gulpsync = require('gulp-sync')(gulp);
var fs = require('fs');
var $ = require('gulp-load-plugins')(); // loads other gulp plugins
var babelify = require('babelify');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var merge = require('merge2');
var source = require('vinyl-source-stream');
var stringify = require('stringify');
var del = require('del');
var electron = require('electron-connect').server.create();
var packageJson = require('./package.json');
var packager = require('electron-packager');
var path = require('path');
var watchify = require('watchify');

var BUILDDIR = 'build';
var RELEASEDIR = 'release'; // directory for application packages
var ELECTRON_VERSION = '0.36.10';
var BABEL_PRESET = {
	presets: ['es2015', 'stage-0'],
	plugins: ['transform-function-bind', 'transform-class-properties', 'transform-decorators-legacy']
};

var bundler = {
  w: null,
  init: function() {
    this.w = watchify(browserify({
      entries: ['./app/scripts/app.js'],
      extensions: ['.js'],
      debug: true
    })
    .transform(stringify({
      extensions: ['.html']
    }))
    .transform(babelify.configure(BABEL_PRESET)))
  },
  bundle: function() {
    return this.w && this.w.bundle()
      .on('start', logger.start)
      .on('error', handleErrors)
      .pipe(source('app.js'))
      .pipe(gulp.dest(BUILDDIR + '/scripts/'))
  },
  watch: function() {
    this.w && this.w.on('update', this.bundle.bind(this));
  },
  stop: function() {
    this.w && this.w.close();
  }
};

gulp.task('bundle:dependencies', function() {
	var streams = [],
		dependencies = [];
	var defaultModules = ['assert', 'buffer', 'console', 'constants', 'crypto', 'domain', 'events', 'http', 'https', 'os', 'path', 'punycode', 'querystring', 'stream', 'string_decoder', 'timers', 'tty', 'url', 'util', 'vm', 'zlib'],
		electronModules = ['app', 'auto-updater', 'browser-window', 'content-tracing', 'dialog', 'global-shortcut', 'ipc', 'menu', 'menu-item', 'power-monitor', 'protocol', 'tray', 'remote', 'web-frame', 'clipboard', 'crash-reporter', 'native-image', 'screen', 'shell'];

	// Because Electron's node integration, bundle files don't need to include browser-specific shim.
	var excludeModules = defaultModules.concat(electronModules);

	for (var name in packageJson.dependencies) {
		dependencies.push(name);
	}

	// create a list of dependencies' main files
	var modules = dependencies.map(function(dep) {
			var packageJson = require(dep + '/package.json');
			var main;
			if (!packageJson.main) {
				main = ['index.js'];
			} else if (Array.isArray(packageJson.main)) {
				main = packageJson.main;
			} else {
				main = [packageJson.main];
			}
			return {
				name: dep,
				main: main
			};
		});

  // add babel/polyfill module
  modules.push({
  	name: 'babel-polyfill',
  	main: ['dist/polyfill.js']
  });

  // create bundle file and minify for each main files
  modules.forEach(function(it) {
  	it.main.forEach(function(entry) {
  		var b = browserify('node_modules/' + it.name + '/' + entry, {
  			detectGlobal: false,
  			standalone: it.name
  		})
  		excludeModules.forEach(function(moduleName) {
  			b.exclude(moduleName)
  		});
  		streams.push(b.bundle()
        .pipe($.plumber())
  			.pipe(source(entry))
  			.pipe(buffer())
  			.pipe($.uglify())
  			.pipe(gulp.dest(BUILDDIR + '/node_modules/' + it.name))
  		);
  	});
  	streams.push(
  		// copy modules' package.json
  		gulp.src('node_modules/' + it.name + '/package.json')
  		.pipe($.plumber())
  		.on('error', handleErrors)
  		.pipe(gulp.dest(BUILDDIR + '/node_modules/' + it.name))
  	);
  });

  return merge(streams);
});

// Write a package.json for distribution
gulp.task('packageJson', ['bundle:dependencies'], function(done) {
	var json = _.cloneDeep(packageJson);
	json.main = 'app.js';
	fs.writeFile(BUILDDIR + '/package.json', JSON.stringify(json), function(err) {
		done();
	});
});

// Package for each platforms
gulp.task('package', ['win32', 'linux'].map(function(platform) {
	var taskName = 'package:' + platform;
	gulp.task(taskName, ['build:production'], function(done) {
		packager({
			dir: BUILDDIR,
			name: packageJson.name,
			arch: 'x64',
			platform: platform,
			out: RELEASEDIR + '/' + platform,
			version: ELECTRON_VERSION
		}, function(err) {
			done();
		});
	});
	return taskName;
}));

gulp.task('tinymce', function() {
	return gulp.src('node_modules/tinymce/**/*.*')
		.pipe(gulp.dest(BUILDDIR + '/assets'))
		.pipe($.size())
});

gulp.task('serve', function() {
	electron.start();
	gulp.watch(['app/scripts/**/*.html', 'app/**/*.js'], ['scripts', electron.restart]);
	gulp.watch(['app/index.js', 'app/events.js', 'app/menu.js', 'app/index.html'], electron.reload);
});

gulp.task('styles', function() {
	return gulp.src(['app/**/*.css', 'node_modules/angular-chart.js/dist/angular-chart.css', '!app/assets/**/*.css'])
		.on('error', handleErrors)
		.pipe($.autoprefixer('last 1 version'))
		.pipe($.concat('styles.css'))
		.pipe(gulp.dest(BUILDDIR + '/styles'))
		.pipe($.size());
});

gulp.task('scripts', function() {
	bundler.init();
	return bundler.bundle();
});

gulp.task('html', function() {
	return gulp.src('app/index.html')
		.pipe(gulp.dest(BUILDDIR))
		.pipe($.size());
});

gulp.task('clean', function() {
	return del.sync([BUILDDIR, RELEASEDIR]);
});

gulp.task('extras', function() {
	return gulp.src(['app/*.txt', 'app/*.ico', 'app/**/*.svg'])
		.pipe(gulp.dest(BUILDDIR))
		.pipe($.size());
});

gulp.task('electron', function() {
	return gulp.src(['app/events.js', 'app/menu.js', 'app/index.js'])
		.pipe(gulp.dest(BUILDDIR))
		.pipe($.size());
});

gulp.task('minify:js', function() {
	return gulp.src(BUILDDIR + '/scripts/**/*.js')
		.pipe($.uglify({
			mangle: false
		}))
		.pipe(gulp.dest(BUILDDIR))
		.pipe($.size());
});

gulp.task('minify:css', function() {
	return gulp.src('dist/styles/**/*.css')
		.pipe($.uncss({
			html: ['app/**/*.html', 'app/index.html']
		}))
		.pipe($.cssnano())
		.pipe(gulp.dest(BUILDDIR + '/styles'))
		.pipe($.size());
});

gulp.task('set-production', function() {
	process.env.NODE_ENV = 'production';
});

var logger = (function() {
	return {
		start: function(filepath) {
			console.log(arguments);
			startTime = process.hrtime();
			$.util.log('Bundling', $.util.colors.green(filepath) + '...');
		},

		watch: function(bundleName) {
			$.util.log('Watching files required by', $.util.colors.yellow(bundleName));
		},

		end: function(filepath) {
			var taskTime = process.hrtime(startTime);
			var prettyTime = prettyHrtime(taskTime);
			$.util.log('Bundled', $.util.colors.green(filepath), 'in', $.util.colors.magenta(prettyTime));
		}
	}
})();

var handleErrors = function() {
	var args = Array.prototype.slice.call(arguments);

	$.notify.logLevel(2);

	// Send error to notification center with gulp-notify
	$.notify.onError({
		title: 'Compile Error',
		message: '<%= error %>'
	}).apply(this, args);

	// Keep gulp from hanging on this task
	this.emit('end');
};

gulp.task('stop', bundler.stop.bind(bundler));

gulp.task('minify', ['minify:js']);

gulp.task('assets', ['styles', 'tinymce', 'electron']);

gulp.task('bundle', ['html', 'assets', 'styles', 'scripts', 'extras']);

gulp.task('build:production', gulpsync.sync(['clean', 'html', 'set-production', 'bundle', 'minify', 'packageJson', 'stop']));

gulp.task('serve:production', gulpsync.sync(['build:production', 'serve']));

gulp.task('default', ['build']);

gulp.task('watch', gulpsync.async(['clean', 'html', ['bundle', 'serve']])),
	function() {
		bundler.watch();
		gulp.watch('app/**/*.js', ['scripts']);
	};
