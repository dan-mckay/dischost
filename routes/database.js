/*
 * This file contains the REST api routes for accessing the
 * CouchDB database
 */
var nano = require('nano')('http://localhost:5984');

var dischostDB = nano.db.use('dischost');

exports.newuser = function(req, res) {
  var user = {
    _id: req.body.username,
    collection: "user",
    country: req.body.country,
    email: req.body.email,
    password: req.body.password
  }
	dischostDB.insert(user, function(err, body) {
    if (!err)
      console.log(body);
  });
};