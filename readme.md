

# Hubspot COS Uploader for NodeJS

This project was inspired by Hubspot's original COS Uploader tool built on Python.  It contains a few improvements, including the ability to synchronize with remote templates and ensure that newer work does not get overwritten.

Just like the original Python version, each template or asset file needs metadata inside a comment:

``` html
<!-- [hubspot-metadata] {"type":"page","path":"design/manager/file/path/filename.html"} [end-hubspot-metadata] -->
```

The `type` property of the hubspot metadata object can be "asset", "page", "email", "blog", or "partial".  Path is the destination location and filename in the design manager.  ID will be written back to the file once it is created in Hubspot.

	* Page - a landing or website page
	* Email - an email template
	* Blog - a blog listing or single template
	* Partial - a template that is not "available for new content"...usually for includes


## Usage

``` javascript
//require it
var HubspotUploader = require('hubspot-uploader');

//create instance
var Uploader = new HubspotUploader({
	portalId: 'XXXXXX',
	hapikey: 'XXXXXX'
});

//pull a remote template
Uploader.pull(fileId);

//start watchers
Uploader.start();

//sync with remote
Uploader.sync();

```


# Things To Note

The synchronization feature of this package is not 100% bulletproof - avoid adding files and making changes before initializing watchers.

Since file events can only be known about once the watchers are started, work done outside the watched environment may cause unwanted behavior.  And as always, maintain version control and commit often!  

Don't forget to pull before starting the uploader.