
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Dischost - Catalogue Your Music' });
};