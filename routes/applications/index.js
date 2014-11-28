var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var fs = require('fs');
var path = require('path');

var models = require('../../models');
var UserModel = models.UserModel;
var ApplicationModel = models.ApplicationModel;
var MetricModel = models.MetricModel;
var EventModel = models.EventModel;

router.get('/', function(req, res){
  UserModel
    .findOne({ _id: req.user })
    .populate('applications')
    .exec(function(err, user){
      console.log(user.applications);
      res.render('applications/index', {
        'title': 'Applications',
        'apps': user.applications
      });
    });
});

router.get('/add', function(req, res){
  res.render('applications/add');
});

router.post('/add', function(req, res){
  var app = new ApplicationModel({

  });
  ApplicationModel.create({
    appName: req.body.appName
  })
  .then(function(app){
    UserModel
      .findOne({ _id: req.user })
      .exec()
      .then(function(user){
        user.applications.push(app);
        user.save(function(err){
          res.redirect('/applications');
        });
      })
      .then(null, function(err){ // mongoose Promise error callback
        throw err;
      })
      .end();
  })
  .end();
});

router.get('/:appId/edit', function(req, res){
  ApplicationModel.findOne({ _id: req.params.appId }).exec(function(err, app){
    app.title = app.title || 'Edit';
    res.render('applications/edit', app);
  });
});

router.post('/:appId/edit', function(req, res){
  console.log(req.body, req.params);
  var updateFields = {
    appName: req.body.appName,
    domains: req.body.domains.replace(/\s/g, '').split(',')
  }
  if (req.body.regenerateApiKey == 'on'){
    var hmac = crypto.createHmac('sha1', 'some random key');
    hmac.update('xxxxxx');
    var hash = hmac.digest('base64');
    updateFields.apiKey = hash;
  }
  ApplicationModel.update({ _id: req.params.appId }, updateFields)
  .exec(function(err, app){
    res.redirect('/applications');
  });
});

router.get('/:appId/dashboard', function(req, res){
  ApplicationModel.findOne({ _id: req.params.appId }).exec(function(err, doc){
    doc.title = doc.title || 'Dashboard';
    res.render('applications/dashboard', doc);
  });
});

router.get('/:appId/metric/add', function(req, res){
  res.render('applications/metric/add', {
    title: 'Add Metric',
    expressionHelp: fs.readFileSync(path.join(__dirname, '../../views/applications/metric/help.md'), { encoding: 'utf8' })
  });
});

router.post('/:appId/metric/add', function(req, res){
  var metric = new MetricModel();
  metric.set({
    name: req.body.name,
    expression: req.body.expression,
    settings: {
      metricType: req.body.metricType,
      format: req.body.format,
      labels: req.body.labels.split(/\s*,\s*/)
    }
  });
  // Add the metric to the model
  ApplicationModel.findOne({ _id: req.params.appId }).exec(function(err, app){
    app.metrics.push(metric);
    app.save(function(err, app, n){
      if (err) throw err;

      res.redirect('/applications/' + app._id + '/dashboard');
    });
  });
});

module.exports = router;