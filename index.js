
var fs = require('fs'),
		request = require('request'),
		chalk = require('chalk'),
		argv = require('yargs').argv,
		Gaze = require('gaze').Gaze;


module.exports = function(options) {

	//TODO* user proper console methods (warn, error) when appropriate
	var logger = function(chalk, msg) {
		var date = new Date(), 
				hours = date.getHours() > 12 ? date.getHours()-12 : date.getHours(),
				minutes = date.getMinutes().toString().length < 2 ? '0'+date.getMinutes() : ''+date.getMinutes(),
				seconds = date.getSeconds().toString().length < 2 ? '0'+date.getSeconds() : ''+date.getSeconds();
		hours = hours.toString().length < 2 ? '0'+hours : ''+hours;
		console.log(chalk('[COS-UPLOADER] @:'+hours+':'+minutes+':'+seconds+' - '+msg));
	},

	//required options
	options = options || {},
	HAPIKEY = options.hapikey || false,
	PORTALID = options.portalId || false;


	if (!HAPIKEY || !PORTALID) {
		logger(chalk.red, 'Check that you have provided the "hapikey" and "portalID" options.');
	}


	//optional options

	//*TODO - allow a single option for options.root 
	// string or array of dirs (like gulp.src)
	var FILEROOT = options.root || __dirname;

	console.log(__dirname);

	//old way -- don't need separate dirs, allow passing 
	var TEMPLATEROOT = options.templateRoot || __dirname+'/src/templates',
			ASSETROOT = options.assetRoot || __dirname+'/src/assets',
			TEMPLATEDIR = options.templateDir || __dirname+'/src/templates/*.html',
			ASSETDIR = options.assetDir || __dirname+'/src/assets/*.{css,js}',
			DATAFILE = options.dataFile || __dirname+'/src/data.json';


	//public api props
	this.watcher = null; //expose gaze methods
	this.fileData = {}; //complete template/asset list


	//private props/utils
	var metaDataRegex = /\[hubspot-metadata]([\w\W]*?)\[end-hubspot-metadata\]/,


	getFilenameFromPath = function(path) {
		var pathArr = path.split('/');
		return pathArr[pathArr.length-1];
	},

	fileNamesMatch = function(localpath, remotepath) {
		return getFilenameFromPath(localpath) === getFilenameFromPath(remotepath); 
	},

	getEndpoint = function(id) {
		return {
			update: 'https://api.hubapi.com/content/api/v2/templates/'+id+'?hapikey='+HAPIKEY,
			create: 'https://api.hubapi.com/content/api/v2/templates?hapikey='+HAPIKEY
		} 
	},

	//use these to get the 'category_id' & 'template_type' paramaters needed to create a template through the api
	getNumericTemplateCat = function(type) {
		if (type === 'asset') return 0;
		if (type === 'email') return 2;
		if (type === 'page' || type === 'partial')  return 1;
		if (type === 'blog')	return 3;
		if (type === '404') return 0;
	},

	getNumericTemplateType = function(type) {
		if (type === 'email') return 2;
		if (type === 'page' || type === 'partial' || type === 'asset')  return 4;
		if (type === 'blog')  return 6;
		if (type === '404') return 11;
	},

	//read hubspot metadata from a template
	readHubspotMetadata = function(html) {
		var metaString = metaDataRegex.exec(html), metaJson;
		try {metaJson = JSON.parse(metaString[1]);} catch (e) {metaJson = false;}
		return metaJson;
	},

	//get single template
	getTemplateById = function(id, callback) {
		var reqOpts = {url: getEndpoint(id).update, method: 'GET', json: true};
		request(reqOpts, callback);
	},

	//create new template from local path
	createNewTemplate = function(localPath) {
		var html = fs.readFileSync(localPath).toString(),
				filemeta = readHubspotMetadata(html);
		if (!filemeta) {
			logger(chalk.red, 'Check that your [hubspot-metadata] JSON for '+getFilenameFromPath(localPath)+' is formatted correctly.');
			return;
		}
		if (!fileNamesMatch(localPath, filemeta.path)) {
			logger(chalk.red, 'The name of your local file should match the "path" filename in your metadata.');
			return;
		}

		var reqOptsBody = {};
		reqOptsBody.category_id = getNumericTemplateCat(filemeta.type);
		reqOptsBody.template_type = getNumericTemplateType(filemeta.type);
		reqOptsBody.path = filemeta.path;
		reqOptsBody.source = html;
		reqOptsBody.is_available_for_new_content = filemeta.type === 'partial' || filemeta.type === 'asset' ? false : true;

		var reqOpts = {
			url: getEndpoint().create,
			method: 'POST',
			json: true,
			body: reqOptsBody
		};
		request(reqOpts, function(error, res, body) {
			if (error !== null) {
				logger(chalk.red, 'Server error - http status code '+res.statusCode);
				return;
			}
			if (body.status === 'error') {
				logger(chalk.red, 'API response error - '+getFilenameFromPath(localPath)+' - '+body.message);
				if (Array.isArray(body.errors)) {
					body.errors.forEach(function(item) {
						console.log('- '+chalk.red(item.message));
					});
				}
				return;
			}
			filemeta.id = body.id;
			var newHtml = html.replace(metaDataRegex, '[hubspot-metadata] '+JSON.stringify(filemeta)+' [end-hubspot-metadata]');
			fs.writeFileSync(localPath, newHtml);
			logger(chalk.green, 'Template '+getFilenameFromPath(localPath)+' created successfully.');
		});
	},


	//update remote template
	updateRemoteTemplate = function(localPath) {
		var html = fs.readFileSync(localPath).toString(),
				filemeta = readHubspotMetadata(html);
		if (!filemeta) {
			logger(chalk.red, 'Check that your [hubspot-metadata] JSON for '+getFilenameFromPath(localPath)+' is formatted correctly.');
			return;
		} 
		if (!fileNamesMatch(localPath, filemeta.path)) {
			logger(chalk.red, 'The name of your local file should match the "path" filename in your metadata.');
			return;
		}
		if (!filemeta.id) {
			//this catches instances when meta data wasn't present on file added event
			logger(chalk.yellow, 'File '+getFilenameFromPath(localPath)+' has no ID in its metadata - creating as new template.');
			createNewTemplate(localPath);
			return;
		}

		var reqOpts = {
			url: getEndpoint(filemeta.id).update,
			method: 'PUT',
			json: true,
			body: {source: html}
		};
		request(reqOpts, function(error, res, body) {
			if (error !== null || res.statusCode !== 200) {
				logger(chalk.red, 'Server error - http status code '+res.statusCode);
				return;
			}
			if (body.status === 'error') {
				logger(chalk.red, 'API response error - '+getFilenameFromPath(localPath)+' - '+body.message);
				if (Array.isArray(body.errors)) {
					body.errors.forEach(function(item) {
						console.log('- '+chalk.red(item.message));
					});
				}
				return;
			}
			logger(chalk.green, 'Remote template '+getFilenameFromPath(localPath)+' has successfully updated.');
		});
	},


	//sync local and remote templates
	doSyncNewer = function() {
		var templateFiles = fs.readdirSync(TEMPLATEROOT),
				assetFiles = fs.readdirSync(ASSETROOT),
				allFiles = templateFiles.concat(assetFiles);

		allFiles.forEach(function(item, index) {
			var fullPath = item.endsWith('html') ? TEMPLATEROOT+'/'+item : ASSETROOT+'/'+item,
					file = fs.readFileSync(fullPath).toString(),
					filemeta = readHubspotMetadata(file),
					stats = fs.statSync(fullPath),
					lastModLocal = Date.parse(stats.mtime);

			if (!filemeta) {
				logger(chalk.red, 'Check that the [hubspot-metadata] JSON is formatted correctly for '+item);
				return;
			} else if (!filemeta.id) {
				logger(chalk.red, 'The [hubspot-metadata] JSON for '+item+' is missing an id');
				return;
			}

			getTemplateById(filemeta.id, function(error, res, body) {
				//compare epochs, pull & replace if remote is newer, 
				//need to check diff with offset because of time for API request
				if (body.updated-lastModLocal > 9000) {
					fs.writeFileSync(fullPath, body.source);
					logger(chalk.green, 'Newer remote Hubspot templates have been pulled to your local project.');
				}
			});
		});
	},


	//pull a remote template (not yet in local project) created by someone else
	doRemotePull = function(templateId) {
		getTemplateById(templateId, function(error, res, body) {
			if (error !== null || res.statusCode !== 200) {
				logger(chalk.red, 'Error during API request - http status code '+res.statusCode);
				return;
			}
			var metadata = readHubspotMetadata(body.source);
			if (!metadata) {
				logger(chalk.red, 'Remote template with id '+templateId+' does not contain JSON metadata');
				return;
			}
					
			var pathArr = metadata.path.split('/'),
					fileToWrite = TEMPLATEROOT+'/'+pathArr[pathArr.length-1];
			fs.writeFileSync(fileToWrite, body.source);
			logger(chalk.green, 'Sucessfully pulled file id '+metadata.id+' & saved in '+fileToWrite);
		});
	},


	//sets up file watching w/ gaze
	startWatcher = function() {
		this.watcher = new Gaze([TEMPLATEDIR, ASSETDIR]);
		this.watcher.on('error', function(error) {
			logger(chalk.red, 'File watcher error: '+error);
		});
		this.watcher.on('changed', updateRemoteTemplate);
		this.watcher.on('added', createNewTemplate);
	};


	return {
		pull: doRemotePull,
		sync: doSyncNewer,
		start: startWatcher
	};
};