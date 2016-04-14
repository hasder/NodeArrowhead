var taffy = require('taffydb').taffy;

var inJSON=[ {id:'station-01', expression:"service1:palletAvailable._coap._json, service2:processingComplete._coap._json"}, ];

// Load the Taffy object
//var taffy = require('taffydb4ti').taffy;

// Create an instance, give it a name and the JSON to start with
//var my_db = new taffy('phonesdb',{autocommit:true},inJSON);
//my_db.save(); // because it is new

// returns an array with all rows
//var recordSet=my_db().get();

//recordSet.forEach(function(rec){
    // inside this loop you have access to
// rec.model
// rec.version
// rec.os
//})

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

exports.postExpression = function(req, res){
	var newExpression = new expression(req.body.id, req.body.expression);
	//db.push(newExpression);
	res.send("created/updated orchestration expression record");
};
//console.log(req.body);      // your JSON
//res.send(req.body);    // echo the result back

//exports.deleteExpression = function(req, res){
//	res.send("deleted orchestration expression record");
//};

exports.getExpression = function(req, res){
	var url = require('url').parse(req.url, true);
	//if (url.id == "all") {
//	res.send(db.filter(function(el)
//			{
//				if(el.id == url.query.id)
//					return el;
//			}));
		//res.send(db)
	//}
	res.send(db().filter({ id : req.params.systemid}).get());
	//res.send("id:00012,function:rpm,gps:19282-243112,height:1.8m");
};