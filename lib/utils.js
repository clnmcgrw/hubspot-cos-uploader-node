


const metaDataRegex = /\[hubspot-metadata]([\w\W]*?)\[end-hubspot-metadata\]/;

const isArray = item => Array.isArray(item);

const logger = (chalk, msg, method) => {
	var date = new Date(), 
			hours = date.getHours() > 12 ? date.getHours()-12 : date.getHours(),
			minutes = date.getMinutes().toString().length < 2 ? '0'+date.getMinutes() : ''+date.getMinutes(),
			seconds = date.getSeconds().toString().length < 2 ? '0'+date.getSeconds() : ''+date.getSeconds();
	hours = hours.toString().length < 2 ? '0'+hours : ''+hours;
	console.log(chalk('[COS-UPLOADER] @:'+hours+':'+minutes+':'+seconds+' - '+msg));
};


module.exports = { metaDataRegex, isArray, logger };