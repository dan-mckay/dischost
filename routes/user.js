/*
 * This file contains all the routes corresponding to a user
 */

var nano = require('nano')('http://localhost:5984');
var countries = require('../data/countries.js');

var db = nano.db.use('dischost');

exports.signup = function(req, res) {
	res.render('signup', { title: 'Dischost - Signup', countryList: countries });
};

exports.list = function(req, res) {
  res.send("respond with a resource");
};

exports.newuser = function(req, res) {
	
};