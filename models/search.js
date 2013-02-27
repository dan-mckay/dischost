/*
 * SEARCH MODEL - Contains all the database functions for search
 */
var querystring = require('querystring');
var request = require('request');

var host = "https://everton.iriscouch.com/";
var db = "dischost/";
var musicView = "_design/music/_view/";
var userView = "_design/user/_view/";

// FIND USER FROM SEARCH TERM ENTERED
exports.findUser = function(req, res, next) {
  // Build the URL to query couchDB
  var urlString = querystring.stringify({ 
    reduce: 'false', 
    startkey: '"' + req.body.searchterm + '"',
    endkey:  '"' + req.body.searchterm + '\ufff0"'
  });
  var thisView = userView + "find?";
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
      //res.body = response.body;
      // Return to the routes function
      next();
    } 
  });
}

// FIND MUSIC ITEM FROM SEARCH TERM ENTERED
exports.findMusic = function(req, res, next) {
  // Build the URL to query couchDB
  var urlString = querystring.stringify({ 
    reduce: 'false', 
    startkey: '"' + req.body.searchterm + '"',
    endkey:  '"' + req.body.searchterm + '\ufff0"'
  });
  var thisView = musicView + "findtitle?";
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
      //res.body = response.body;
      // Return to the routes function
      next();
    } 
  });
}