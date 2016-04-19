
var taffy = require('taffydb').taffy;
//var localStorage = require('localStorage');

var servicedb = [];



function servicerecord ( name, type, port, host, domain, properties )  {
	this.name = name;
	this.type = type;
	this.host = host;
	this.port = port;
	this.domain = domain;
	this.properties = properties
}


var inJSON = [new servicerecord("palletAvailable", "_coap-json._udp", "5683", "[fdfd::ff]", "unknown", {"property":[{"name":"version","value":"1.0"},{"name":"path","value":"/palletAvailable"}]})]

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
}
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


/*
 * POST publish new service
 */
exports.publish = function(req, res){
	try {
		if(req.body.name) {
			db({name:req.body.name}).remove();
			
			db.insert(new servicerecord(
							req.body.name, 
							req.body.type, 
							req.body.host, 
							req.body.port, 
							req.body.properties ));
			
			res.send("ok");

		} else throw new Error("service name not provided");
	} catch (e) {
		console.log('exception when parsing body');
		res.code = '4.00';
		res.end();
	}
	
};
exports.publish_coap = function(req, res){
	try {
		var payload = JSON.parse(req.payload);
		if(payload.name) {
			db({name:payload.name}).remove();
			
			db.insert(new servicerecord(
						payload.name, 
						payload.type, 
						payload.host, 
						payload.port, 
						payload.properties ));
			
			res.end("ok");
		} else throw new Error("service name not provided");
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