var mongoose = require('mongoose');
var nconf = require('nconf');

var host = nconf.get('database:host');
var port = nconf.get('database:port');
var database = nconf.get('database:name');
mongoose.connect('mongodb://'+host+':'+port+'/'+database);
mongoose.set('debug', true);
var db = mongoose.connection;

db.on('error', function(err){
  console.log('DB connection error!', err.message);
});

db.once('open', function callback(){
  console.log('Connected to DB!');
});

module.exports = {
  ApplicationModel: require('./application'),
  EventModel: require('./event'),
  MetricModel: require('./metric'),
  UserModel: require('./user')
};