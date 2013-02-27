/*
 * SEARCH ROUTES - all the routing and app logic for search
 */
var db = require('../models/search.js');

// RENDER SEARCH FORM
exports.searchpage = function(req, res, next) {
  res.render('search', { 
    title: 'Dischost - Search', 
    user: req.session.user
  });
};

// ROUTE FOR USER SEARCH
exports.usersearch = function(req, res, next) {
  if(req.method == "POST") {
    // Put user into database
    db.findUser(req, res, function(err) {
      if(err) {
        console.log("Error Finding User");
        //TODO
        // handle error with status code
      }
      else {
        var response = res.body;
        console.log(res.body)
        if(response.rows.length === 0) {
          response.message = "Your search returned no results";
        }
        else {
          response.message = "Not what you were looking for?";
        }
        res.render('results', { title: 'Dischost - Success', results: response });
      }
    });
  }
  else {
    console.log("Not a post request - error");
  }
}

// ROUTE FOR USER SEARCH
exports.musicsearch = function(req, res, next) {
  if(req.method == "POST") {
    // Put user into database
    db.findMusic(req, res, function(err) {
      if(err) {
        console.log("Error Finding User");
        //TODO
        // handle error with status code
      }
      else {
        var response = res.body;
        console.log(res.body)
        if(response.rows.length === 0) {
          response.message = "Your search returned no results";
        }
        else {
          response.message = "Not what you were looking for?";
        }
        res.render('results', { title: 'Dischost - Success', results: response });
      }
    });
  }
  else {
    console.log("Not a post request - error");
  }
}