/**
 * http://usejsdoc.org/
 */




exports.handleGet = function(req, res){
	var url = require('url').parse(req.url, true);
	//if (url.id == "all") {
	
	res.send(db.filter(function(el)
			{
				if(el.id == url.query.id)
					return el;
			}));
		//res.send(db)
	//}
	res.send("id:00012,function:rpm,gps:19282-243112,height:1.8m");
};

exports.lookupOrchestrationStore = function(req,res,next) {
	if(!req._orchestrationengine)
		req._orchestrationengine = {};
	
	
	
	req._orchestrationengine.criteria = "";
	next();
}

exports.lookupServiceRegistry = function(req,res,next) {
	if(!req._orchestrationengine) {
		res.write("Error");
		res.end();
	} else {
		req._orchestrationengine.servicelist = "";
		next();
	}
}

exports.matchServiceContract = function(req,res,next) {
	if(!req._orchestrationengine) {
		res.write("Error");
		res.end();
	} else {
		req._orchestrationengine.service = "bye";
		next();
	}
}

exports.sendResponse = function(req,res,next) {
	if(!req._orchestrationengine) {
		res.write("Error");
		res.end();
	} else {
		res.write(req._orchestrationengine.service);
		res.end();
	}
}