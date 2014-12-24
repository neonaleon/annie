var expect = require('chai').expect;
var mongoose = require('mongoose');
var faker = require('faker');
var reltime = require('reltime');

var parser = require('../../../../core/parser');
var parse = parser.parse;

var config = require('../../../../config');
var models = require('../../../../models');
var EventModel = models.EventModel;
var MetricModel = models.MetricModel;

mongoose.set('debug', false);

var TEST_API_KEY = mongoose.Types.ObjectId();

describe('Query', function(){

  // test setup, populate Event collection with test data
  before(function(done){
    var event = 'bought gacha';
    var prices = [ 100, 200, 300 ];
    var numbers = [ 30, 20, 10 ];
    var docs = [];

    for (var i = 0; i < 3; ++i){
      var num = numbers[i];
      var price = prices[i];

      for (var j = 0; j < num; ++j){
        docs.push({
          event: event,
          timestamp: reltime.parse(new Date(), '-' + i * 7 + 'd'),
          data: {
            price: price
          },
          meta: {
            app_id: TEST_API_KEY
          }
        });
      }
    }
    // using driver directly to do bulk insert
    // note that this bypasses mongoose validation
    EventModel.collection.insert(docs, done);
  });

  it('event("bought gacha").count()', function(done){
    var metric = new MetricModel;
    metric.meta.app_id = TEST_API_KEY;
    metric.expression = 'event("bought gacha").count()';
    metric.updateResult()
      .then(function(metric){
        expect(metric.result.data).to.be.equal(60);
        done();
      })
      .catch(function(err){
        done(err);
      });
  });

  it('event("bought gacha").where({ "data.price": 100 }).count()', function(done){
    var metric = new MetricModel;
    metric.meta.app_id = TEST_API_KEY;
    metric.expression = 'event("bought gacha").where({ "data.price": 100 }).count()';
    metric.updateResult()
      .then(function(metric){
        expect(metric.result.data).to.be.equal(30);
        done();
      })
      .catch(function(err){
        done(err);
      });
  });

  it('event("bought gacha").group({ label: "$data.price", value: { $sum: 1 } }).sort({ value: -1 }).chart("line")', function(done){
    var metric = new MetricModel;
    metric.meta.app_id = TEST_API_KEY;
    metric.expression = 'event("bought gacha").group({ label: "$data.price", value: { $sum: 1 } }).sort({ value: -1 }).chart("line")';
    metric.updateResult()
      .then(function(metric){
        expect(metric.result.data).to.deep.equal({
          labels: [ 100, 200, 300 ],
          data: [ 30, 20, 10 ]
        });
        done();
      })
      .catch(function(err){
        done(err);
      });
  });

  it('event("bought gacha").groupBy({ year: 1, month: 1, week: 1, value: { $sum: "$data.price" } }).count()', function(done){
    var metric = new MetricModel;
    metric.meta.app_id = TEST_API_KEY;
    metric.expression = 'event("bought gacha").groupBy({ year: 1, month: 1, value: { $sum: "$data.price" } }).count()';
    metric.updateResult()
      .then(function(metric){
        expect(metric.result.data).to.have.length(3);
        done();
      })
      .catch(function(err){
        done(err);
      });
  });

  after(function(done){
    EventModel.remove({}, done);
  });

});