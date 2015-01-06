var express = require('express');
var passport = require('passport');
var validator = require('validator');

var UserModel = require('../../models').UserModel;

var router = express.Router();

router.get('/', function(req, res) {
  if (req.isAuthenticated()){
    return res.redirect('/applications');
  }
  res.render('index', {
    'title': 'Home'
  });
});

router.get('/login', function(req, res){
  if (req.isAuthenticated()){
    return res.redirect('/applications');
  }
  res.render('base/login', {
    title: 'Login'
  });
});

router.post('/login',
  passport.authenticate('local', {
    failureRedirect: '/login?status=failed'
  }),
  function(req, res){
    res.redirect('/applications');
  }
);

router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/login');
});

router.get('/signup', function(req, res){
  res.render('base/signup', {
    title: 'Signup'
  });
});

router.post('/signup', function(req, res){
  var email = req.body.email;
  var password = req.body.password;

  if (!validator.isEmail(email)) {
    res.redirect('/signup');
    return;
  }

  UserModel.findOne({
    email: email
  })
  .exec()
  .then(function(user){
    if (!user) {
      UserModel.create({
        email: email,
        password: password
      })
      .then(function(user){
        res.redirect('/login?signedup=1');
      });
    } else {
      res.redirect('/signup?error=duplicate');
    }
  })
  .then(null, function(err){
    console.log(err);
    throw err;
    return;
  });
});

module.exports = router;