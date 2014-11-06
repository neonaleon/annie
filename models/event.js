var mongoose = require('mongoose');

var EventSchema = mongoose.Schema({
  event: String,
  data: {},
  timestamp: Date
});

module.exports = mongoose.model('Event', EventSchema);