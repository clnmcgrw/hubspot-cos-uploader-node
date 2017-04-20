

//store your hapikey somewhere that is .gitignore'd
require('dotenv').config();

var gulp = require('gulp'),
		chalk = require('chalk'),
		argv = require('yargs').argv;

//require 'hubspot-cos-uploader' if using as npm lib		
var uploader = require('./index.js')({
			hapikey: process.env.HS_HAPIKEY,
			root: ['src/templates', 'src/assets']
		});



gulp.task('cos-uploader', function() {
	return uploader.sync().then(uploader.start);
});


//Task To Pull Remote Hubspot Template By ID -------------------------//
//example use:  gulp pull --id=XXXXXXXXXX --path=path/to/my/folder
//path is optional, will fall back to first path in options.root
gulp.task('pull', function() {
	if (argv.id) {
		uploader.pull(argv.id);
	} else {
		console.log(chalk.red('No ID parameter was provided...Did you run gulp pull --id=XXXXXXX ?'));
	}
});



gulp.task('default', ['cos-uploader'], function() {});