
# Hubspot COS Uploader for NodeJS

#### Important Notes for V2

Hubspot's ~~COS~~ CMS has changed a lot...it is no longer ideal to serve css & js from the "design manager" (the hubl function `get_public_template_url('path/to/asset')` is being deprecated, or at least they warn against using it).

So, v2 of this tool has been adapted to place css/js files in the "file manager", and print the cdn url in the console.


---

### Project Info

This project was inspired by Hubspot's original COS Uploader Python tool.  It contains a few improvements, including the ability to synchronize with remote templates and more closely ensure that newer work doesn't get overwritten. However, it does currently require you to [genrate a "hapikey"](https://knowledge.hubspot.com/articles/kcs_article/integrations/how-do-i-get-my-hubspot-api-key) rather than putting you throught the OAuth2 flow.

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
  
  // defaults to "hubspot-files"
  files: 'hubspot-files', 

  // defaults to "hubspot-templates"
  templates: 'hubspot-templates',
});

//pull a remote template (currently remote template must have metadata)
//localpath is optional & will default to first directory from "root" option
Uploader.pull(fileId, localpath);

//start watchers
Uploader.start();

//sync with remote, returns a promise...
var sync = Uploader.sync();

//so you can use it as a way to pull updated templates
sync.then(() => Uploader.start());

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



