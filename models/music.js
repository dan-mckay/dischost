/*
 * MUSIC MODEL - Contains all the database functions for music
 */
var querystring = require('querystring');
var request = require('request');
var fs = require('fs');


var host = "https://everton.iriscouch.com/";
var db = "dischost/";
var musicView = "_design/music/_view/";

// CREATE NEW ITEM
exports.createitem = function(req, res, next) {
  var item = req.body;
  // use the "request" module to build the request to database
  request.put( {
      url: host + db + item._id,
      json: item
    }, 
    function (err, response, body) {
      if(err) {
        throw new Error(err);
      }
      if(response.statusCode == 201) {
        console.log('Status Code: ' + response.statusCode);
        res.body = response.body;
        next();
      } 
    });
};

// FIND MUSIC IN DB BY ID
exports.getMusicById = function(req, res, next) {
  // Build the URL to query couchDB
  var id = '"' + req.body.id + '"';
  var urlString = querystring.stringify({ 
    reduce: 'false', 
    startkey: '[' + id +']',
    endkey:  '[' + id + ', 2, {}]' 
  });
  var thisView = musicView + "musicpage?";
  console.log(host + db + thisView + urlString)
  // Make request to couchDB, callback function handles result
  request.get( {
    url: host + db + thisView + urlString,
  }, 
  function (err, response, body) {
    if(err) {
      throw new Error(err);
    }
    if(response.statusCode == 200) {
      console.log('Status Code: ' + response.statusCode);
      // Get response from couch, parse it and add it to the res object
      res.body = JSON.parse(response.body);
      // Return to the routes function
      next();
    } 
  });
}

// EDIT USER
exports.editMusicDetails = function(req, res, next) {
  var music = req.body;
  // use the "request" module to build the request to database
  request.put( {
      url: host + db + music._id,
      json: music
    }, 
    function (err, response, body) {
      if(err) {
        throw new Error(err);
      }
      if(response.statusCode == 201) {
        console.log('Status Code: ' + response.statusCode);
        res.body = response.body;
        next();
      } 
    });
};

exports.uploadImage = function(req, res, next) {
  var upload = req.files.artwork;
  var music = req.body;
  var name = encodeURIComponent(upload.name);
  var destPath = host + db + music._id + '/' + name + '?rev=' + music._rev;
  var requestStream = request.put(destPath);

  requestStream.on('response', function(response) {
    if(response.statusCode == 201) {
      console.log('Status Code: ' + response.statusCode);
      next();
    } 
  });

  requestStream.on('error', function(error) {
    throw new Error(error);
  });

  fs.createReadStream(upload.path).pipe(requestStream);
};

exports.uploadMp3 = function(req, res, next) {
  var upload = req.files.track;
  var destPath = host + db + req.body.track_id + '/track.mp3?rev=' + req.body.rev;
  console.log(destPath)
  var readStream = fs.createReadStream(upload.path);
  var requestStream = request.put(destPath);

  var sum = 0;
  var percent = 0;
  var id = req.session.user._id;

  readStream.on('data', function(chunk) {
    sum = sum + chunk.length;
    percent = Math.round(sum / upload.size * 100);
    // Emit the percentage through socket.io
    //io.emit('uploadProgress', percent);
    progress[req.session.user._id] = percent;
    console.log(progress);
  })

  requestStream.on('response', function(response) {
    if(response.statusCode == 201) {
      console.log('Status Code: ' + response.statusCode);
      progress[req.session.user._id] = 0;   // reset progress value for this user
      next();
    } 
  });

  requestStream.on('error', function(error) {
    throw new Error(error);
  });

  readStream.pipe(requestStream);
};