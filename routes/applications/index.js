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

var parse = require('../../core/parser').parse;

// APPLICATION
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
  ApplicationModel.create({
    appName: req.body.appName
  })
  .then(function(app){
    UserModel
      .findOne({ _id: req.user })
      .exec()
      .then(function(user){
        user.applications.push(app);
        user.save(function(err/*, user, n*/){
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

router.get('/:app_id/edit', function(req, res){
  ApplicationModel.findOne({ _id: req.params.app_id }).exec(function(err, app){
    app.title = app.title || 'Edit';
    res.render('applications/edit', app);
  });
});

router.post('/:app_id/edit', function(req, res){
  var updateFields = {
    appName: req.body.appName
  };
  ApplicationModel
    .update({ _id: req.params.app_id }, updateFields)
    .exec(function(err, app){
      res.redirect('/applications');
    });
});


// DASHBOARD
router.get('/:app_id/dashboard', function(req, res){
  ApplicationModel
    .findOne({ _id: req.params.app_id })
    .populate('metrics')
    .exec(function(err, app){
      app.title = app.title || 'Dashboard';
      res.render('applications/dashboard', app);
    });
});

router.post('/:app_id/dashboard', function(req, res){
  // TODO: validate body
  ApplicationModel
    .update({ _id: req.params.app_id }, { $set: { dashboard: req.body.dashboard } }, function(err, n, raw){
      console.log(err, n, raw);
      res.status(200).send();
    });
});

router.get('/:app_id/dashboard/layout', function(req, res){
  // TODO: this seems cacheable
  ApplicationModel
    .findOne({ _id: req.params.app_id })
    .exec(function(err, app){
      var layout = app.dashboard.layout || [];
      res.status(200).send(layout);
    })
});

// METRICS
router.get('/:app_id/metric/add', function(req, res){
  fs.readFile(path.join(__dirname, '../../views/applications/metric/help.md'), { encoding: 'utf8' }, function(err, data){
    res.render('applications/metric/add', {
      title: 'Add Metric',
      expressionHelp: data
    });
  });
});

router.post('/:app_id/metric/add', function(req, res){
  var query = null;
  try {
    query = parse(req.body.expression);
  } catch(err) {
    // parse error
    console.error(err);
    return ;
  }

  var metric = new MetricModel({
    name: req.body.name,
    expression: req.body.expression,
    meta: {
      app_id: req.params.app_id
    }
  });

  // see MetricModel's schema methods
  metric.updateResult()
    .then(function(){
      metric.save(function(err, metric, n){
        ApplicationModel
          .findOne({ _id: req.params.app_id })
          .exec()
          .then(function(app){
            app.metrics.push(metric);
            app.save(function(err/*, app, n*/){
              res.redirect('/applications/' + app._id + '/dashboard');
            });
          })
          .then(null, function(err){
            console.error(err);
            throw err;
          })
          .end();
      });
    })
    .catch(function(err){
      console.error(err);
      res.redirect('/applications/' + app._id + '/dashboard?err=1');
    });
});

router.get('/:app_id/metric/:metric_id', function(req, res){
  MetricModel
    .findOne({ _id: req.params.metric_id })
    .exec()
    .then(function(metric){
      res.status(200).send({
        name: metric.name,
        expression: metric.expression
      });
    })
    .then(null, function(err){

    });
});

router.post('/:app_id/metric/:metric_id', function(req, res){
  // TODO: validate body
  var query = null;
  try {
    query = parse(req.body.expression);
  } catch(err) {
    // parse error
    console.error(err);
    return ;
  }

  MetricModel
    .update(
      { _id: req.params.metric_id },
      { $set: { name: req.body.name, expression: req.body.expression } },
      function(err, n, raw){
        console.log(err, n, raw);
        res.status(204).send();
      }
    );
});

router.get('/:app_id/metric/:metric_id/edit', function(req, res){
  MetricModel
    .findOne({ _id: req.params.metric_id })
    .exec()
    .then(function(metric){
      metric.title = 'Edit Metric';
      metric.expressionHelp = fs.readFileSync(path.join(__dirname, '../../views/applications/metric/help.md'), { encoding: 'utf-8' })
      res.render('applications/metric/edit', metric);
    })
    .then(null, function(err){
      console.log(err);
    });
});

router.post('/:app_id/metric/:metric_id/edit', function(req, res){
  var query = null;
  try {
    query = parse(req.body.expression);
  } catch(err) {
    // parse error
    console.error(err);
    return ;
  }

  MetricModel
    .findOne({ _id: req.params.metric_id })
    .exec()
    .then(function(metric){
      metric.name = req.body.name;
      metric.expression = req.body.expression;
      metric.updateResult()
        .then(function(){
          metric.save(function(err, metric, n){
            res.redirect('/applications/' + req.params.app_id + '/dashboard');
          });
        })
        .catch(function(err){
          throw err;
        });
    })
    .then(null, function(err){
      console.error(err);
    });
});

module.exports = router;