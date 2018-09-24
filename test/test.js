const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;


const fileAdded = require('./lib/template-create.js');
const fileChanged = require('./lib/template-update.js');
const fileRemote = require('./lib/template-pull.js');
const remoteSync = require('./lib/template-sync.js');


describe('Local File Watchers', function() {

  it('should expose the watcher instance', function() {

  });

  it('should watch files specified in config', function() {

  });

});



describe('Create Template Module (fileAdded)', function() {
  
  it('should hit the templates endpoint', function(done) {
    done();
  });

  it('should hit the files endpoint', function(done) {
    done();
  });

});