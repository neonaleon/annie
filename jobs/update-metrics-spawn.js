#!/bin/node

var mongoose = require('mongoose');
var RSVP = require('rsvp');

var config = require('../config');
var MetricModel = require('../models').MetricModel;

var transform = require('../core/metric/transform');

var counter = 0;
MetricModel
  .find({})
  .exec()
  .then(function(metrics){
    metrics.forEach(function(metric){
      counter += 1;

      metric.update()
        .then(function(){
          metric.save(function(err, metric, n){
            if (err) throw err;
            counter -= 1;
            if (counter === 0){
              console.log('script done');
              process.exit(0);
            }
          });
        }).catch(function(err){
          console.error(err);
          process.exit(1);
        });
    });
  })
  .then(null, function(err){
    console.error(err);
    process.exit(1);
  })
  .end();