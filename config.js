var nconf = require('nconf');

nconf
  .argv()
  .env();

var NODE_ENV = nconf.get('NODE_ENV');

if (NODE_ENV === 'production'){
  nconf.file('./config/production.json');
} else if (NODE_ENV === 'development'){
  nconf.file('./config/development.json');
} else if (NODE_ENV === 'test'){
  nconf.file('./config/test.json');
}

nconf.defaults({
  'database': {
    'name': 'annie',
    'host': '127.0.0.1',
    'port': 27017
  }
});