/*
 * MUSIC ROUTES - all the routing and app logic for music
 */
var uuid = require('node-uuid');
var db = require('../models/music.js');

exports.addmusic = function(req, res, next) {
  res.render('addmusic', { 
    title: 'Dischost - Add Music Release', 
    user: req.session.user
  });
};

// Take form data and pass to database for new music item
exports.addmusicitem = function(req, res, next) {
  if(req.method == "POST") {
    var item = {
      _id: uuid.v1(),
      collection: "music",
      user_id: req.session.user._id,
      artist: req.body.artist,
      title: req.body.title,
      label: req.body.label,
      year: req.body.year,
      format: req.body.format,
      review: req.body.review
    };
    req.body = item;
    // Put user into database
    db.createmusicitem(req, res, function(err) {
      if(err) {
        console.log("Error Saving Data");
        //TODO
        // handle error with status code
      }
      else {
        //item._rev = res.body.rev;
        //res.send(item);
        res.render('dash', { 
          title: 'Dischost - Success',
          user: req.session.user
        });
      }
    });
  }
  else {
    console.log("Not a post request - error");
  }
};

// HOMEPAGE of a music release
exports.musicpage = function(req, res) {
  var music = res.body;
  res.send(music)
};