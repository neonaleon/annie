var Agenda = require('agenda');
var util = require('util');
var spawn = require('child_process').spawn;

var updateMetrics = require('./jobs/update-metrics');

var agenda = new Agenda();

var nconf = require('nconf');
if (nconf.get('dbstring')) {
  agenda.database(nconf.get('dbstring'), 'agenda'); 
} else {
  var host = nconf.get('database:host');
  var port = nconf.get('database:port');
  var name = nconf.get('database:name');
  agenda.database( host + ':' + port + '/' + name, 'agenda');
}

// spawn process version

agenda.define('update metrics', function(job, done){
  var job = spawn('node', ['jobs/update-metrics-spawn.js']);
  job.stderr.on('data', function (data) {
    util.puts('stderr: ' + data);
  });
  job.stdout.on('data', function (data) {
    util.puts(Date() + ' > stdout: ' + data);
  });
  job.on('close', function(code){
    util.puts('update metrics job exited with code ' + code);
    done();
  });
});

agenda.every('*/1 * * * *', 'update metrics');

// function version

// agenda.define('update metrics', function(job, done){
//   console.log('--update metrics');
//   console.log('job started');
//   updateMetrics().then(function(metrics){
//     console.log('job complete');
//     console.log('update metrics--');
//     done();
//   }, function(err){
//     console.log(err);
//     console.log('job failed');
//     console.log('update metrics--');
//     done();
//   });
// });
// console.log('Added job "update metrics"');

agenda.every('*/1 * * * *', 'update metrics');

agenda.start();