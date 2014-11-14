var RSVP = require('rsvp');
var moment = require('moment');;
var reltime = require('reltime');
var config = require('../../config');
var EventModel = require('../../models/event');

var parseDate = function(dateString){
  var date = moment().format(dateString);
  if (!date.isValid) {
    date = reltime.parse(new Date(), dateString);
    if (!date.isValid) {
      // date syntax error
    }
  }
  return date;
}

var Query = {
  event: function(name){
    var query = Object.create(Query);
    query._internal = EventModel.aggregate();
    query._internal.match({ event: name });
    return query;
  },
  where: function(obj){
    this._internal.match(obj);
    return this;
  },
  from: function(dateString){
    this._internal.match({ timestamp: { $gte: parseDate(dateString) }});
    return this;
  },
  to: function(dateString){
    this._internal.match({ timestamp: { $lte: parseDate(dateString) }});
    return this;
  },
  count: function(){
    this._count = true;
    this._internal.group({ _id: null, value: { $sum: 1 } });
    return this;
  },
  sum: function(field){
    this._sum = true;
    this._internal.group({ _id: null, value: { $sum: '$' + field } });
    return this;
  },
  average: function(field){
    this._average = true;
    this._internal.group({ _id: null, value: { $avg: '$' + field } });
    return this;
  },
  value: function(){
    var query = this;
    return new RSVP.Promise(function(resolve, reject){
      query._internal.exec(function(err, docs){
        if (err){
          console.log(err);
          reject(err);
        } else {
          if (query._sum || query._count || query._average){
            resolve(docs[0].value);
          }
          resolve(docs);
        }
      });
    });

  }
}

module.exports = Query;
