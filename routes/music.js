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
        console.log("Error Saving Music");
        //TODO
        // handle error with status code
      }
      else {
        var rating = createRating(item._id);
        req.body = rating;
        db.createitem(req, res, function(err) {
          if(err) {
            console.log("Error Saving Rating");
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
  else {
    console.log("Not a post request - error");
  }
};

// EDIT music release
exports.editmusic = function(req, res, next) {
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
        // Save the current music item to the session
        req.session.music = music;
        // If the current user is the owner of the music, show them their version of the page
        if(music.user_id === req.session.user._id) {
          res.render('editmusic', { 
            title: 'Dischost: ' + music.artist + ' - ' + music.title,
            item: music
          });
        }
        else {
          res.send(401);  // No authorisation - the music belongs to someone else
        }
      }
    }
  });
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
        var rating = rows[3];
        // If the current user is the owner of the music, show them their version of the page
        if(music.user_id === req.session.user._id) {
          res.render('usermusicpage', { 
            title: 'Dischost: ' + music.artist + ' - ' + music.title,
            item: music,
            comments: comments,
            tracklist: tracks,
            rating: rating
          });
        }
        else {
          res.render('musicpage', { 
            title: 'Dischost: ' + music.artist + ' - ' + music.title,
            item: music,
            comments: comments,
            tracklist: tracks,
            rating: rating
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

        //Set upload progress to session user
        progress[req.session.user._id] = 0;

        res.render('edittracks', { 
          title: 'Edit Tracks: ' + music.artist + ' - ' + music.title,
          user: req.session.user,
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
      number: parseInt(req.body.number)
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

exports.uploadartwork = function(req, res, next) {
  var upload = req.files.artwork;
  // If the file is not an image of these common types
  if(upload.mime != "image/jpeg" && upload.mime != "image/png" && upload.mime != "image/gif") {
    res.send(415);      // Unsupported Media Type HTTP error code
  }
  // If image size > 5MB (5242880 bytes)
  else if(upload.size > 5242880) {
    res.send(413);    // Request Entity Too Large HTTP error code
  }
  else {
    // Update music in db, adding the filename as avatar
    var artwork = encodeURIComponent(upload.name);
    req.session.music.artwork = artwork;
    req.body = req.session.music;
    db.editMusicDetails(req, res, function(err) {
      if(err) {
        console.log("Error Uploading Image");
        //TODO
        // handle error with status code
      }
      else {
        // Update revision number and upload image to database
        req.session.music._rev = res.body.rev;
        req.body = req.session.music;
        db.uploadImage(req, res, function(err) {
          if(err) {
            console.log("Error Uploading Image");
            //TODO
            // handle error with status code
          }
          else {
            res.redirect('/music/' + req.session.music._id);
          }
        });
      }
    });
  }
};

exports.uploadtrack = function(req, res, next) {
  var upload = req.files.track;
  // If the file is not an mp3
  if(upload.mime != "audio/mp3") {
    res.send(415);      // Unsupported Media Type HTTP error code
  }
  else {
    db.uploadMp3(req, res, function(err) {
      if(err) {
        console.log("Error Uploading mp3");
        //TODO
        // handle error with status code
      }
      else {
        progress[req.session.user._id] = 0;   //reset the upload progress variable for this session
        res.redirect('/edittracks/' + req.body.music_id);
      }
    });
  }
};

// Loop through the rows returned by db query and split them
// into music comments and tracks objects and return them as an array
function splitMusicData(rows) {
  var music;
  var comments = [];
  var tracks = [];
  var rating;
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
    if(rows[i].value.collection == "rating") {
      rating = rows[i].value;
      console.log("rating")
    }
  }
  return[music, comments, tracks, rating];
};

// This function is used to create a rating for a new music item
// initially all the values will be set to zero for the rating
function createRating(musicId) {
  var item = {
    _id: uuid.v1(),
    collection: "rating",
    music_id: musicId,
    avg: 0,
    ratings: [0, 0, 0, 0, 0]
  };
  return item;
};