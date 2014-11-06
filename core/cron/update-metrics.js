var sprintf = require('sprintf-js').sprintf;

var config = require('../../config');
var models = require('../../models');

var compute = require('../metric').compute;

var ApplicationModel = models.ApplicationModel;

var counter = 0;

ApplicationModel.find({}).exec(function(err, apps){
  apps.forEach(function(app){
    app.metrics.forEach(function(metric){
      compute(metric.expression).then(function(value){
        if (metric.settings.format.length !== 0){
          value = sprintf(metric.settings.format, value);
        }
        metric.set('value', value, String);
        // save changes to the app after metric is updated
        app.save(function(err, app, n){
          if (err) console.log(err);
        });
      });
    });
  });
});