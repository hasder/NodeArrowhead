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
	,	config = require('../config')
	,	xmldoc = require("xmldoc");



exports.handleGet = function(req, res) {

	var targetSys = req.params.target;
	var serviceList = [];
	var respXML = {};

	var serviceName = "";
	var serviceType = "";
	var consumerScheme = "";
	var serviceAddress = req.connection.remoteAddress;
	console.log("serviceAddress: " + serviceAddress);
	
	if ((serviceAddress.indexOf("[") < 0) && (serviceAddress.indexOf(":") > -1)) {
		if (serviceAddress.indexOf("::") > -1) {
			
		} else {
			serviceAddress = serviceAddress.substring( serviceAddress.lastIndexOf(":")+1 );
		}
	}
	
	
	console.log(serviceAddress);
	
	var getOrchestrationRules_options = {
			uri: 'http://' + config.listen.ip + ':1102/orchestrationstore/configuration/' + targetSys,
		    json: true // Automatically parses the JSON string in the response
	};

	//send request to Orchestration store to get the rules for the system
	var waitfor = reqprom(getOrchestrationRules_options).then(function(response) {
		console.log("response[0].rules: " + response[0].rules);
		return response[0].rules;
	});
	
	//concurrent sends to service registry to get the service instances according to the name in the rule
	//todo: This will change once the rule definition becomes clear.
	waitfor = waitfor.map(function(rule) {
		
		serviceName = rule.split(',')[0];
		serviceType = rule.split(',')[1];
		
		console.log("serviceName: " + serviceName);
		var getService_options = {
				uri: 'http://' + config.serviceregistry.ip + ':' + config.serviceregistry.port + '/servicediscovery/service/' + serviceName,
			    json: true // Automatically parses the JSON string in the response
		};
		return reqprom(getService_options);
	});
	
	
	//select service provider from list
	// criteria = 	meta data
	//				QoS
	//				security
	
	
	
	
	//concurrent test for protocol mismatch and therefore translator engagement
	waitfor = waitfor.map(function(service) {
//		service.forEach(function(entry) {
//			console.log("retrieved service name " + entry.name.toString());
//			console.log("retrieved service type " + entry.type.toString());
//			console.log("desired service type " + serviceType.toString());
//			console.log("match " + entry.type.toString().indexOf(serviceType.toString()));
//		});
		console.log("service: " + JSON.stringify(service[0]));
		if(service[0].hasOwnProperty("type")) {
			console.log("retrieved service type " + service[0].type.toString());
			console.log("desired service type " + serviceType.toString());
			consumerScheme = serviceType.replace("_","");
			console.log("match " + service[0].type.toString().indexOf(serviceType.toString()));
			if(service[0].type.toString().indexOf(serviceType.toString()) === -1) {
				//if the ip address does not contain a period and it does not have the square brackets for ipv6 then add them
				if (service[0].host.indexOf(':') > -1 && service[0].host.indexOf('[') === -1) { 
					service[0].host = '[' + service[0].host + ']';
				}
				
				var xmlbody = 	'<translatorSetup>' + 
								'<providerName>' + service[0].type + '</providerName>' + 
								'<providerType>' + service[0].type + '</providerType>' + 
								'<providerAddress>' + service[0].host + ':' + service[0].port + '</providerAddress>' + 
								'<consumerName>' + serviceType + '</consumerName>' + 
								'<consumerType>' + serviceType + '</consumerType>' + 
								'<consumerAddress>' + serviceAddress + '</consumerAddress>' + 
								'</translatorSetup>'; 
				console.log("xmlbody " + xmlbody);
				//request translator to create interfaces
				var postTranslator_options = {
						uri: 'http://' + config.translator.ip + ':' + config.translator.port + '/translator/',
					    json: false, // Automatically parses the JSON string in the response
					    headers: {'Content-Type': 'application/xml'},
					    method: 'post',
					    body: xmlbody//post message content {providername, providertype, provideraddress, consumername, consumertype, consumeraddress}
				};
				
				
				return reqprom(postTranslator_options)
				.then(function(response) {
					console.log("actual:" + response);
					respXML = new xmldoc.XmlDocument(response);
					return respXML;
				}).then(function(respXML) {
					//replace the address value with the end-point details returned from the translator
					service[0].host = respXML.valueWithPath("ip");
					service[0].port = respXML.valueWithPath("port");
					service[0].type = serviceType;
				
					return service;
				});
			} else {
				return service;
			}
		}else {
			return null;
		}
	});	
	
	//
	waitfor = waitfor.map(function(service){//conditional logic tree with promise framework
		console.log("final service " + JSON.stringify(service));
		if(service !== null) {
			var path = service[0].properties.property.filter( function(property) { return property.name === "path" ? true : false; })[0].value;
			if(path.startsWith("/")) {
				path = (path[1]==='/'? path.substring(1) : path);
			} else {
				path = "/" + path;
			}
			if(service[0].port.endsWith("/")) {
				service[0].port = service[0].port.substring(0,service[0].port.length-1);
			}
			
			serviceList.push({	
				"name":		service[0].name,
				"address":	consumerScheme + "://" + service[0].host + ":" + service[0].port + path  //path.substring(1)
			});
		}
	});		
	
	//
	waitfor = waitfor.finally(function() {
			console.log({"target":targetSys, "services":serviceList});
			res.setHeader('Content-Type','application/json');
			res.send({"target":targetSys, "services":serviceList});
	});
};

