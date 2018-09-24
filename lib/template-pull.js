const fs = require('fs');
const request = require('request');
const limit = require('simple-rate-limiter');
const utils = require('./utils.js');



const templateById = (id, method, callback) => {
  const reqOpts = {
    url: utils.getEndpoint(id).general, 
    method: method, 
    json: true
  };
  return limit((id, callback) => {
    request(reqOpts, callback);
  }).to(10).per(1000);
};



const doTemplatePull = (templateId, templDir, filePath=false) => {
  return new Promise((resolve, reject) => {
    templateById(templateId, 'GET', function(error, res, body) {
      if (error !== null || res.statusCode !== 200) {
        reject('Error during API request - http status code '+res.statusCode);
        return;
      }
      const metadata = utils.readHubspotMetadata(body.source);
      if (!metadata) {
        reject('Remote template with id '+templateId+' does not contain JSON metadata');
        return;
      }

      const filename = utils.getFilenameFromPath(metadata.path);
      const fileToWrite = !filePath ? templDir+'/'+filename : filePath+'/'+filename;

      fs.writeFileSync(fileToWrite, body.source);
      resolve('Sucessfully pulled file id '+metadata.id+' & saved in '+fileToWrite);
    });
  });
};



module.exports = { templateById, doTemplatePull };




