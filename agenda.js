var Agenda = require('agenda');
var util = require('util');
var spawn = require('child_process').spawn;

var updateMetrics = require('./jobs/update-metrics');

var agenda = new Agenda();

agenda.database('localhost:27017/annie', 'agenda');

// spawn process version

// agenda.define('update metrics', function(job, done){
//   var job = spawn('node', ['jobs/update-metrics.js']);
//   job.stderr.on('data', function (data) {
//     util.puts('stderr: ' + data);
//   });
//   job.stdout.on('data', function (data) {
//     util.puts(Date() + '> stdout: ' + data);
//   });
//   job.on('close', function(code){
//     util.puts('update metrics job exited with code ' + code);
//     done();
//   });
// });

// agenda.every('*/1 * * * *', 'update metrics');

// function version

agenda.define('update metrics', function(job, done){
  updateMetrics().then(function(apps){
    done();
  }, function(err){
    done();
  });
});

agenda.every('*/1 * * * *', 'update metrics');

agenda.start();