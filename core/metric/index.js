var RSVP = require('rsvp');
var MetricQuery = require('./query');

var evaluate = function(subExpression){
  return new RSVP.Promise(function(resolve, reject){
    (function(){
      try {
        // force the scope onto MetricQuery
        var promise = eval('this.' + subExpression);
        promise
          .then(function(value){
            resolve(value);
          })
          .catch(function(err){
            console.log(err);
            reject(err);
          });
      } catch(err){
        console.log(err);
        reject(err);
      }
    }).apply(MetricQuery);
  });
}

var compute = function(expression){
  var copy = expression;
  var table = {};
  while (true){
    // search for event('event name').<chained operators>.value() pairs
    var begin = expression.indexOf('event');
    if (begin === -1) break;
    var end = expression.indexOf('value()') + 7;
    // extract the expression
    var subExpression = expression.substring(begin, end);
    // shift the search index
    expression = expression.substring(end);
    // make symbols and substitute them for the sub expressions
    var symbol = '__' + (Object.keys(table).length + 1) + '__';
    copy = copy.replace(subExpression, symbol);
    // store the sub expression
    table[symbol] = subExpression;
  }
  return new RSVP.Promise(function(resolve, reject){
    // evaluate all the sub expressions
    var promises = {};
    Object.keys(table).map(function(symbol){
      promises[symbol] = evaluate(table[symbol]);
    });
    RSVP.hash(promises)
      .then(function(results){
        // substitute the results into the symbols
        Object.keys(promises).forEach(function(symbol){
          copy = copy.replace(symbol, results[symbol]);
        });
        // resolve this promise with the final value
        resolve(eval(copy));
      })
      .catch(function(err){
        reject(err);
      });
  });
};

module.exports.compute = compute;