# Metric Expression Scripting Guide

All





## Methods

### Start

#### event(name)

Starts an expression that will match all events with the given name.

### End

#### value()

Ends an expression giving a numeric value.

### Query

#### where(condition)

Specify a condition for matching.

`event('Bought gacha').where({ 'data.price': 300 }).count().value()`

#### count()

Counts the number of documents that match the query.

`event('Survey').where({ 'data.nodejs': 'rocks' }).count().value()`

#### from('DD-MM-YYYY HH:mm:ss' or '-Nd -Nm -Ns')

You can use a date or d, m, s for days, minutes, seconds.

e.g Number of signups in the last week. 

`event('signup').from('-7d').count().value()`

e.g. Number of signups from some date.

`event('signup').from('30-11-2013').count().value()`

#### to()

You can chain `from` and `to` methods to form date range queries.

`event('bought event gacha').where({ 'data.gacha': 'event gacha' }).from('04-10-2014 08:00:00').to('11-10-2014 15:00:00').count().value()`

## Examples

### Simple

`event('Bought gacha').count().value()`

This expression will create a metric that shows the total number of times
gacha was bought.

### Compound

`event('Responded to survey').where({ 'data.nodejs': 'rocks' }).count().value() / event('Responded to survey').count().value() * 100`

This expression will create a metric that shows the percentage of people in
the survey who responded that nodejs rocks.
