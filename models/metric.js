var mongoose = require('mongoose');

var MetricSchema = mongoose.Schema({
  name: String,
  expression: { type: String, trim: true },
  meta: {
    app_id: mongoose.Schema.Types.ObjectId,
    createdAt: { type: Date, default: new Date() },
  },
  result: {
    data: mongoose.Schema.Types.Mixed,
    options: {
      type: { type: String },
      subtype: String,
      labels: [ String ], // for table type, maybe graph as well
      format: String // for value type
    },
    lastUpdated: Date
  },
});

module.exports = mongoose.model('Metric', MetricSchema);