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
    db.createitem(req, res, function(err) {
      if(err) {
        console.log("Error Saving Data");
        //TODO
        // handle error with status code
      }
      else {
        //item._rev = res.body.rev;
        //res.send(item);
        res.redirect('dash');
      }
    });
  }
  else {
    console.log("Not a post request - error");
  }
};

// HOMEPAGE of a music release
exports.musicpage = function(req, res, next) {
  var id = req.params.id;
  req.body.id = id;
  db.getMusicById(req, res, function(err) {
    if(err) {
      console.log("Error Getting Data");
      //TODO
      // handle error with status code
    }
    else {
      if(res.body.rows.length > 0) {
        var rows = splitMusicData(res.body.rows);
        var music = rows[0];
        var comments = rows[1];
        var tracks = rows[2];
        // If the current user is the owner of the music, show them their version of the page
        if(music.user_id === req.session.user._id) {
          res.render('usermusicpage', { 
            title: 'Dischost: ' + music.artist + ' - ' + music.title,
            item: music,
            comments: comments,
            tracklist: tracks
          });
        }
        else {
          res.render('musicpage', { 
            title: 'Dischost: ' + music.artist + ' - ' + music.title,
            item: music,
            comments: comments,
            tracklist: tracks
          });
        }
      }
    }
  });
};

// Take form data and pass to database for new comment
exports.addcomment = function(req, res, next) {
  if(req.method == "POST") {
    var item = {
      _id: uuid.v1(),
      artist: req.body.artist,
      collection: "comments",
      content: req.body.content,
      music_id: req.body.music_id,
      title: req.body.title,
      user_id: req.session.user._id,
      username: req.session.user.username
    };
    req.body = item;
    // Put comment into database
    db.createitem(req, res, function(err) {
      if(err) {
        console.log("Error Saving Data");
        //TODO
        // handle error with status code
      }
      else {
        res.redirect('/music/' + item.music_id);
      }
    });
  }
  else {
    console.log("Not a post request - error");
  }
};

exports.edittracks = function(req, res, next) {
  var id = req.params.id;
  req.body.id = id;
  db.getMusicById(req, res, function(err) {
    if(err) {
      console.log("Error Getting Data");
      //TODO
      // handle error with status code
    }
    else {
      if(res.body.rows.length > 0) {
        var rows = splitMusicData(res.body.rows);
        var music = rows[0];
        var tracks = rows[2];
        res.render('edittracks', { 
          title: 'Edit Tracks: ' + music.artist + ' - ' + music.title,
          item: music,
          tracklist: tracks
        });
      }
    }
  });
};

// Take form data and pass to database for new comment
exports.addtrack = function(req, res, next) {
  if(req.method == "POST") {
    var item = {
      _id: uuid.v1(),
      collection: "tracks",
      music_id: req.body.music_id,
      title: req.body.title,
      number: req.body.number
    };
    req.body = item;
    // Put user into database
    db.createitem(req, res, function(err) {
      if(err) {
        console.log("Error Saving Data");
        //TODO
        // handle error with status code
      }
      else {
        res.redirect('/edittracks/' + item.music_id);
      }
    });
  }
  else {
    console.log("Not a post request - error");
  }
};

// Loop through the rows returned by db query and split them
// into music comments and tracks objects and return them as an array
function splitMusicData(rows) {
  var music;
  var comments = [];
  var tracks = [];
  var j = 0; // Counter for comments array
  var k = 0; // Counter for tracks array
  for(var i = 0; i != rows.length; i++) {
    if(rows[i].value.collection == "music") {
      music = rows[i].value;
    }
    else if(rows[i].value.collection == "comments") {
      comments[j] = rows[i].value;
      j++;
    }
    else if(rows[i].value.collection == "tracks") {
      tracks[k] = rows[i].value;
      k++;
    }
  }
  return[music, comments, tracks];
};
