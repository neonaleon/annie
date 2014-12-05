var mongoose = require('mongoose');

var ApplicationSchema = mongoose.Schema({
  appName: String,
  // apiKey: String,
  metrics: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Metric' } ]
});

ApplicationSchema.virtual('apiKey')
  .get(function(){
    return this._id;
  });

module.exports = mongoose.model('Application', ApplicationSchema);