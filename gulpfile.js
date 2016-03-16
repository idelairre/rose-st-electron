var gulp = require('gulp');
var gulpsync = require('gulp-sync')(gulp);
var babelify = require('babelify');
var browserify = require('browserify');
var watchify = require('watchify');
var stringify = require('stringify');
var $ = require('gulp-load-plugins')(); // loads other gulp plugins
var buffer = require('vinyl-buffer');
var packageJson = require('./package.json');

var BUILDDIR = 'build';
var RELEASEDIR = 'release'; // directory for application packages
var RESOURCEDIR = 'resources';
var ELECTRON_VERSION = packageJson.devDependencies['electron-prebuilt'];
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
		var source = require('vinyl-source-stream');
    return this.w && this.w.bundle()
      .on('start', logger.start)
      .on('error', handleErrors)
      .pipe(source('app.js'))
      .pipe(gulp.dest(BUILDDIR + '/scripts'))
  },
  watch: function() {
    this.w && this.w.on('update', this.bundle.bind(this));
  },
  stop: function() {
    this.w && this.w.close();
  }
};


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

gulp.task('set-production', function() {
	process.env.NODE_ENV = 'production';
});

gulp.task('build:electron', function() {
	var merge = require('merge2');
	var streams = [];
	var entries = ['app/events.js', 'app/menu.js', 'app/index.js'];
	for (var i = 0; entries.length > i; i++) {
		streams.push(
			gulp.src(entries[i])
			.pipe($.babel(BABEL_PRESET))
			.pipe(gulp.dest(BUILDDIR))
			.pipe($.size())
		);
	}
	return merge(streams);
});

gulp.task('build:runtime', function () {
	var merge = require('merge2');
	var streams = [];
	['node_modules/electron-prebuilt', 'node_modules/electron-debug'].map(function(entry) {
			streams.push(
				gulp.src(entry + '/**/*')
				.pipe(gulp.dest(BUILDDIR + '/' + entry))
				.pipe($.size())
			);
		});
	return merge(streams);
});

gulp.task('build:install', function (done) {
	var exec = require('child_process').exec;
	exec('cd build && npm install', function (error) {
		if (error !== null) {
			console.log(error);
			done();
		}
		process.exit(0);
	});
});

// Write a package.json for distribution
gulp.task('build:packageJson', function(done) {
	var fs = require('fs');
	var cloneDeep = require('lodash').cloneDeep;
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
	var json = cloneDeep(packageJson);
	json.dependencies["babel-polyfill"] = "^6.3.14";

	if (!fs.existsSync(BUILDDIR)) {
    fs.mkdirSync(BUILDDIR);
	}
	fs.writeFile(BUILDDIR + '/package.json', JSON.stringify(json, replacer, 3), function (error) {
		if (error) {
			done();
		}
	});
});

// Package for each platforms
gulp.task('build:package', ['win32', 'linux'].map(function(platform) {
	var packager = require('electron-packager');
	var taskName = 'package:' + platform;
	gulp.task(taskName, function(done) {
		packager({
			asar: true,
			dir: BUILDDIR,
			name: packageJson.name,
			arch: 'x64',
			platform: platform,
			out: RELEASEDIR + '/' + platform,
			overwrite: true,
			version: ELECTRON_VERSION
		}, function done(error) {
			if (error) {
				done(error);
			}
		});
	});
	return taskName;
}));

gulp.task('build:executable', ['build:runtime', 'build:packageJson', 'build:install', 'build:electron']);

gulp.task('tinymce', function() {
	return gulp.src('app/assets/**/*.*')
		.pipe(gulp.dest(BUILDDIR + '/assets'))
		.pipe($.size())
});

gulp.task('serve', function() {
	var electron = require('electron-connect').server.create();
	electron.start();
	gulp.watch(['app/scripts/**/*.css'], ['styles', electron.restart]);
	gulp.watch(['app/scripts/**/*.html', 'app/**/*.js' ], ['scripts', electron.restart]);
	gulp.watch(['app/index.js', 'app/events.js', 'app/menu.js', 'app/index.html'], ['build:electron', electron.reload]);
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
	var del = require('del');
	return del.sync([BUILDDIR, RELEASEDIR]);
});

gulp.task('extras', function() {
	return gulp.src(['app/*.txt', 'app/*.ico', 'app/**/*.svg', 'app/**/*.json'])
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

gulp.task('stop', bundler.stop.bind(bundler));

gulp.task('minify', ['minify:js']);

gulp.task('assets', ['styles', 'extras', 'tinymce']);

gulp.task('bundle', ['html', 'assets', 'styles', 'scripts', 'stop']);

gulp.task('build:production', gulpsync.sync(['clean', 'set-production', 'bundle', 'build:executable']));

gulp.task('serve:production', gulpsync.sync(['build:production', 'serve']));

gulp.task('default', ['build']);

gulp.task('watch', gulpsync.async(['clean', 'html', 'build:packageJson', 'build:electron', ['bundle', 'serve']])),
	function() {
		bundler.watch();
	};
