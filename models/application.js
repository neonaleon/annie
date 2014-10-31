var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ApplicationSchema = new Schema({
  appName: String,
  apiKey: String,
  domains: [ String ]
});

module.exports = mongoose.model('Application', ApplicationSchema);