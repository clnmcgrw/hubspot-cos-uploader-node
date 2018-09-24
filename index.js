/* npm deps */
const chokidar = require('chokidar');
const chalk = require('chalk');

/* project lib */
const fileAdded = require('./lib/template-create.js');
const fileChanged = require('./lib/template-update.js');
const fileRemote = require('./lib/template-pull.js');
const remoteSync = require('./lib/template-sync.js');
const { fileArrayFromObj, getWatchedFilesList, getWarningObject, logger } = require('./lib/utils.js');

/* Chokidar defaults */
const chokidarOpts = {
  ignoreInitial: true,
  awaitWriteFinish: true,
  disableGlobbing: true
};


/*
* Hubspot COS Uploader
* --- options:
* hapikey - Hubspot private api key
* files - folder for file-manager
* templates - folder for design-manager
*/

function Uploader(options) {
  options = options || false;

  //required opts check
  if (!options || !options.hapikey) {
    logger('A "hapikey" option must be provided.', 'error');
    logger('https://knowledge.hubspot.com/articles/kcs_article/integrations/how-do-i-get-my-hubspot-api-key', 'warn');
    return getWarningObject();
  } 
  //config info
  const HAPIKEY = options.hapikey;
  const FILES_DIR = options.files || 'hubspot-files';
  const TEMPL_DIR = options.templates || 'hubspot-templates';
  const DIRS = { templ: TEMPL_DIR, files: FILES_DIR };
  const CONFIG = {HAPIKEY, DIRS};
  
  //"start" method
  function start() {
    const watchers = chokidar.watch(fileArrayFromObj(DIRS), chokidarOpts);
    watchers
      .on('add', path => {
        fileAdded(path, CONFIG)
          .then(msg => logger(msg, 'log'))
          .catch(msg => logger(msg, 'error'));
      })
      .on('change', path => {
        fileChanged(path, CONFIG)
          .then(msg => logger(msg, 'log'))
          .catch(info => {
            if (info.log === 'warn') {
              fileAdded(path, CONFIG)
                .then(msg => logger(msg, 'log'))
                .catch(msg => logger(msg, 'error'));
            } else {
              logger(info.msg, 'error');
            }
          });
      })
      .on('ready', () => logger('Watching - '+getWatchedFilesList(watchers), 'log'));
  };

  // "sync" method
  function sync() {
    return new Promise((resolve, reject) => {
      let condition = true;
      if (condition) {
        resolve();
      } else {
        reject();
      }
    });
  };

  // pull a design-manager template
  function pullTemplate(id) {
    fileRemote.doTemplatePull(id, DIRS.templ)
      .then(msg => logger(msg, 'log'))
      .catch(msg => logger(msg, 'error'));
  };
  // pull a file-manager file
  function pullFile(id) {

  };
  
  return { start, sync, pullTemplate, pullFile };
};



/* export uploader function */
module.exports = Uploader;