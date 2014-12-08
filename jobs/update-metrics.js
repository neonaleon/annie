var RSVP = require('rsvp');

var config = require('../config');
var MetricModel = require('../models').MetricModel;

var updateMetric = function(metric){
  return new RSVP.Promise(function(resolve, reject){
    metric.update()
      .then(function(){
        metric.save(function(err, metric, n){
          reject(err);
          resolve(metric);
        });
      }).catch(function(err){
        reject(err);
      });
  });
};

var updateMetrics = function(){
  return new RSVP.Promise(function(resolve, reject){
    MetricModel
      .find({})
      .exec()
      .then(function(metrics){
        var promisedMetricUpdates = metrics.map(updateMetric);
        RSVP.all(promisedMetricUpdates)
          .then(function(metrics){
            resolve(metrics);
            console.log(metrics);
          })
          .catch(function(err){
            console.log(err);
            reject(err);
          });
      })
      .then(null, function(err){
        reject(err);
      })
      .end();
  });
};

module.exports = updateMetrics;