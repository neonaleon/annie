var express = require('express');
var router = express.Router();

var cors = require('cors');

var ApplicationModel = require('../../models/application');

var corsOptionsDelegate = function(req, callback){
  // dynamic whitelisting
  var corsOptions = { origin: false };
  // TODO: check the req's API_KEY and pull DB for the registered domain, whitelist it.
  // if (req.hostname == '10.25.11.45'){
  //   corsOptions = { origin: true };
  // }
  callback(null, corsOptions);
}

router.use(cors(corsOptionsDelegate));

// API middleware for identifying application from apiKey.
// adds app variable to req
router.use(function(req, res, next){
  var apiKey = req.get('X-API-KEY');
  // TODO: apiKey is simply the app's _id for now
  ApplicationModel.findOne({ _id: apiKey }).exec(function(err, app){
    if (!app){
      var error = new Error();
      error.name = 'Non-existent Application';
      error.message = 'Application with apiKey ' + apiKey + ' does not exist!';
      next(error);
    } else {
      req.app = app;
      next();
    }
  });
});

router.use(require('./track'));
// router.use(require('./identify'));
// router.use(require('./page'));

// API error handler
router.use(function(err, req, res, next){
  res.status(400).send('Bad Request');
});

module.exports = router;