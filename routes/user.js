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

exports.noAuth = function(req, res, next) {
  res.send("NOT AUTHORIZED");
  //TODO
  // redirect to a page
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
    // Put user into database
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

exports.logout = function(req, res) {
  delete req.session.user;
  res.redirect('/');
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
          if(user.username === req.body.username && user.password === req.body.password) {
            req.session.user = user;
            /*res.render('userhome/' + user.username, { 
              title: 'Dischost - User Homepage', 
              user: user 
            });*/
            res.redirect('dash');
          }
        }
        else {
          res.send('<p>User Not Found</p>')
        }
      }
    });
  }
  else {
    console.log("Not a post request - error");
  }
};

exports.userpage = function(req, res) {
  req.body.username = req.params.username;
  db.getUserByName(req, res, function(err) {
      if(err) {
        console.log("Error Getting User");
        //TODO
        // handle error with status code
      }
      else {
        if(res.body.rows.length === 1) {
          var user = res.body.rows[0].value;
          //res.render('userhome/' + user.username, { title: 'Dischost - User Homepage', user: user });
          res.send(user);
        }
        else {
          res.send('<p>User Not Found</p>')
        }
      }
    });
};

exports.dash = function(req, res) {
  res.render('dash', { 
    title: 'Dischost: ' + req.session.user.username + ' dash',
    user: req.session.user 
  });
};

exports.editprofile = function(req, res) {
  res.render('editprofile', { 
    title: 'Dischost: ' + req.session.user.username + ' edit',
    user: req.session.user, 
    countryList: countries 
  });
};

exports.edituser = function(req, res, next) {
    if(req.method == "PUT") {
      var user = {
        _id: req.session.user._id,
        username: req.body.username,
        collection: "user",
        country: req.body.country,
        email: req.body.email,
        password: req.body.password, 
        _rev: req.session.user._rev
      };
      req.body = user;         // Set req body to updated user details
      // Put user into database
      db.editUserDetails(req, res, function(err) {
        if(err) {
          console.log("Error Saving Data");
          //TODO
          // handle error with status code
        }
        else {
          // Update sesssion user object
          req.session.user = user;
          req.session.user._rev = res.body.rev;
          res.redirect('dash');
        }
      });
    }
    else {
      console.log("Not a put request - error");
    }
};