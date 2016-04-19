/**
 * Copyright (c) <2016> <hasder>
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 	
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 * 
*/





//exports.handleGet = function(req, res){
//	var url = require('url').parse(req.url, true);
//	//if (url.id == "all") {
//	
//	res.send(db.filter(function(el)
//			{
//				if(el.id == url.query.id)
//					return el;
//			}));
//		//res.send(db)
//	//}
//	res.send("id:00012,function:rpm,gps:19282-243112,height:1.8m");
//};

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