var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var fs = require('fs');
var path = require('path');
var validator = require('validator');
var RSVP = require('rsvp');

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
  if (validator.isNull(req.body.appName)) {
    throw new Error('No application name given.');
    return;
  }
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
      app.metrics = app.metrics.filter(function(metric){
        return metric.meta.status == 'active';
      });
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
  getEventList(req.params.app_id)
    .then(function(events){
      res.render('applications/metric/add', {
        title: 'Add Metric',
        events: events
      });
    })
    .catch(function(err){
      console.error(err);
      throw err;
      return;
    });
});

router.post('/:app_id/metric/add', function(req, res){
  var query = null;
  try {
    query = parse(req.body.expression);
  } catch(err) {
    // parse error
    throw err;
    console.error(err);
    return ;
  }

  console.log(req.body);

  var metric = new MetricModel({
    name: req.body.name,
    expression: req.body.expression,
    meta: {
      app_id: req.params.app_id
    }
  });
  console.log(query);
  // see MetricModel's schema methods
  console.log(metric);
  metric.updateResult()
    .then(function(){
      console.log(metric.save);
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

// metric viewer
router.get('/:app_id/metric/view', function(req, res){
  getEventList(req.params.app_id)
    .then(function(events){
      res.status(200).send(events);
    })
    .catch(function(err){
      throw err;
      return;
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
      getEventList(req.params.app_id)
        .then(function(events){
          res.render('applications/metric/edit', {
            title: 'Edit Metric',
            name: metric.name,
            expression: metric.expression,
            events: events
          });
        })
        .catch(function(err){
          console.error(err);
          throw err;
          return;
        });
    })
    .then(null, function(err){
      console.error(err);
      throw err;
      return;
    });
});

router.post('/:app_id/metric/:metric_id/edit', function(req, res){
  var query = null;
  try {
    query = parse(req.body.expression);
  } catch(err) {
    // parse error
    console.error(err);
    throw new Error('Error parsing metric expression.');
    return;
  }

  if(validator.isNull(req.body.name)) {
    throw new Error('No metric name given.');
    return;
  };

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

router.delete('/:app_id/metric/:metric_id/edit', function(req, res){
  MetricModel
    .findOne({ _id: req.params.metric_id })
    .exec()
    .then(function(metric){
      metric.meta.status = 'deleted';
      metric.save(function(err, metric, n){
        res.status(200).send({
          'redirect': '/applications/' + req.params.app_id + '/dashboard'
        })
      });
    })
    .then(null, function(err){
      console.error(err);
    });
});

function getEventList(app_id){
  return new RSVP.Promise(function(resolve, reject){
    EventModel.find({
      'meta.app_id': app_id
    })
    .distinct('event')
    .exec()
    .then(function(events){
      var promises = events.map(function(e){
        return getEvent(e);
      });
      RSVP.all(promises).then(function(events){
        resolve(events);
      })
    })
    .then(null, function(err){
      reject(err);
    });
  });
}

function getEvent(name){
  return new RSVP.Promise(function(resolve, reject){
    EventModel
      .findOne({ event: name })
      .exec()
      .then(function(event){
        resolve({
          event: name,
          timestamp: event.timestamp,
          data: event.data
        });
      })
      .then(null, function(err){
        reject(err);
      });
  });
}

module.exports = router;