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
    query.model = EventModel.where({ event: name });
    return query;
  },
  where: function(obj){
    this.model.where(obj);
    return this;
  },
  from: function(dateString){
    this.model.where({ timestamp: { $gte: parseDate(dateString) }});
    return this;
  },
  to: function(dateString){
    this.model.where({ timestamp: { $lte: parseDate(dateString) }});
    return this;
  },
  count: function(){
    this._count = true;
    return this;
  },
  value: function(){
    var query = this;
    return new RSVP.Promise(function(resolve, reject){
      if ( query._count ) {
        query.model.count(function(err, count){
          resolve(count);
          reject(err);
        });
      } else {
        query.model.exec(function(err, docs){
          resolve(docs);
          reject(err);
        });
      }
    });
  }
}

module.exports = Query;
