
// UTILITIES ----------------------------------------------------//
// the small & lonely bits of functionality that don't really need
// their own file but are used all over the damn place

//- util dependencies
//chalk - styles logger output
const fs = require('fs');
const chalk = require('chalk');


//target folder for file manager assets
const fileManagerFolder = 'cos_uploader_assets';


//make an array of watched files
const fileArrayFromObj = (obj, watchedFiles=[]) => {
  for (var key in obj) { watchedFiles.push(obj[key]); }
  return watchedFiles;
};


// will be either 'templ' or 'files'
const determineFileType = (dirs, localpath) => {
  for (let key in dirs) {
    if (localpath.indexOf(dirs[key]) > -1) { return key; }
  }
};


// regex to capture commented template config
// and read hubspot metadata from an html template
const metaDataRegex = /\[hubspot-metadata]([\w\W]*?)\[end-hubspot-metadata\]/;
const readHubspotMetadata = html => {
  const metaString = metaDataRegex.exec(html);
  let metaJson;
  try {metaJson = JSON.parse(metaString[1].trim());} catch (e) {metaJson = false;}
  return metaJson;
};


//use these to get the 'category_id' & 'template_type' paramaters needed to create a template through the api
//more info: https://developers.hubspot.com/docs/methods/templates/post_templates
const getNumericTemplateCat = type => {
  if (type === 'asset') return 0;
  if (type === 'email') return 2;
  if (type === 'page' || type === 'partial')  return 1;
  if (type === 'blog')  return 3;
  if (type === '404') return 0;
};
const getNumericTemplateType = type => {
  if (type === 'email') return 2;
  if (type === 'page' || type === 'partial' || type === 'asset')  return 4;
  if (type === 'blog')  return 6;
  if (type === '404') return 11;
};


// returns an object of the different endponts for template api
// 'general' prop endpoint is used w/ different http verbs - (PUT=update)
const getEndpoint = (hapikey, templateId='') => {
  return {
    create: 'https://api.hubapi.com/content/api/v2/templates?hapikey='+hapikey,
    general: 'https://api.hubapi.com/content/api/v2/templates/'+templateId+'?hapikey='+hapikey,
    restore: 'https://api.hubapi.com/content/api/v2/templates/'+templateId+'/restore-deleted?hapikey='+hapikey,
    filemanager: 'https://api.hubapi.com/filemanager/api/v2/files?overwrite=true&hapikey='+hapikey
  } 
};


// get file name from a full file path - 
// used to ensure local and remote templates have the same filename
const getFilenameFromPath = path => {
  var pathArr = path.split('/');
  return pathArr[pathArr.length-1];
};
const fileNamesMatch = (local, remote) => getFilenameFromPath(local) === getFilenameFromPath(remote); 


// get list of all watched files before watcher starts 
// necessary for checking & syncing local files w/ the recently updated remote files (pulls down newer file)
const getFullFilePaths = (files, root, result=[]) => {
  files.forEach(file => {
    const fullFile = root.endsWith('/') ? root+file : root+'/'+file;
    result.push(fullFile);
  });
  return result;
};
const getFilelistFromRoot = (root, result=[]) => {
  if (Array.isArray(root)) {
    for (let i=0; i < root.length; i++) {
      const pathFiles = fs.readdirSync(root[i]);
      const fullPathFiles = getFullFilePaths(pathFiles, root);
      result.concat(fullPathFiles);
    }
  } else {
    var pathFiles = fs.readdirSync(root);
    result = getFullFilePaths(pathFiles, root);
  }
  return result;
};


//get readable list of watched files for display in console
const getWatchedFilesList = (watcher) => {
  const files = watcher.getWatched();
  let result = '';
  for (let path in files) {
    const itemsList = files[path].join(', ');
    if (itemsList.indexOf('.css') > -1 || itemsList.indexOf('.js') > -1) {
      result += `ASSETS: ${itemsList} `;
    } else if (itemsList.indexOf('.html') > -1) {
      result += `TEMPLATES: ${itemsList} `;
    }
  }
  return result;
};


// used in request callbacks
// catches any api response or server errors
const requestErrorCheck = (error, body, localpath, res) => {
  let errMsg = false;
  if (error !== null) {
    errMsg = 'Server error - http status code '+res.statusCode;
  }
  if (body.status === 'error') {
    errMsg = `API response error - ${getFilenameFromPath(localpath)} - ${body.message}`;
  }
  return errMsg;
};


//provide console feedback - logger runs on almost any file event
//method option can be 'log', 'error', or 'warn'...which determines output color
const getCurrentTime = () => {
  const date = new Date(),
  minutes = date.getMinutes().toString().length < 2 ? '0'+date.getMinutes() : ''+date.getMinutes(),
  seconds = date.getSeconds().toString().length < 2 ? '0'+date.getSeconds() : ''+date.getSeconds();
  let hours = date.getHours() > 12 ? date.getHours()-12 : date.getHours();
  hours = hours.toString().length < 2 ? '0'+hours : ''+hours;
  return hours+':'+minutes+':'+seconds;
};
const logger = (msg, method, color=chalk.green) => {
  if (method === 'warn') {
    color = chalk.yellow;
  } else if (method === 'error') {
    color = chalk.red;
  }
	console[method](color(`[COS-UPLOADER] @:${getCurrentTime()} - ${msg}`));
};
const logErrorList = (errs) => {
  if (errs && Array.isArray(errs)) {
    body.errors.forEach(item => console.error('- '+chalk.red(item.message)));
  }
};


//incase hapikey option is not provided
const getWarningObject = (obj={}) => {
  ['start', 'sync', 'pullTemplate', 'pullFile'].forEach(item => {
    obj[item] = () => logger(`${item} method is unavailable until "hapikey" is provided`, 'warn');
  });
};


//export everything
module.exports = { fileManagerFolder, fileArrayFromObj, determineFileType, metaDataRegex, readHubspotMetadata, getNumericTemplateCat, getNumericTemplateType, getEndpoint, getFilenameFromPath, fileNamesMatch, getFilelistFromRoot, requestErrorCheck, logger, getWatchedFilesList, getWarningObject, logErrorList };