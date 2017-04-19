var chalk = require('chalk');


module.exports = {

	isArray(item) {
		return Array.isArray(item);
	},

	metaDataRegex: /\[hubspot-metadata]([\w\W]*?)\[end-hubspot-metadata\]/,
	
	//TODO *remove chalk arg - chalk color should be tied to console method
	//	* user proper console methods (warn, error) when appropriate
	logger(chalk, msg, method) {
		var date = new Date(), 
				hours = date.getHours() > 12 ? date.getHours()-12 : date.getHours(),
				minutes = date.getMinutes().toString().length < 2 ? '0'+date.getMinutes() : ''+date.getMinutes(),
				seconds = date.getSeconds().toString().length < 2 ? '0'+date.getSeconds() : ''+date.getSeconds();
		hours = hours.toString().length < 2 ? '0'+hours : ''+hours;
		console.log(chalk('[COS-UPLOADER] @:'+hours+':'+minutes+':'+seconds+' - '+msg));
	}

};