exports.handleGetCoap = function(req, res) {
	
	//var targetSys = req.url.split('?')[1].split('=')[1];
	var targetSys = req.url.split('/')[2];
	console.log("targetSys: " + targetSys);
	var serviceList = [];
	var respXML = {};

	var serviceName = "";
	var serviceType = "";
	var consumerScheme = "";
	var serviceAddress = req.rsinfo.address;
	console.log("serviceAddress: " + serviceAddress);
	if(serviceAddress.indexOf(":") > -1) {
		serviceAddress = serviceAddress.substring(serviceAddress.lastIndexOf(":")+1);
	}
	
	
	console.log(serviceAddress);
	
	var getOrchestrationRules_options = {
			uri: 'http://' + config.listen.ip + ':1102/orchestrationstore/configuration/' + targetSys,
		    json: true // Automatically parses the JSON string in the response
	};

	//send request to Orchestration store to get the rules for the system
	var waitfor = reqprom(getOrchestrationRules_options).then(function(response) {
		console.log("response[0].rules: " + response[0].rules);
		return response[0].rules;
	});
	
	//concurrent sends to service registry to get the service instances according to the name in the rule
	//todo: This will change once the rule definition becomes clear.
	waitfor = waitfor.map(function(rule) {
		
		serviceName = rule.split(',')[0];
		serviceType = rule.split(',')[1];
		
		console.log("serviceName: " + serviceName);
		var getService_options = {
				uri: 'http://' + config.serviceregistry.ip + ':' + config.serviceregistry.port + '/servicediscovery/service/' + serviceName,
			    json: true // Automatically parses the JSON string in the response
		};
		console.log("service lookup at: " + getService_options.uri);
		return reqprom(getService_options);
	});
	
	//concurrent test for protocol mismatch and therefore translator engagement
	waitfor = waitfor.map(function(service) {
		console.log("retrieved service type " + service[0].type.toString());
		console.log("desired service type " + serviceType.toString());
		consumerScheme = serviceType.replace("_","");
		console.log("match " + service[0].type.toString().indexOf(serviceType.toString()));
		if(service[0].type.toString().indexOf(serviceType.toString()) === -1) {
			//if the ip address does not contain a period and it does not have the square brackets for ipv6 then add them
			if (service[0].host.indexOf('.') === -1 && service[0].host.indexOf('[') === -1) { 
				service[0].host = '[' + service[0].host + ']';
			}
			
			var xmlbody = 	'<translatorSetup>' + 
							'<providerName>' + service[0].type + '</providerName>' + 
							'<providerType>' + service[0].type + '</providerType>' + 
							'<providerAddress>' + service[0].host + ':' + service[0].port + '</providerAddress>' + 
							'<consumerName>' + serviceType + '</consumerName>' + 
							'<consumerType>' + serviceType + '</consumerType>' + 
							'<consumerAddress>' + serviceAddress + '</consumerAddress>' + 
							'</translatorSetup>'; 
			//request translator to create interfaces
			console.log("xmlbody " + xmlbody);
			var postTranslator_options = {
					uri: 'http://' + config.translator.ip + ':' + config.translator.port + '/translator/',
				    json: false, // Automatically parses the JSON string in the response
				    headers: {'Content-Type': 'application/xml'},
				    method: 'post',
				    body: xmlbody//post message content {providername, providertype, provideraddress, consumername, consumertype, consumeraddress}
			};
			
			return reqprom(postTranslator_options)
			.then(function(response) {
				console.log("actual:" + response);
				respXML = new xmldoc.XmlDocument(response);
				return respXML;
			}).then(function(respXML) {
				//replace the address value with the end-point details returned from the translator
				service[0].host = respXML.valueWithPath("ip");
				service[0].port = respXML.valueWithPath("port");
				service[0].type = serviceType;
			
				return service;
			});
		} else {
			return service;
		}
	});	
	
	//
	waitfor = waitfor.map(function(service){//conditional logic tree with promise framework
		console.log("final service " + JSON.stringify(service));
		var path = service[0].properties.property.filter( function(property) { return property.name === "path" ? true : false; })[0].value;
		if(path.startsWith("/")) {
			path = (path[1]==='/'? path.substring(1) : path);
		} else {
			path = "/" + path;
		}
		serviceList.push({	
			"name":		service[0].name,
			"address":	consumerScheme + "://" + service[0].host + ":" + service[0].port + path  //path.substring(1)
		});
	});	
	
	//
	waitfor = waitfor.finally(function() {
			console.log({"target":targetSys, "services":serviceList});
			res.setOption('Content-Format','application/json');
			var responsePayload = {"target":targetSys, "services":serviceList};
			res.end(JSON.stringify(responsePayload));
	});
};

