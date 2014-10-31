var nconf = require('nconf');

nconf
  .argv()
  .env();
//  .file();

nconf.defaults({
  'database': {
    'name': 'annie',
    'host': '127.0.0.1',
    'port': 27017
  }
});