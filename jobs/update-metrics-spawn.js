#!/bin/node

var RSVP = require('rsvp');
var sprintf = require('sprintf-js').sprintf;

var mongoose = require('mongoose');

var config = require('../config');
var MetricModel = require('../models').MetricModel;
var EventModel = require('../models').EventModel;

var transform = require('../core/metric/transform');

var parse = require('../core/parser').parse;

var counter = 0;
MetricModel
  .find({})
  .exec()
  .then(function(metrics){
    metrics.forEach(function(metric){
      counter += 1;
      // build query by parsing the expression
      var query = parse(metric.expression);
      // standard pipeline
      var pipeline = [
        { $match: { 'meta.app_id': metric.meta.app_id } },
        { $match: { event: query.event } }
      ];
      // concat pipeline steps generated in the query
      pipeline = pipeline.concat(query.pipeline);
      // execution
      // append additional steps for execution
      var exec = query.exec;
      if (exec.append){
        pipeline = pipeline.concat(exec.append);
      }
      // run aggregate query with pipeline
      EventModel
        .aggregate(pipeline)
        .exec()
        .then(function(docs){
          // transform query result with execution options
          console.log("hehe", metric, docs, exec)
          metric.set('result', {
            data: transform(docs, exec.options),
            options: exec.options
          }, mongoose.Schema.Types.Mixed);
          // save query result
          metric.save(function(err, metric, n){
            if (err) throw err;
            counter -= 1;
            if (counter === 0){
              console.log('script done');
              process.exit(0);
            }
          });
        })
        .then(null, function(err){
          console.error(err);
          process.exit(1);
        })
        .end();
    });
  })
  .then(null, function(err){
    console.error(err);
    process.exit(1);
  })
  .end();