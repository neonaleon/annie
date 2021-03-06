var mongoose = require('mongoose');
var RSVP = require('rsvp');

var EventModel = require('./event');

var parse = require('../core/parser').parse;
var transform = require('../core/metric/transform');

var MetricSchema = mongoose.Schema({
  name: String,
  expression: { type: String, trim: true },
  meta: {
    app_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    createdAt: { type: Date, default: new Date() },
    status: { type: String, default: 'active' } // or 'deleted'
  },
  result: {
    data: mongoose.Schema.Types.Mixed,
    options: {
      type: { type: String }, // type of visualization
      subtype: String, // subtype of chosen visualization
      labels: [ String ], // for table type, maybe graph as well
      format: String // for value type
    },
    lastUpdated: Date
  },
});

MetricSchema.methods.updateResult = function(){
  var metric = this;

  return new RSVP.Promise(function(resolve, reject){
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

    console.log(pipeline);

    // run aggregate query with pipeline
    EventModel
      .aggregate(pipeline)
      .exec()
      .then(function(docs){
        // transform query result with execution options
        metric.set('result', {
          data: transform(docs, exec.options),
          options: exec.options,
          lastUpdated: new Date()
        }, mongoose.Schema.Types.Mixed);
        // save query result
        resolve(metric);
        // metric.save(function(err, metric, n){
        //   reject(err);
        //   resolve(metric);
        // });
      })
      .then(null, function(err){
        reject(err);
      })
      .end();
  });
};

module.exports = mongoose.model('Metric', MetricSchema);