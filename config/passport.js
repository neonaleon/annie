var LocalStrategy = require('passport-local').Strategy;

var UserModel = require('../models').UserModel;

module.exports = function(passport){

  // serialize into session
  passport.serializeUser(function(user, done){
    // here, only the id is serialized, in order to keep the session small
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done){
    // the id can then be deserialized using the database
    UserModel.findOne({ _id: id }, function(err, user){
      done(err, user);
    });
  });

  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  }, function verify(email, password, done){
    UserModel.findOne({ email: email }, function(err, user){
      if (err) return done(err);
      if (!user){
        return done(null, false);
      }
      if(!user.checkPassword(password)){
        return done(null, false);
      }
      return done(null, user);
    });
  }));

  passport.protectedRoute = function(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/login');
  };
};