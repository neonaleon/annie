var mongoose = require('mongoose');

var EventSchema = mongoose.Schema({
  event: String,
  timestamp: Date,
  meta: {
    app_id: mongoose.Schema.Types.ObjectId
  },
  data: {} // user data is namespaced here
});

module.exports = mongoose.model('Event', EventSchema);