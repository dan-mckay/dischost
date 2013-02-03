/**
 * This file handles the main configuration for the application
 */

// Import node modules (dependencies) that the app uses
var express = require('express');
var http = require('http');
var path = require('path');
// Import routes for application
var routes = require('./routes');
var user = require('./routes/user');


var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon(__dirname + '/public/images/favicon.ico'));
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.cookieParser('This~String~Is~Secret'));
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/signup', user.signup);
app.get('/users', user.list);
app.post('/newUser', user.newUser);
app.get('/login', user.login);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
