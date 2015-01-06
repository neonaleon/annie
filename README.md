# Annie

Annie is an event-based data collection and analysis system.

You can collect timestamped events attached with additional data, and then derive metrics post hoc.

# Features

SDKs for NodeJS and PHP

Simple DSL for deriving metrics

Dashboard for viewing metrics


## SDKs
### Node
```
var annie = require('annie');
annie.init('YOUR_API_KEY');
annie.track('bought gacha', {
  'gachaId': 123,
  'price': 300
});
```
### PHP
```
// require Annie, this depends on where you put the sdk
require_once dirname(__FILE__).('/annie.php');
// annie is implemented as a static class
Annie::init('YOUR_API_KEY');
Annie::track('bought gacha', array(
    'gachaId'=> 123,
    'price'=> 300
));
```
### REST
```
API host:       http://10.25.11.45:8000/annie
Tracking API:   /api/track
Headers:        X-API-KEY: YOUR-API-KEY
                Content-Type: application/json

```

## Deploy

#### Dependencies

node, npm, mongodb should be installed on your server.

### Run server

e.g.
`NODE_ENV=production PORT=8000 ./bin/www`

Navigate to http://your-host-name:8000

### Run jobs

```
cd annie
forever start agenda.js
// OR
node agenda.js
```

### Notes

#### nginx

You might need something like this if you use nginx to proxy.
```
location /annie/ {
    rewrite ^/annie/(.*)$ /$1 break;
    proxy_pass http://your-host-name:8000/;
    proxy_redirect / /annie/;
    proxy_set_header Host $http_host;
}
```

## Develop

```
git clone http://10.25.2.44/neonaleon/annie.git
cd annie
npm install
```

### Grunt

While coding, use `grunt watch` with [LiveReload](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei?hl=en)

When done, use `grunt build`

### Test

`npm test`


## Roadmap

Easier config and setup

Cleaner code

Autogenerate SDKs (especially host path)

Live dashboard

More data visualization types

Metric expression debugger