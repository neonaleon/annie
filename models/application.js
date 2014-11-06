var mongoose = require('mongoose');
var MetricModel = require('./metric');

var ApplicationSchema = mongoose.Schema({
  appName: String,
  apiKey: String,
  domains: [ String ],
  metrics: [ MetricModel.schema ],
  events: [ {
    name: String,
    created: Date
  } ]
});

module.exports = mongoose.model('Application', ApplicationSchema);