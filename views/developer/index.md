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
// require Annie, this depends on where you put the sdk
require_once dirname(__FILE__).('/annie.php');
// annie is implemented as a static class
Annie::init('YOUR_API_KEY');
Annie::track('bought gacha', array(
    'gachaId'=> 123,
    'price'=> 300
));
```

## Metric Expressions
Metric expressions allow you to write simple statements to perform aggregate queries on the events you have tracked.

### Syntax
The statements use a fluent javascript like syntax that mimics the mongoDB aggregation pipeline.

Every statement begins with `event('name of event')`, chained with pipeline operators and ends with a terminal operator. 

The available pipeline operators are:

* Where `where({ data.someProperty: <expression> })`
* From `from('-Nd -Nm -Ns') or from('DD-MM-YYYY HH:mm:ss')`
* To `to('DD-MM-YYYY HH:mm:ss')`
* Group `group({ label: <expression>, value: <expression>})`
* GroupBy `groupBy({ year: 1|0, month: 1|0, day: 1|0, week: 1|0, hour: 1|0, value: <expression> })`
* Sort `sort({ 'data.someProperty': 1|-1 })`
* Limit `limit(number)`

`<expression>` can be a number or string or object with mongo operators such as `{ $gt: 300, $lt: 500 }`

The available terminal operators are:

* Count `count()`
* Sum `sum('$data.propertyToSum')`
* Average `average('$data.propertyToAverage')`
* (NYI) Tabulate `tabulate('label' [, 'more'])`
* Chart `chart('line|pie|bar')`

### Examples



