var express = require('express');
var router = express.Router();
var crypto = require('crypto');

var models = require('../models');
var ApplicationModel = models.ApplicationModel;

router.get('/', function(req, res){
  ApplicationModel.find({}).exec(function(err, apps){
    res.render('applications/index', {
      'apps': apps
    });
  })
});

router.get('/new', function(req, res){
  res.render('applications/new');
});

router.post('/new', function(req, res){
  console.log(req.body);
  var hmac = crypto.createHmac('sha1', 'some random key');
  hmac.update(req.body.domain);
  var hash = hmac.digest('base64');
  ApplicationModel.create({
    appName: req.body.appName,
    domains: [req.body.domain],
    apiKey: hash
  })
  res.status(200).redirect('/applications');
})

module.exports = router;