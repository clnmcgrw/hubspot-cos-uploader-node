
const fs = require('fs');
const utils = require('./utils.js');
const { templateById } = require('./template-pull.js');


const doSyncNewer = dirs => {
  
  const allFiles = utils.fileArrayFromObj(dirs);
  const processed = [];
  const unprocessed = []
  let msg = '';

  console.log(allFiles);

  return new Promise((resolve, reject) => { 
    
    allFiles.forEach((item, index) => {
      const file = fs.readFileSync(item).toString();
      const filemeta = utils.readHubspotMetadata(file);
      const filename = utils.getFilenameFromPath(item);

      if (!filemeta || !filemeta.id) {
        unprocessed.push(filename);
        return;
      }

      templateById(filemeta.id, (error, res, body) => {
        const errMessage = utils.requestErrorCheck(error, body, item, res);

        if (errMessage !== false) {
          const stats = fs.statSync(item);
          const lastModLocal = Date.parse(stats.mtime);
          
          //compare epochs, pull & replace if remote is newer, - need to check diff with offset because of time for API request
          if (body.updated-lastModLocal > 9999) {
            processed.push(filename);
            fs.writeFileSync(item, body.source);
          } else {
            unprocessed.push(filename);
          }
        } else {
          unprocessed.push(filename);
        }

        //resolve when all reqs complete
        if ((unprocessed.length + processed.length) === allFiles.length) {
          resolve('Local templates synced changes from Hubspot');
        } 

      });

    });
  });
};

module.exports = doSyncNewer;