
const fs = require('fs');
const request = require('request');
const utils = require('./utils.js');
const createInFileManager = require('./file-manager-create.js');



// new html template in design mgr
const createInDesignManager = (hapikey, localpath, meta, html, callbacks) => {
  const reqOpts = {
    url: utils.getEndpoint(hapikey).create,
    method: 'POST',
    json: true,
    body: {
      category_id: utils.getNumericTemplateCat(meta.type),
      template_type: utils.getNumericTemplateType(meta.type),
      path: meta.path,
      source: html,
      is_available_for_new_content: meta.type === 'partial' ? false : true
    }
  };
  request(reqOpts, (error, res, body) => {
    const errMessage = utils.requestErrorCheck(error, body, localpath, res);
    
    if (errMessage !== false) {
      callbacks.fail(errMessage);
    } else {
      //writes the newly created template ID to the commented json config
      meta.id = body.id;
      fs.writeFileSync(localpath, html.replace(utils.metaDataRegex, `[hubspot-metadata] ${JSON.stringify(meta)} [end-hubspot-metadata]`));
      callbacks.done(`Template ${utils.getFilenameFromPath(localpath)} created successfully.`);
    }
  });
};


// Creates a new template through Hubspot templates API or file manager api
// - https://developers.hubspot.com/docs/methods/templates/post_templates
module.exports = (localPath, config) => {
  const fileType = utils.determineFileType(config.DIRS, localPath);

  return new Promise((resolve, reject) => {

    if (fileType === 'templ') {
      const html = fs.readFileSync(localPath).toString();
      const filemeta = utils.readHubspotMetadata(html);
      const filename = utils.getFilenameFromPath(localPath);
    
      if (!filemeta) {
        reject(`Check that the [hubspot-metadata] JSON for ${filename} is formatted correctly.`);
        return false;
      }
      if (!utils.fileNamesMatch(localPath, filemeta.path)) {
        reject('The name of your local file should match the "path" filename in your metadata.');
        return false;
      }
      createInDesignManager(config.HAPIKEY, localPath, filemeta, html, {
        fail: msg => reject(msg),
        done: msg => resolve(msg)
      });
    } else {
      createInFileManager(config.HAPIKEY, localPath, {
        fail: msg => reject(msg),
        done: msg => resolve(msg)
      });
    }
  });

};