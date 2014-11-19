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

// The Query object is a wrapper around the mongoose API, so that I can choose
// what functionality to expose.
// It returns a promise.
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
    this._internal.group({ _id: null, value: { $sum: 1 } });
    return this;
  },
  sum: function(field){
    this._internal.group({ _id: null, value: { $sum: '$' + field } });
    return this;
  },
  average: function(field){
    this._internal.group({ _id: null, value: { $avg: '$' + field } });
    return this;
  },
  project: function(obj){
    this._internal.project(obj);
    return this;
  },
  group: function(obj){
    // { _id: null }
    // { _id: field }
    // { _id: { field1: 1, field2: 1} }
    this._internal.group(obj);
    return this;
  },
  groupBy: function(obj){
    var timeGroup = obj._id;
    if (timeGroup.year === 1) {
      timeGroup.year = { $year: '$timestamp' };
    }
    if (timeGroup.month === 1) {
      timeGroup.month = { $month: '$timestamp' };
    }
    if (timeGroup.day === 1) {
      timeGroup.day = { $dayOfMonth: '$timestamp' };
    }
    if (timeGroup.week === 1) {
      timeGroup.week = { $week: '$timestamp' };
    }
    if (timeGroup.hour === 1) {
      timeGroup.hour = { $hour: '$timestamp' };
    }
    // split by time
    this._internal.project({
      timeGroup: timeGroup,
      timestamp: 1,
      data: 1
    });
    obj._id = '$timeGroup';
    this._internal.group(obj);
    return this;
  },
  sort: function(obj){
    // { ascField: 1, descField: -1 }
    this._internal.sort(obj);
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
          if (docs.length === 0){ // no matching documents
            resolve(0);
          } else {
            resolve(docs[0].value);
          }
        }
      });
    });
  },
  table: function(){
    var query = this;
    return new RSVP.Promise(function(resolve, reject){
      query._internal.exec(function(err, docs){
        if (err){
          console.log(err);
          reject(err);
        } else {
          resolve(docs);
        }
      });
    });
  }
}

module.exports = Query;
