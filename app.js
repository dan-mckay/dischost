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

// Set up a place in memory to store the session data
var MemStore = express.session.MemoryStore;

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon(__dirname + '/public/images/favicon.ico'));
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({secret: 'ThisStringIsSecret', store: MemStore({
    reapInterval: 60000 * 10
  })}));
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
app.post('/newuser', user.newUser);
app.get('/login', user.login);
app.get('/logout', user.logout);
app.post('/loginuser', user.loginUser);
app.get('/noauth', user.noAuth);
app.get('/users/:username', user.userpage);
app.get('/dash', requiresLogin, user.dash);
app.get('/editprofile',requiresLogin, user.editprofile);
app.put('/edituser', requiresLogin, user.edituser)

function requiresLogin(req, res, next) {
  if(req.session.user) {
    next();
  }
  else {
    res.send(401);
    // next(new Error(401));
  }
};

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
