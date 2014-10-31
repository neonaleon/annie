var express = require('express');
var router = express.Router();

var cors = require('cors');

var corsOptionsDelegate = function(req, callback){
  // dynamic whitelisting
  var corsOptions = { origin: false };
  // TODO: check the req's API_KEY and pull DB for the registered domain, whitelist it.
  if (req.hostname == '10.25.11.45'){
    corsOptions = { origin: true };
  }
  callback(null, corsOptions);
}

router.use(cors(corsOptionsDelegate));

router.use(require('./track'));
// router.use(require('./identify'));
// router.use(require('./page'));

module.exports = router;