var mongoose = require('mongoose');

var ApplicationSchema = mongoose.Schema({
  appName: String,
  // apiKey: String,
  metrics: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Metric' } ],
  dashboard: {
    layout: { type: mongoose.Schema.Types.Mixed, default: {} }
  }
});

ApplicationSchema.virtual('apiKey')
  .get(function(){
    return this._id;
  });

module.exports = mongoose.model('Application', ApplicationSchema);