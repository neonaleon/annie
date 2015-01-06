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
API host: http://kts-leonho/annie
Tracking API: /api/track
Header: X-API-KEY YOUR-API-KEY
Content-Type: application/json

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




# tentacle-kneesock-shojo

TKS Intranet System

## Development

`npm install -g yo nodemon grunt-cli`

`npm install`

`grunt serve`

Now you can access the app at http://localhost:8000.

You should get [LiveReload](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei?hl=en) and switch it on while doing development for this app.

### Server-side

Use yo to generate controller and model files.
```
// Generate a new controller namespace called myController and it's dependencies.
$ yo kraken:controller myController

// Generate a new model named myModel.
$ yo kraken:model myModel
```

(!) THE FOLLOWING COMMANDS SHOULD NOT BE USED BECAUSE WE ARE NOT USING DUST

but maybe we can make it work next time

```
// Generate a new template named myTemplate and it's dependencies.
$ yo kraken:template myTemplate

// Generate a new content bundle named myFile.
$ yo kraken:locale myFile [myCountry myLang]
```

\- from [generator-kraken](https://github.com/krakenjs/generator-kraken)

### Client-side

All client side code is found in the public folder.
```
public
| css
    | app.less - main application stylesheet, use this to import
    | *.less - your other LESS styles
    | app.css - compiled from app.less, don't touch
| js
    | app.js - main application file, think of this as the router
    | *.js - all your routes
    | *.min.js - compiled templates, don't touch
| templates - contains all Ractive templates
    | *.ractive - all your templates, this should have the same path as the controller
    | partials
        | _*.ractive - partials
```

## Testing

*TODO*

## Deploy

*TODO*