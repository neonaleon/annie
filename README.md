# Annie
Annie dreams to be a flexible, centralized game analytics platform.
Annie is a [Time Series](http://en.wikipedia.org/wiki/Time_series) data collection and analysis system.
You can collect timestamped events with any satellite data, and then derive metrics post hoc.

# Features
She provides SDKs for client applications to use her, or simply interact with her through REST API.
Different games will have different metrics to care about, and Annie provides a scripting system for game teams to make sense of the data tracked through
Annie.

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
API host: http://kts-leonho/annie
Tracking API: /track

```

## Deployment

### Nginx

You might need something like this if you use nginx to proxy.
```
location /annie/ {
    rewrite ^/annie/(.*)$ /$1 break;
    proxy_pass http://your-domain:8000/;
    proxy_redirect / /annie/;
    proxy_set_header Host $http_host;
}
```

## Development

### Installation

#### Dependencies

node, npm, mongodb

```
git clone <url here>
cd annie
npm install
```

#### Test

`npm test`

#### Run

`NODE_ENV=production ./bin/www`

Navigate to http://localhost:8000