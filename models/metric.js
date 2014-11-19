var mongoose = require('mongoose');

var MetricSchema = new mongoose.Schema({
  name: String,
  value: mongoose.Schema.Types.Mixed,
  expression: { type: String, trim: true },
  settings: {
    metricType: String,
    format: String,
    labels: [ String ]
  },
  meta: {
    createdAt: { type: Date, default: new Date() },
    status: String
  }
});

module.exports = mongoose.model('Metric', MetricSchema);