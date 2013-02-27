/**
 * This file handles the main configuration for the application
 */

// Import node modules (dependencies) that the app uses
var express = require('express');
var http = require('http');
var path = require('path');
var io = require('socket.io');
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

app.get('/search', requiresLogin, search.searchpage);
app.post('/search/user', requiresLogin, search.usersearch);
app.post('/search/music', requiresLogin, search.musicsearch);

// WEBPAGE TEST STUFF
app.get('/user/music', function(req, res) {
  var item1 = { 
        artist: "Kraftwerk",
        title: "The Man Machine",
        label: "EMI",
        year: "1981",
        format: "LP",
        review: "Curabitur quis dolor nibh. Vestibulum mollis pulvinar metus vitae commodo. Suspendisse a sapien rhoncus purus aliquam iaculis sit amet id dolor. Praesent pharetra, neque quis volutpat iaculis, nunc nunc tincidunt turpis, non lobortis nisl nunc blandit mauris. Fusce facilisis, felis aliquam sagittis eleifend, lacus elit ultrices mauris, nec commodo dolor orci a tellus. Maecenas sit amet elementum orci. Curabitur quam mi, ultrices volutpat ultrices eu, ornare eget nibh. In hac habitasse platea dictumst."
      };
  var comments = [
        {username: "Daniel", comment: "I love this album!"},
        {username: "Miriam", comment: "I can't stand it. I hate Kraftwerk"},
        {username: "John", comment: "I haven't heard it."},
        {username: "Roisin", comment: "Me neither."},
        {username: "VerboseBore", comment: "Curabitur quis dolor nibh. Vestibulum mollis pulvinar metus vitae commodo. Suspendisse a sapien rhoncus purus aliquam iaculis sit amet id dolor. Praesent pharetra, neque quis volutpat iaculis, nunc nunc tincidunt"}
  ];
  res.render('musicpage', { 
    title: "blah",
    item: item1,
    comments: comments
  });
});

app.get('/results', function(req, res) {
  var results = {
    msg: 'Not what you were looking for?',
    resultlist: [
      { name: 'Daniel', link: '/users/Daniel'}
    ]
  }
  res.render('results', {
    title: "Search",
    results: results
  });
});

app.get('/user/edittracks', function(req, res) {
  var item1 = { 
        artist: "Kraftwerk",
        title: "The Man Machine",
        label: "EMI",
        year: "1981",
        format: "LP",
        review: "Curabitur quis dolor nibh. Vestibulum mollis pulvinar metus vitae commodo. Suspendisse a sapien rhoncus purus aliquam iaculis sit amet id dolor. Praesent pharetra, neque quis volutpat iaculis, nunc nunc tincidunt turpis, non lobortis nisl nunc blandit mauris. Fusce facilisis, felis aliquam sagittis eleifend, lacus elit ultrices mauris, nec commodo dolor orci a tellus. Maecenas sit amet elementum orci. Curabitur quam mi, ultrices volutpat ultrices eu, ornare eget nibh. In hac habitasse platea dictumst."
      };
  res.render('edittracks', { 
    title: "edit tracks",
    item: item1
  });
});


function requiresLogin(req, res, next) {
  if(req.session.user) {
    next();
  }
  else {
    res.send(401);
    // next(new Error(401));
  }
};

/*http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});*/

io.sockets.on('connection', function(socket) {
  
  socket.on('id', function(id) {
    socket._id = id;
  });

  socket.on('uploadProgress', function() {
    socket.emit('progress', progress[socket._id]);
  });

  socket.on('disconnect', function() {
    console.log('socket disconnected');
  });
});
