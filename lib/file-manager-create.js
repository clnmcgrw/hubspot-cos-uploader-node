const fs = require('fs');
const request = require('request');
const utils =  require('./utils.js');


// new asset in file manager
const createInFileManager = (hapikey, localpath, callbacks, action='created') => {
  
  const reqOpts = {
    url: utils.getEndpoint(hapikey).filemanager,
    formData: {
      folder_paths: utils.fileManagerFolder,
      files: fs.createReadStream(localpath)
    }
  };

  const reqCallback = (error, res, body) => {
    const errMessage = utils.requestErrorCheck(error, body, localpath, res);
    
    if (errMessage !== false) {
      callbacks.fail(errMessage);
    } else {
      const jsonBody = JSON.parse(body);
      const fileUrl = jsonBody.objects[0].url;

      callbacks.done(`File ${utils.getFilenameFromPath(localpath)} ${action} successfully - ${fileUrl}`);
    }
  };

  const r = request.post(reqOpts.url, reqCallback); 
  const upload = r.form();

  for (let prop in reqOpts.formData) {
    upload.append(prop, reqOpts.formData[prop]);
  }
};

module.exports = createInFileManager;