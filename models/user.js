/*
 * USER MODEL - COntains all the database functions for a user
 */
var querystring = require('querystring');
var request = require('request');
var fs = require('fs');

var host = "https://everton.iriscouch.com/";
var db = "dischost/";
var userView = "_design/user/_view/";

// CREATE NEW USER
exports.createUser = function(req, res, next) {
  var user = req.body;
  // use the "request" module to build the request to database
  request.put( {
      url: host + db + user._id,
      json: user
    }, 
    function (err, response, body) {
      if(err) {
        throw new Error(err);
      }
      if(response.statusCode == 201) {
        console.log('Status Code: ' + response.statusCode);
        next();
      } 
    });
};

// FIND USER IN DB BY USERNAME
exports.getUserByName = function(req, res, next) {
  // Build the URL to query couchDB
  var name = '"' + req.body.username + '"';
  var urlString = querystring.stringify({ reduce: 'false', key: name });
  var thisView = userView + "find?";
  // Make request to couchDB, callback function handles result
  console.log(host + db + thisView + urlString)
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

exports.getUserDash = function(req, res, next) {
  var id = '"' + req.body._id + '"';
  var thisView = userView + "dash?";
  var urlString = querystring.stringify({ 
    reduce: 'false',
    startkey: '[' + id +']',
    endkey:  '[' + id + ', 3]'
  });
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
exports.editUserDetails = function(req, res, next) {
  var user = req.body;
  // use the "request" module to build the request to database
  request.put( {
      url: host + db + user._id,
      json: user
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
  var upload = req.files.avatar;
  var user = req.body;
  var name = encodeURIComponent(upload.name);
  var destPath = host + db + user._id + '/' + name + '?rev=' + user._rev;
  fs.readFile(upload.path, function(error, data) {
    if(error) {
      throw new Error(error);
    }
    request.put( {
      uri: destPath,
      headers: {
        "Content-Type": upload.mime,
        "Content-Length": upload.length
      },
      body: data
    }, 
    function (err, response, body) {
      if(err) {
        throw new Error(err);
      }
      if(response.statusCode == 201) {
        console.log('Status Code: ' + response.statusCode);
        res.body = JSON.parse(response.body);
        next();
      } 
    });
  });
};

