
const fs = require('fs');

const utils = require('./utils.js');



const doSyncNewer = (dirs) => {
  
  var allFiles = utils.getFilelistFromRoot(),
      allProcessed = [];

  return new Promise(function(resolve, reject) { 
    allFiles.forEach(function(item, index) {
      var file = fs.readFileSync(item).toString(),
          filemeta = readHubspotMetadata(file),
          stats = fs.statSync(item),
          lastModLocal = Date.parse(stats.mtime);

      if (!filemeta) {
        allProcessed.push(item);
        logger(chalk.red, 'Check that the [hubspot-metadata] JSON is formatted correctly for '+getFilenameFromPath(item));
        return;
      } else if (!filemeta.id) {
        allProcessed.push(item);
        logger(chalk.red, 'The [hubspot-metadata] JSON for '+getFilenameFromPath(item)+' is missing an id');
        return;
      }

      getTemplateById(filemeta.id, function(error, res, body) {
        allProcessed.push(item);
        //compare epochs, pull & replace if remote is newer, 
        //need to check diff with offset because of time for API request
        if (body.updated-lastModLocal > 9000) {
          fs.writeFileSync(item, body.source);
          logger(chalk.green, 'Newer remote Hubspot templates have been pulled to your local project.');
        }
        //resolve when all reqs complete
        if (allProcessed.length === allFiles.length) {
          resolve();
        }
      });

    });
  });
};