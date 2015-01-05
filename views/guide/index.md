# Guide

This section contains information about the Metric Expression system you will use to derive metrics for your Dashboard.

Refer to [Developer](developer) for information on how to use Annie in your app.
- - -
## Metric Expressions
Metric expressions allow you to write simple statements to perform aggregate queries on the events you have tracked.

### Syntax
The statements use a javascript like syntax that mimics the mongoDB aggregation pipeline.

Every statement begins with `event('name of event')`, chained with pipeline operators and ends with a terminal operator.

The available pipeline operators are:

* Where `where({ data.someProperty: <expression> })`
* From `from('-Nd -Nm -Ns') or from('DD-MM-YYYY HH:mm:ss')`
* To `to('DD-MM-YYYY HH:mm:ss')`
* Group `group({ label: <expression>, value: <expression>})`
* Project `project({})`
* Sort `sort({ 'data.someProperty': 1|-1 })` 1 for ascending, -1 for descending
* Limit `limit(number)`

`<expression>` can be a number or string or object with mongo operators such as `{ $gt: 300, $lt: 500 }`

The available terminal operators are:

* Count `count()`
* Sum `sum('$data.propertyToSum')`
* Average `average('$data.propertyToAverage')`
* (NYI) Tabulate `tabulate('label' [, 'more'])`
* Chart `chart('line|pie|bar', xaxisKey, yaxisKey)` Charts for 2D data, specify string keys to access output from the pipeline
- - -

## Examples

This section will contain some examples of using metric expressions to create metrics.

Log in to the demo account to see these examples in the dashboard.
```
email: demo@annie.com
password: showmethemetrics
```

There is a special browser SDK of Annie in the dashboard which you can use to track data.

Open up the console and use the following code:

```language-javascript
var annie = require('annie');
annie.init('API-KEY'); // init annie with the API key you see in the dashboard
annie.track(...) // see examples below
```

### Total gacha sales in the past 7 days
Tracking
```language-javascript
annie.track('bought gacha', {
    id: 10001, // gacha id
    price: 100
});
```
Single value metric
```language-javascript
event('bought gacha').from('-7d').sum('$data.price')
```

### Total gacha sales by gacha id
Tracking
```language-javascript
annie.track('bought gacha', {
    id: 10001, // gacha id
    price: 100
});
annie.track('bought gacha', {
    id: 10002,
    price: 200
});
annie.track('bought gacha', {
    id: 10003,
    price: 300
});
```
Categorical metric using pie chart
```language-javascript
event('bought gacha').group({ _id: '$data.id', sales: { $sum: '$data.price' } }).project({ gacha: '$_id', sales: '$sales' }).chart('pie', 'gacha', 'sales')
```

### DAU trendline in January
Tracking
```language-javascript
annie.track('daily login', {
    pid: 1 // player id
});
annie.track('daily login', {
    pid: 2
});
annie.track('daily login', {
    pid: 3
});
```
Trending data using line chart
```language-javascript
event('daily login').from('2015-01-01').to('2015-01-31').group({ _id: { day: { $dayOfMonth: '$timestamp' } }, players: { $sum: 1 } }).project({ day: '$_id.day', players: '$players' }).sort({ day: 1 }).chart('line', 'day' ,'players')
```