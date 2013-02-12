/*
 * USER ROUTES - all the routing and app logic for a user
 */
var uuid = require('node-uuid');
var db = require('../models/user.js');
var countries = require('../data/countries.js');

exports.signup = function(req, res) {
	res.render('signup', { title: 'Dischost - Signup', countryList: countries });
};

exports.list = function(req, res) {
  res.send("respond with a resource");
};

exports.newUser = function(req, res, next) {
  if(req.method == "POST") {
    var user = {
      _id: uuid.v1(),
      username: req.body.username,
      collection: "user",
      country: req.body.country,
      email: req.body.email,
      password: req.body.password
    };
    req.body = user;
    console.log("route user: " + req.body)
    db.createUser(req, res, function(err) {
      if(err) {
        console.log("Error Saving Data");
        //TODO
        // handle error with status code
      }
      else {
        res.render('success', { title: 'Dischost - Success' });
      }
    });
    
  }
  else {
    console.log("Not a post request - error");
  }
};

exports.login = function(req, res) {
  res.render('login', { title: 'Dischost - Login' });
};

exports.loginUser = function(req, res) {
  if(req.method == "POST") {
    db.getUserByName(req, res, function(err) {
      if(err) {
        console.log("Error Getting User");
        //TODO
        // handle error with status code
      }
      else {
        if(res.body.rows.length === 1) {
          var user = res.body.rows[0].value;
          console.log(user);
          //res.render('user', { title: 'Dischost - User Homepage' });
        }
        else {
          console.log("No User Found");
        }
      }
    });
  }
  else {
    console.log("Not a post request - error");
  }
};
