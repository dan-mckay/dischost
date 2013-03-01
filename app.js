/**
 * This file handles the main configuration for the application
 */

// Import node modules (dependencies) that the app uses
var express = require('express');
var http = require('http');
var path = require('path');

var io = require('socket.io');
var https = require('https');
var follow = require('follow');
// Import routes for application
var routes = require('./routes');
var user = require('./routes/user');
var music = require('./routes/music');
var search = require('./routes/search');

var app = express();

//global variable for upload progress
progress = {};

// Set up a place in memory to store the session data
var MemStore = express.session.MemoryStore;

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon(__dirname + '/public/images/favicon.ico'));
  app.use(express.logger('dev'));
  app.use(express.bodyParser({ keepExtensions: true }));
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

var server = http.createServer(app);
io = io.listen(server);

// Stops socket.io from dealing with requests from other domains
io.configure(function () {
  io.set('authorization', function (handshakeData, callback) {
    if (handshakeData.xdomain) {
    callback('Cross-domain connections are not allowed');
    }
    else {
    callback(null, true);
    }
  });
});

server.listen(app.get('port'), function () {
  console.log("Express server listening on port " + app.get('port'));
});

app.get('/', routes.index);
app.get('/signup', user.signup);
app.get('/users', user.list);
app.post('/newuser', user.newUser);
app.get('/login', user.login);
app.get('/logout', user.logout);
app.post('/loginuser', user.loginUser);
app.get('/noauth', user.noAuth);

//requiresLogin below here
app.get('/dash', requiresLogin, user.dash);
app.get('/editprofile',requiresLogin, user.editprofile);
app.put('/edituser', requiresLogin, user.edituser);
app.post('/uploadavatar', requiresLogin, user.uploadavatar);
app.get('/users/:username', requiresLogin, user.userpage);

app.get('/addmusic', requiresLogin, music.addmusic);
app.post('/addmusicitem', requiresLogin, music.addmusicitem);
app.post('/addcomment', requiresLogin, music.addcomment);
app.get('/edittracks/:id', requiresLogin, music.edittracks);
app.get('/editmusic/:id', requiresLogin, music.editmusic);
app.post('/addtrack', requiresLogin, music.addtrack);
app.post('/uploadartwork', requiresLogin, music.uploadartwork);
app.post('/uploadtrack', requiresLogin, music.uploadtrack);
app.get('/music/:id', requiresLogin, music.musicpage);
app.post('/ratemusic', requiresLogin, music.ratemusic);

app.get('/search', requiresLogin, search.searchpage);
app.post('/search/user', requiresLogin, search.usersearch);
app.post('/search/music', requiresLogin, search.musicsearch);



function requiresLogin(req, res, next) {
  if(req.session.user) {
    next();
  }
  else {
    res.send(401);
    // next(new Error(401));
  }
};

// SOCKET.IO SERVER
io.sockets.on('connection', function(socket) {
  // Take in ID from upload track client
  socket.on('id', function(id) {
    socket._id = id;
  });
  // Emit progress to upload track client
  socket.on('uploadProgress', function() {
    socket.emit('progress', progress[socket._id]);
  });
  // Take in ID from musicpage client and listen for changes in rating
  socket.on('rating_id', function(id) {
    // Use the follow module to listen for changes in the database
    var options = { db: "https://everton.iriscouch.com/dischost", include_docs: true, since: "now" };
    follow(options, function(error, change) {
      if(!error) {
        io.sockets.emit('update', change.doc);
      }
    });
  });
    
    /*// Request feed from couchDB, callback on response
    https.get(host + path, function(response) {
      response.setEncoding('ascii');
      var message = "";   //variable that builds the string of chunks
      response.on('data', function(chunk) {
        message += chunk;
        var update = JSON.parse(message);
        // if the updated doc ID is the same as the rating ID sent by the client
        if(update.id == id) {
          console.log("getting document...");
          // Create another request to get updated document
          https.get(host + '/dischost/' + id, function(docResp) {
            // When response is returned, send to all connected clients
            docResp.setEncoding('ascii');
            docResp.on('data', function(doc) {
              
            });
          });
        }
      });
    });*/

  socket.on('disconnect', function() {
    console.log('socket disconnected');
  });
});



