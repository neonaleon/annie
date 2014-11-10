#!/bin/node

var RSVP = require('rsvp');
var sprintf = require('sprintf-js').sprintf;

var config = require('../config');
var ApplicationModel = require('../models').ApplicationModel;

var compute = require('../core/metric').compute;

ApplicationModel.find({}).exec(function(err, apps){
  var counter = 0;
  apps.forEach(function(app){
    app.metrics.forEach(function(metric){
      counter += 1;
      compute(metric.expression)
        .then(function(value){
          if (metric.settings.format.length !== 0){
            value = sprintf(metric.settings.format, value);
          }
          metric.set('value', value, String);
          // save changes to the app after metric is updated
          counter -= 1;
          if (counter === 0) {
            apps.map(function(app){
              counter += 1;
              app.save(function(err, app, n){
                if (err) {
                  console.log(err);
                  process.exit(1);
                } else {
                  counter -= 1;
                  if (counter === 0){
                    process.exit(0);
                  }
                }
              });
            });
          }
        })
        .catch(function(err){
          console.log(err);
          process.exit(1);
        });
    });
  });
});