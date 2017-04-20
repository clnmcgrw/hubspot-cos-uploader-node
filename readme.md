
# Hubspot COS Uploader for NodeJS

This project was inspired by Hubspot's original COS Uploader tool built on Python.  It contains a few improvements, including the ability to synchronize with remote templates and more closely ensure that newer work doesn't get overwritten. However, it does currently require you to [genrate a "hapikey"](https://knowledge.hubspot.com/articles/kcs_article/integrations/how-do-i-get-my-hubspot-api-key) rather than putting you throught the OAuth2 flow.

Just like Hubspot's original cos uploader, each template or asset file needs metadata inside a comment:

``` html
<!-- [hubspot-metadata] {"type":"page","path":"design/manager/file/path/filename.html"} [end-hubspot-metadata] -->
```

The `type` property of the hubspot metadata object can be "asset", "page", "email", "blog", "404", or "partial".  Path is the destination location and filename in the design manager.  ID will be written back to the file once it is created in Hubspot.

- `Page` - a landing or website page
- `Email` - an email template
- `Blog` - a blog listing or single template
- `Partial` - a template that is not "available for new content"...usually for includes
- `404` - a "system template" for 404 error pages


## Usage

The only required option is `hapikey`, which is a [hubspot api key](https://knowledge.hubspot.com/articles/kcs_article/integrations/how-do-i-get-my-hubspot-api-key).  The `root` option is the path(s) to watch for file changes.It can be a string or array (path or array of paths), defaults to the current working directory.

``` javascript
//require it
var HubspotUploader = require('hubspot-cos-uploader');

//create an uploader instance
var Uploader = new HubspotUploader({
	//required 
	hapikey: 'XXXXXXXXXXX',

	//optional, relative to project root 
	//can be single path or array of paths
	root: [__dirname+'/src/templates', __dirname+'/src/assets']
});

//pull a remote template (currently remote template must have metadata)
//localpath is optional & will default to first directory from "root" option
Uploader.pull(fileId, localpath);

//start watchers
Uploader.start();

//sync with remote
Uploader.sync();


//need more? full functionality of gaze is exposed on watcher prop 
//https://www.npmjs.com/package/gaze#documentation
Uploader.watcher

```

## Use With Build Tools

A common way to use it in a gulp build is to run the `start` method once (after the `sync` method finishes) as part of your default gulp task.  There is a `gulpfile` in this package's root that shows a more thorough example of a Gulp integration.

``` javascript
var uploader = require('hubspot-cos-uploader')({
	hapikey: 'XXXXXXXXXX'
});

gulp.task('default', function() {
	uploader.sync().then(uploader.start);
});

```


## Things To Note

The synchronization feature of this package is not 100% bulletproof - avoid adding files and making changes before initializing watchers. Since file events can only be known about once the watchers are started, work done outside the watched environment may cause unwanted behavior.  

And as always, maintain version control and commit often!  


## TODOS

- expose functionality through cli (cli.js)
- use proper console methods for logging (currently all are .log, need warn & error)
- notify if close to reaching daily limit for API reqs (40K/day)
- ** allow OAuth flow option for auth

