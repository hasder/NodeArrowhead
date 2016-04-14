
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , serviceregistry = require('./routes/serviceregistry')
  , http = require('http')
  , path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 1100);
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

//---------------------------------------------------------------------------
//Service Registry routes
//serviceregistry.init();
app.get('/serviceregistry/service',serviceregistry.service);
app.get('/serviceregistry/service/:name',serviceregistry.service);
app.get('/serviceregistry/type',serviceregistry.type);
app.get('/serviceregistry/type/:type',serviceregistry.type);
app.post('/serviceregistry/publish',serviceregistry.publish);
app.post('/serviceregistry/unpublish',serviceregistry.unpublish);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
