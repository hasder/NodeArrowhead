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

var taffy = require('taffydb').taffy;

//var inJSON=[ {id:'station-01', expression:"service1:palletAvailable._coap._json, service2:processingComplete._coap._json"}, ];
var inJSON=[ {	target:'station-01',
				name:'name-01',  
				serialNumber:'serialNumber-01',  
				lastUpdated:'lastUpdated-01', 

var db = new taffy(inJSON);



function orchestrationrecord ( target, name, serialNumber, lastUpdated, rules )  {
	this.target = target;
	this.name = name;
	this.serialNumber = serialNumber;
	this.lastUpdated = lastUpdated;
	this.rules = rules;
}


/*
 * Orhestration Store Service Provides the CRUD for storing Orchestration Expressions
 */

function expression(id, expression) {
    this.id = id;
    this.expression = expression;
}
//var myFather = new person("John", "Doe", 50, "blue");
//var myMother = new person("Sally", "Rally", 48, "green");

//var db = [];

var db = new taffy(inJSON);
//db.save();

//var temp = new servicerecord("req.body.servicename", "req.body.servicetype", "req.body.serviceport", "req.body.servicehost", "req.body.servicedomain", "req.body.servicepath" );

//db.insert(temp);


exports.usage =  function(req, res){
	var usage = "usage: ??";
	res.send(usage);
};

/*
 * GET Orchestration list.
 */
exports.getExpression = function(req, res){
	res.setHeader('Content-Type','application/json');
	var responsePayload = null;
	if(req.params.target) {
		responsePayload = db().filter({target:{like:req.params.target}}).get();
	} else {
		responsePayload = "ERROR: Target not specified"//TODO:set error code
		res.status(400);
	}

	res.send(responsePayload);
};




/*
 * POST publish new orchestration
 */
exports.postExpression = function(req, res){
	
	res.send("created/updated orchestration expression record");
};
exports.publish = function(req, res){
	try {
		if(req.body.target) {
			db({name:req.body.target}).remove();
			
			db.insert(new orchestrationrecord(
							req.body.target, 
							req.body.name, 
							req.body.serialNumber, 
							req.body.lastUpdated, 
							req.body.rules ));
			
			res.send("ok");

		} else {
			throw new Error("target system not provided");
		}
	} catch (e) {
		console.log('exception when parsing body');
		res.status(400);
		res.send();
	}
	
};




/*
 * POST delete an orchestration
 */
exports.deleteExpression = function(req,res){
	try {
		if(req.body.target) {
			db({name:req.body.target}).remove();

			res.send("ok");

		} else {
			throw new Error("target system not provided");
		}
	} catch (e) {
		console.log('exception when parsing body');
		res.status(400);
		res.send();
	}
	
};