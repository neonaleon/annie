var mongoose = require('mongoose');

var MetricSchema = new mongoose.Schema({
  name: String,
  value: String,
  expression: { type: String, trim: true },
  settings: {
    metricType: String,
    format: String
  }
});

module.exports = mongoose.model('Metric', MetricSchema);