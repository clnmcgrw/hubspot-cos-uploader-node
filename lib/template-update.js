
const fs = require('fs');
const request = require('request');
const utils = require('./utils.js');
const createInFileManager = require('./file-manager-create.js');



const updateInDesignManager = (hapikey, localpath, meta, html, callbacks) => {
  const reqOpts = {
    url: utils.getEndpoint(hapikey, meta.id).general,
    method: 'PUT',
    json: true,
    body: {source: html}
  };
  
  request(reqOpts, function(error, res, body) {
    const errMessage = utils.requestErrorCheck(error, body, localpath, res);
    if (errMessage !== false) {
      callbacks.fail(errMessage);
    } else {
      callbacks.done(`Template ${utils.getFilenameFromPath(localpath)} updated successfully.`);
    }
  });
};



module.exports = (localPath, config) => {
   const fileType = utils.determineFileType(config.DIRS, localPath);

  return new Promise((resolve, reject) => {
    
    if (fileType === 'templ') {
      const html = fs.readFileSync(localPath).toString();
      const filemeta = utils.readHubspotMetadata(html);
      const filename = utils.getFilenameFromPath(localPath);

      if (!filemeta) {
        reject({msg: `Check that your [hubspot-metadata] JSON for ${filename} is formatted correctly.`, log: 'error'});
        return;
      } 
      if (!utils.fileNamesMatch(localPath, filemeta.path)) {
        reject({msg:'The name of your local file should match the "path" filename in your metadata.', log: 'error'});
        return;
      } 
      if (!filemeta.id) {
        //this catches instances when metadata wasn't present on file added event (which is prob most of the time)
        // - we look for 'warn' in .then() callback to trigger template create
        reject({msg:`File ${filename} has no ID in its metadata - creating as new template.`, log: 'warn'});
        return;
      }

      updateInDesignManager(config.HAPIKEY, localPath, filemeta, html, {
        fail: msg => reject({msg: msg, log: 'error'}),
        done: msg => resolve(msg)
      });

    } else {
       createInFileManager(config.HAPIKEY, localPath, {
        fail: msg => reject(msg),
        done: msg => resolve(msg)
      }, 'updated');
    }
  });
};

