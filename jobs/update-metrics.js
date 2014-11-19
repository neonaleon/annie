var RSVP = require('rsvp');
var sprintf = require('sprintf-js').sprintf;

var config = require('../config');
var ApplicationModel = require('../models').ApplicationModel;

var compute = require('../core/metric').compute;
var transform = require('../core/metric/transform');

var updateMetrics = function(){

  return new RSVP.Promise(function(resolve, reject){
    ApplicationModel.find({}).exec(function(err, apps){
      var promisedAppUpdates = apps.map(function(app){
        var promisedMetricUpdates = app.metrics.map(function(metric){
          // compute returns a promise
          return compute(metric.expression);
        });
        return new RSVP.Promise(function(resolve, reject){
          RSVP.all(promisedMetricUpdates).then(function(values){
            app.metrics.forEach(function(metric, i){
              var value = values[i];
              if (metric.settings.format.length !== 0){
                value = sprintf(metric.settings.format, value);
              }
              // metric.set('value', value, String);
              metric.set('value', transform(value, {
                type: metric.settings.metricType,
                labels: metric.settings.labels
              }));
            });
            app.save(function(err, app, n){
              resolve(app);
              reject(err);
            })
          });
        });
      });

      RSVP.all(promisedAppUpdates).then(function(apps){
        resolve(apps);
      }).catch(function(err){
        console.error(err);
        reject(err);
      });
    });
  });
};

module.exports = updateMetrics;