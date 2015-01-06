# Developer

This section contains links to download the SDKs.

It also contains examples of basic usage of each available SDK.

Refer to [Guide](guide) for information on using Annie's Dashboard.

## SDKs

### Downloads
[NodeJS](sdk/node/annie.js)

[PHP](sdk/php/annie.php)

### Usage
#### NodeJS
```language-javascript
// require Annie, this depends on where you put the sdk
var annie = require('./annie');
annie.init('YOUR_API_KEY');
annie.track('bought gacha', {
  'gachaId': 123,
  'price': 300
});
```
#### PHP
```language-php
// Annie is implemented as a static class
// require Annie, this depends on where you put the sdk
require_once dirname(__FILE__).('/annie.php');
Annie::init('YOUR_API_KEY');
// OR if your are behind some proxy
Annie::init('YOUR_API_KEY', array('proxy' => 'http://10.25.2.16:8080'));
Annie::track('bought gacha', array(
    'gachaId'=> 123,
    'price'=> 300
));
```