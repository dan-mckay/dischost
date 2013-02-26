/*
 * USER ROUTES - all the routing and app logic for a user
 */
var uuid = require('node-uuid');
var fs = require('fs');
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

exports.dash = function(req, res, next) {
  var music = [];     // Array to store user's collection of music
  var comments = [];  // Array to store user's comments
  var j = 0;          // Counter variable for loop
  var k = 0;
  // Set the user to be request body and query the database
  req.body = req.session.user;    
  db.getUserDash(req, res, function(err) {
    if(err) {
        console.log("Error Getting User Dash");
        //TODO
        // handle error with status code
    }
    else {
      var rows = res.body.rows;
      req.session.user = rows[0].value;
      if(rows.length > 1) {
        // rows[0] is the user document, so if more than that is returned
        // loop through adding the data to their respective array
        for(var i = 0; i != rows.length; i ++) {
          if(rows[i].value.collection == "music") {
            music[j] = {
              artist: rows[i].value.artist,
              title: rows[i].value.title,
              _id: rows[i].value._id
            };
            j++;
          }
          else if(rows[i].value.collection == "comments") {
            comments[k] =  { 
              artist: rows[i].value.artist,
              title: rows[i].value.title,
              content: rows[i].value.content,
              music_id: rows[i].value .music_id
            };
            k++;
          }
        }
      }
      // render user dash page with data
      res.render('dash', { 
        title: 'Dischost: ' + req.session.user.username + ' dash',
        user: req.session.user,
        music: music,
        comments: comments
      });
    }
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

exports.uploadavatar = function(req, res, next) {
  var upload = req.files.avatar;
  // If the file is not an image of these common types
  if(upload.mime != "image/jpeg" && upload.mime != "image/png" && upload.mime != "image/gif") {
    res.send(415);      // Unsupported Media Type HTTP error code
  }
  // If image size > 5MB (5242880 bytes)
  else if(upload.size > 5242880) {
    res.send(413);    // Request Entity Too Large HTTP error code
  }
  else {
    // Update user in db, adding the filename as avatar
    var avatar = encodeURIComponent(upload.name);
    req.session.user.avatar = avatar;
    req.body = req.session.user;
    db.editUserDetails(req, res, function(err) {
      if(err) {
        console.log("Error Uploading Image");
        //TODO
        // handle error with status code
      }
      else {
        // Update revision number and upload image to database
        req.session.user._rev = res.body.rev;
        req.body = req.session.user;
        db.uploadImage(req, res, function(err) {
          if(err) {
            console.log("Error Uploading Image");
            //TODO
            // handle error with status code
          }
          else {
            res.redirect('dash');
          }
        });
      }
    });
  }
};