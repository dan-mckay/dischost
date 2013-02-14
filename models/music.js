/*
 * MUSIC MODEL - Contains all the database functions for music
 */
var querystring = require('querystring');
var request = require('request');

var host = "http://127.0.0.1:5984/";
var db = "dischost/";

// CREATE NEW MUSIC ITEM
exports.createmusicitem = function(req, res, next) {
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
        next();
      } 
    });
};