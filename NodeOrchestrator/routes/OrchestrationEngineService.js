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


var reqprom = require("request-promise");


exports.handleGet = function(req, res){

	var serviceNameList = [];
	var i = 0;
	var serviceList = [];
	
	var getOrchestrationRules = {
			uri: 'http://127.0.0.1:1102/orchestrationstore/configuration/' + req.params.target,
		    json: true // Automatically parses the JSON string in the response
	}

	
	reqprom(getOrchestrationRules)
		.then(getServiceListRecursive)
		.then(createResponse)
		.catch(function (err) {
			console.log(err);
		});
};

function getServiceListRecursive (repos) {
	console.log(repos);
	var sd_options = {
			uri: 'http://127.0.0.1:1100/servicediscovery/service/' + repos[0].rules[0],
		    json: true // Automatically parses the JSON string in the response
	}
	return reqprom(sd_options).then(function(repos) { console.log("emtpy"); return repos;});
}

function createResponse(repos) {
	console.log(repos);
	var oe_response = {};
	oe_response.target='station-01';
	oe_response.services= [];
	oe_response.services.push({"name":repos[0].name, "address":repos[0].host+":"+repos[0].port+"/"+repos[0].properties.property[0]})
	res.send(oe_response);
	//res.send("id:00012,function:rpm,gps:19282-243112,height:1.8m");
}

//exports.lookupOrchestrationStore = function(req,res,next) {
//	if(!req._orchestrationengine) {
//		req._orchestrationengine = {};
//	}
//	
//	request({
//			uri: "http://" + "127.0.0.1" + ":" + "1102" + "/orchestrationstore/configuration/" + "station-01",
//			method: "GET",
//		}, function(error, response, body) {
//			console.log(body);
//		});
//	
//	req._orchestrationengine.criteria = "";
//	next();
//};
//
//exports.lookupServiceRegistry = function(req,res,next) {
//	if(!req._orchestrationengine) {
//		res.write("Error");
//		res.end();
//	} else {
//		req._orchestrationengine.servicelist = "";
//		next();
//	}
//};
//
//exports.matchServiceContract = function(req,res,next) {
//	if(!req._orchestrationengine) {
//		res.write("Error");
//		res.end();
//	} else {
//		req._orchestrationengine.service = "bye";
//		next();
//	}
//};
//
//exports.sendResponse = function(req,res,next) {
//	if(!req._orchestrationengine) {
//		res.write("Error");
//		res.end();
//	} else {
//		res.write(req._orchestrationengine.service);
//		res.end();
//	}
//};