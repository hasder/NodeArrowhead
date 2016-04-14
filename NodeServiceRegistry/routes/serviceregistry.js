
var taffy = require('taffydb').taffy;
//var localStorage = require('localStorage');

var servicedb = [];

function servicerecord ( servicename, servicetype, serviceport, servicehost, servicedomain, servicepath ) {
    this.servicename = servicename;
    this.servicetype = servicetype;
    this.serviceport = serviceport;
    this.servicehost = servicehost;
    this.servicedomain = servicedomain;
    this.servicepath = servicepath;
    
}

var inJSON = [new servicerecord("palletAvailable._coap._json", "_coap._json", "5683", "[fdfd::ff]", "unknown", "/palletAvailable")]

var db = new taffy(inJSON);

var temp = new servicerecord("req.body.servicename", "req.body.servicetype", "req.body.serviceport", "req.body.servicehost", "req.body.servicedomain", "req.body.servicepath" );

//db().insert(temp);

/*
 * GET home page.
 */

exports.service = function(req, res){
	res.setHeader('Content-Type','application/json');
	if(req.params.name) {
		res.send(db().filter({servicename:{like:req.params.name}}).get());
	} else {
		res.send(db().get());
	}
};

exports.type = function(req, res){
	res.setHeader('Content-Type','application/json');
	if(req.params.type) {
		res.send(db().filter({servicetype:req.params.type}).get());
	} else {
		res.send(db().distinct("servicetype"));
	}
};


/*
 * POST publish new service
 */

exports.publish = function(req, res){
	
	db({servicename:req.body.servicename}).remove();
	
	db.insert(new servicerecord(
					req.body.servicename, 
					req.body.servicetype, 
					req.body.serviceport, 
					req.body.servicehost, 
					req.body.servicedomain, 
					req.body.servicepath ));
	
	
//	var index = servicedb.indexOf(req.body.servicename);
//	if ( index < 0 ) {
//		servicedb.push(new servicerecord(req.body.servicename, req.body.servicetype, req.body.serviceport, req.body.servicehost, req.body.servicedomain, req.body.servicepath ));
//		res.send("ok");
//	} else {
//		servicedb[index] = new servicerecord(req.body.servicename, req.body.servicetype, req.body.serviceport, req.body.servicehost, req.body.servicedomain, req.body.servicepath );
//		res.send("ok");
//	}
	res.send("ok");
};

/*
 * POST publish new service
 */

exports.unpublish = function(req, res){
	var temp1 = servicedb.filter(function(el)
	{
		if(el.servicename === req.body.servicename) {
			return el;
		}
	});
	console.log(temp1);
	servicedb.splice(servicedb.indexOf(temp1),1);
	res.send("ok");
};