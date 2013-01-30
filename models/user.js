/*
 * USER MODEL - COntains all the database functions for a user
 */
var request = require('request');
var userRoutes = require('../routes/user.js');

var host = "http://127.0.0.1:5984/";
var db = "dischost/";


// CREATE NEW USER
exports.createUser = function(req, res, next) {
  var user = req.user;
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
        user._rev = body.rev;
        res.user = user;
        console.log("1")
        next();
      } 
    });
};