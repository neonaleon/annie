var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var EventSchema = new Schema({
  event: String,
  data: {},
  timestamp: Date
});

module.exports = mongoose.model('Event', EventSchema);