var express = require('express');
var passport = require('passport');

var UserModel = require('../../models').UserModel;

var router = express.Router();

router.get('/', function(req, res) {
  res.render('index', {
    'title': 'Home'
  });
});

router.get('/login', function(req, res){
  res.render('base/login', {
    title: 'Login'
  });
});

router.post('/login',
  passport.authenticate('local', {
    failureRedirect: 'login'
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
  UserModel.create({
    email: email,
    password: password
  })
  .then(function(user){
    res.redirect('/applications');
  })
});

module.exports = router;