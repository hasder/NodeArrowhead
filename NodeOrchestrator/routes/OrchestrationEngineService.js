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


var 	reqprom = require("request-promise")
	,	xmldoc = require("xmldoc");



exports.handleGet = function(req, res){

	var targetSys = req.params.target;
	var serviceList = [];
	var respXML = {};

	var serviceName = "";
	var serviceType = "";
		
	
	var getOrchestrationRules_options = {
			uri: 'http://127.0.0.1:1102/orchestrationstore/configuration/' + targetSys,
		    json: true // Automatically parses the JSON string in the response
	}

	
	var waitfor = reqprom(getOrchestrationRules_options).then(function(response) {
			console.log("response[0].rules: " + response[0].rules);
			return response[0].rules;
		});
	
	waitfor = waitfor.map(function(rule) {
		
		serviceName = rule.split(',')[0];
		serviceType = rule.split(',')[1];
		
		console.log("serviceName: " + serviceName);
		var getService_options = {
				uri: 'http://127.0.0.1:1100/servicediscovery/service/' + serviceName,
			    json: true // Automatically parses the JSON string in the response
		};
		return reqprom(getService_options);
		//return "hello";
	});
	
	waitfor = waitfor.then(function(service) {
		if(service[0][0].type.toString() !== serviceType.toString()) {
			var xmlbody = 	'<translatorSetup>' + 
							'<providerName>' + service[0][0].type + '</providerName>' + 
							'<providerType>' + service[0][0].type + '</providerType>' 
							+ '<providerAddress>' + service[0][0].host + ':' + service[0][0].port + '/</providerAddress>' 
							+ '<consumerName>' + serviceType + '</consumerName>' 
							+ '<consumerType>' + serviceType + '</consumerType>' 
							+ '<consumerAddress>' + serviceType + '</consumerAddress>' 
							+ '</translatorSetup>'; 
			//request translator to create interfaces
			var postTranslator_options = {
					uri: 'http://127.0.0.1:8000/translator/',
				    json: false, // Automatically parses the JSON string in the response
				    headers: {'Content-Type': 'application/xml'},
				    method: 'post',
				    body: xmlbody//post message content {providername, providertype, provideraddress, consumername, consumertype, consumeraddress}
			};
			return reqprom(postTranslator_options)
			.then(function(response) {
				console.log("actual:" + response);
				respXML = new xmldoc.XmlDocument(response);
			
				console.log("actual respXML is " + respXML);
				return respXML;
			}).then(function(respXML) {
				console.log("outside respXML is " + respXML);
				//replace the address value with the end-point details returned from the translator
				service[0][0].host = respXML.valueWithPath("ip");
				service[0][0].port = respXML.valueWithPath("port");
				service[0][0].type = serviceType;
			
				return service;
			});
		}
	});	
	
	waitfor = waitfor.then(function(service){//conditional logic tree with promise framework
		console.log("final service" + service);
		var path = service[0][0].properties.property.filter( function(property) { return property.name === "path" ? true : false; })[0].value;
		serviceList.push({	
			"name":		service[0][0].name,
			"address":	service[0][0].host + ":" + service[0][0].port + path
		});
	});									
		//.then (check for missmatches between service interfaces and returned orchestration list)
		//.then (engage translator to perform the requested translation).
	waitfor = waitfor.finally(function() {
			console.log({"target":targetSys, "services":serviceList});
			res.setHeader('Content-Type','application/json');
			res.send({"target":targetSys, "services":serviceList});
	});
};

