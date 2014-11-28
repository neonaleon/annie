# Annie

Annie dreams to be a flexible, centralized game analytics system.
She provides SDKs for client applications to use her, or simply interact with her through REST API.
Different games will have different metrics to care about, and Annie provides a scripting system for game teams to make sense of the data tracked through
Annie.

## API

### Track

## SDK

### Browser

```
var annie = require('annie');
annie.track('Bought Gacha', {
  'gachaId': 123,
  'price': 300
});
```

### Node

```
var annie = require('annie');
annie.init('YOUR_API_KEY');
annie.track('Bought Gacha', {
  'gachaId': 123,
  'price': 300
});
```

### PHP

```
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