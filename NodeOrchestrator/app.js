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

/**
 * Module dependencies.
 */

var express = require('express')
//  , routes = require('./routes')
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
app.get('/orchestrationstore/configuration/:target', orchestrationstore.getExpression);
app.post('/orchestrationstore/configuration/publish', orchestrationstore.postExpression);
app.post('/orchestrationstore/configuration/delete', orchestrationstore.deleteExpression);


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
