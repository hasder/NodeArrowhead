
var taffy = require('taffydb').taffy;
//var localStorage = require('localStorage');

var servicedb = [];



function servicerecord ( name, type, host, port, domain, properties )  {
	this.name = name;
	this.type = type;
	this.host = host;
	this.port = port;
	this.domain = domain;
	this.properties = properties
}


var inJSON = [new servicerecord("palletAvailable", "_coap-json._udp", "[fdfd::ff]", "5683", "unknown", {"property":[{"name":"version","value":"1.0"},{"name":"path","value":"/palletAvailable"}]})]

var db = new taffy(inJSON);


/*
 * GET Service list.
 */
function getServiceResponse(name) {
	if(name) {
		return db().filter({name:{like:name}}).get();
	} else {
		return db().get();
	}
};
exports.service = function(req, res){
	res.setHeader('Content-Type','application/json');
	var responsePayload = getServiceResponse(req.params.name);
	res.send(responsePayload);
};
exports.service_coap = function(req, res){
	res.setOption('Content-Format','application/json');
	var responsePayload = getServiceResponse(req.url.split('/')[3]);
	res.end(JSON.stringify(responsePayload));
};



/*
 * GET type list or service list.
 */
function getTypeResponse(type) {
	if(type) {
		return db().filter({type:{like:type}}).get();
	} else {
		return db().distinct("type");
	}
}
exports.type = function(req, res){
	res.setHeader('Content-Type','application/json');
	var responsePayload = getTypeResponse(req.params.type);
	res.send(responsePayload);
//	if(req.params.type) {
//		res.send(db().filter({type:{like:req.params.type}}).get());
//	} else {
//		res.send(db().distinct("type"));
//	}
};
exports.type_coap = function(req, res){
	res.setOption('Content-Format','application/json');
	var responsePayload = getTypeResponse(req.url.split('/')[3]);
	res.end(JSON.stringify(responsePayload));
};

var registerNewService = function (element) {
	if(element.name) {
		db({name:element.name}).remove();
		
		db.insert(new servicerecord(
				element.name, 
				element.type, 
				element.host, 
				element.port, 
				element.domain,
				element.properties ));
		

	} else throw new Error("service name not provided");
}

/*
 * POST publish new service
 */
exports.publish = function(req, res){
	try {
		req.body.forEach(registerNewService);

		res.send("ok");
		
	} catch (error) {
		console.log('exception when parsing body = ' + error);
		res.code = '4.00';
		res.end();
	}
	
};
exports.publish_coap = function(req, res){
	try {

		var payload = JSON.parse(req.payload);
		payload.forEach(registerNewService);
		
//		if(payload.name) {
//			db({name:payload.name}).remove();
//			
//			db.insert(new servicerecord(
//						payload.name, 
//						payload.type, 
//						payload.host, 
//						payload.port, 
//						payload.properties ));
//			
//			res.end("ok");
//		} else throw new Error("service name not provided");
	} catch (e) {
		console.log('exception when parsing body');
		res.code = '4.00';
		res.end();
	}
};

/*
 * POST publish new service
 */
exports.unpublish = function(req, res){
	db({name:req.body.name}).remove();
	res.send("ok");
};
exports.unpublish_coap = function(req, res){
	try {
		var payload = JSON.parse(req.payload);
		db({name:payload.name}).remove();
		res.end("ok");
	} catch (e) {
		console.log('exception when parsing body');
		res.code = '4.00';
		res.end();
	}
};