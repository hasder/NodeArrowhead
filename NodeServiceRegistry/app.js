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
  , serviceregistry = require('./routes/serviceregistry')
  , http = require('http')
  , path = require('path')
  , coap = require('coap')
  , config = require('./config');
  //, server_ipv6 = coap.createServer({ type:'udp6' });

var app = express();

// all environments
app.set('port', process.env.PORT || config.listen.http.port); //1100
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

//---------------------------------------------------------------------------
//Service Registry routes
//serviceregistry.init();
app.get('/servicediscovery/service', serviceregistry.service);
app.get('/servicediscovery/service/:name', serviceregistry.service);
app.get('/servicediscovery/type', serviceregistry.type);
app.get('/servicediscovery/type/:type', serviceregistry.type);
app.post('/servicediscovery/publish', serviceregistry.publish);
app.post('/servicediscovery/unpublish', serviceregistry.unpublish);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


var server = coap.createServer();
//server.on('get', function(req, res) {
//	if(req.url.split('/')[1] === "servicedirectory") {
//		if (req.url.split('/')[2] 			=== "service") {
//			serviceregistry.service_coap(req, res);
//		} else if (req.url.split('/')[2] 	=== "type") {
//			serviceregistry.type_coap(req, res);
//		} else {
//			res.end('wrong usage');
//		}
//	} else {
//		res.end('wrong usage');
//	}
//});

server.on('request', function(req, res) {
	console.log('received request req:' + req.method + " payload     " + req.payload);
	
	var usage_err = null;
	var urlsegments = req.url.split('/');
	if(urlsegments[1] === "servicediscovery") {
		if(req.method === "GET") {
			if (urlsegments[2] 			=== "service") {
				serviceregistry.service_coap(req, res);
			} else if (urlsegments[2] 	=== "type") {
				serviceregistry.type_coap(req, res);
			} else {
				usage_err = true;
			}
		} else if (req.method === "POST") {
			if (urlsegments[2] 			=== "publish") {
				serviceregistry.publish_coap(req, res);
			} else if (urlsegments[2] 	=== "unpublish") {
				serviceregistry.unpublish_coap(req, res);
			} else {
				usage_err = true;
			}
		} else {
			usage_err = true;
		}
	}  else {
		usage_err = true;
	}
	
	if(usage_err) {
		res.end('wrong usage');
	}
});

//server.listen(5683, "FDFD:55::80FF", function() {
server.listen(config.listen.coap.port, config.listen.coap.ip, function() {
  console.log('server started ' + server._port);
});
