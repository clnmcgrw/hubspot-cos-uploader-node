// Demo Integration w/ Gulp
//-------------------------------------------------------------------------

//store your hapikey somewhere that is .gitignore'd
require('dotenv').config();

//deps
var gulp = require('gulp'),
		gutil = require('gulp-util'),
		chalk = require('chalk'),
		sass = require('gulp-sass'),
		webpack = require('webpack'),
		argv = require('yargs').argv;


//require 'hubspot-cos-uploader' if using as npm lib
var uploader = require('./index.js')({
	hapikey: process.env.HS_HAPIKEY,
	files: 'demo/assets',
	templates: 'demo/templates'
});


//start the cos-uploader after syncing remote changes
gulp.task('cos-uploader', function() {
	uploader.sync().then(() => { 
		uploader.start();
		console.log(uploader);
	}).catch(err => console.log(err));
});


//Task To Pull Remote Hubspot Template By ID 
//example use:  gulp pull --id=XXXXXXXXXX --path=path/to/my/folder
//path is optional, will fall back to first path in options.root
gulp.task('pull', function() {
	if (argv.id) {
		var path = argv.path ? argv.path : false;
		uploader.pull(argv.id, path);
	} else {
		console.log(chalk.red('No ID parameter was provided...Did you run gulp pull --id=XXXXXXX ?'));
	}
});


//Sass task to show uploader acting on built files
//comments must be preserved
gulp.task('scss', function() {
	gulp.src('demo/_scss/*.scss')
		.pipe(sass().on('error', sass.logError))
		.pipe(gulp.dest('demo/assets'))
});


//Webpack your javascript also
gulp.task('js', function() {
	var webpackCompiler = webpack(require('./webpack.config.js'));
	webpackCompiler.watch({}, (err, stats) => {
		if (err) { throw new gutil.PluginError('webpack', err); }
    gutil.log('[webpack]', stats.toString({chunks: false}));
	});
});


//default gulp task - the cos-uploader handles file watching
gulp.task('default', ['cos-uploader', 'scss', 'js'], function() {
	gulp.watch('demo/_scss/*.scss', ['scss']);
});