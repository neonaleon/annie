# Metric Expression Scripting Guide

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

`event('Bought gacha').where({ 'data.price': { $gte: 300 } }).value()`

#### count()

Counts the number of documents that match the query.

`event('Survey').where({ 'data.nodejs': 'rocks' }).count().value()`

#### from()

_NYI_

#### to()

_NYI_

## Examples

### Simple

`event('Bought gacha').count().value()`

This expression will create a metric that shows the total number of times
gacha was bought.

### Compound

`event('Responded to survey').where({ 'data.nodejs': 'rocks' }).count().value() / event('Responded to survey').count().value() * 100`

This expression will create a metric that shows the percentage of people in
the survey who responded that nodejs rocks.
