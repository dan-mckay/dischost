/*
 * This file contains the REST api routes for accessing the
 * CouchDB database
 */
var request = require('request');
var uuid = require('node-uuid');
var host = "http://127.0.0.1:5984/";
var db = "dischost/";


// CREATE NEW USER
exports.newuser = function(req, res) {
  // user info from POST request
  var user = {
    _id: uuid.v1(),
    username: req.body.username,
    collection: "user",
    country: req.body.country,
    email: req.body.email,
    password: req.body.password
  };
  console.log(user._id)
  // use the "request" module to build the request to database
  request.put( {
    url: host + db + user._id,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user)
    }, 
    function (error, response, body) {
      if(error) {
        console.log(error);
      }
      if(response.statusCode == 201) {
        console.log('Status Update');
        res.send(user);
      } 
      else {
        console.log('error: '+ response.statusCode);
        console.log(body);
      }
    });
};