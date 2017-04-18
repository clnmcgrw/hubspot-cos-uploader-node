require('dotenv').config();

var gulp = require('gulp'),
		sass = require('gulp-sass'),
		chalk = require('chalk'),
		argv = require('yargs').argv;

		
var uploader = require('./index.js')({
			hapikey: process.env.HS_HAPIKEY,
			portalId: process.env.HS_PORTALID
		});



gulp.task('uploader-sync', [], function() {
	return uploader.sync();
});
gulp.task('uploader-start', function() {
	return uploader.start();
});


//Pulls Remote Hubspot Template By ID -------------------------//
gulp.task('pull', function() {
	if (argv.id) {
		uploader.pull(argv.id);
	} else {
		console.log(chalk.red('No ID parameter was provided...Did you run gulp pull --id=XXXXXXX ?'));
	}
});



gulp.task('default', ['uploader-sync', 'uploader-start'], function() {

});