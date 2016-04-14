
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , orchestrationstore = require('./routes/OrchestrationStoreService')
  , orchestrationengine = require('./routes/OrchestrationEngineService')
//  , orchestrationmanager = require('./routes/OrchestrationManagerService')
  , http = require('http')
  , path = require('path')
  , config = require('./config');

var app = express();

// all environments
//app.set('port', process.env.PORT || 1102);
app.set('port', process.env.PORT || config.listen.port);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);


//orchestrationstore service
var request = require("request");
request({
uri: "http://" + config.listen.ip + ":" + config.listen.port + "/serviceregistry/publish",
method: "POST",
json: {
		  "servicename" : "OrchestrationStore",
		  "servicetype" : "_orchestrationstore._json._http",
		  "serviceport" : config.listen.port,
		  "servicehost" : config.listen.ip,
		  "servicepath" : "/orchestrationstore/"
}
}, function(error, response, body) {
	console.log(body);
});

//---------------------------------------------------------------------------
//orchestrationstore routes CRUD
app.get('/orchestrationstore/system/:systemid', orchestrationstore.getExpression);
app.post('/orchestrationstore/update', orchestrationstore.postExpression);


//orchestrationengine service
var request = require("request");
request({
uri: "http://127.0.0.1:1100/serviceregistry/publish",
method: "POST",
json: {
		  "servicename" : "OrchestrationEngine",
		  "servicetype" : "_orchestrationengine._json._http._tcp",
		  "serviceport" : config.listen.port,
		  "servicehost" : config.listen.ip,
		  "servicepath" : "/orchestrationengine/"
}
}, function(error, response, body) {
	console.log(body);
});

//---------------------------------------------------------------------------
app.get('/orchestrationengine/*', orchestrationengine.lookupOrchestrationStore, orchestrationengine.lookupServiceRegistry, orchestrationengine.matchServiceContract, orchestrationengine.sendResponse);



http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
