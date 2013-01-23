
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Dischost - Catalogue Your Music' });
};

exports.signup = function(req, res) {
	res.render('signup', { title: 'Dischost - Signup', countryList: countries });
};