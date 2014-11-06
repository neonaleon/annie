var RSVP = require('rsvp');
var config = require('../../config');
var EventModel = require('../../models/event');

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
  from: function(time){
    this.model.where({timestamp: { $gte: time }});
    return this;
  },
  to: function(time){
    this.model.where({timestamp: { $lte: time }});
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
