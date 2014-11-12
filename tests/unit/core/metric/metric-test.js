var faker = require('faker');
var expect = require('chai').expect;
var reltime = require('reltime');
var compute = require('../../../../core/metric').compute;
var MetricQuery = require('../../../../core/metric/query');

var config = require('../../../../config'); // load app configs
var models = require('../../../../models');
var EventModel = models.EventModel;

describe('MetricQuery', function(){

  describe('Conditional Queries', function(){

    before(function(done){
      var nodejsLovers = 80;
      var railsLovers = 20;
      var docs = [];
      var i;
      for (i = 0; i < nodejsLovers; i++){
        docs.push({
          event: 'survey',
          data: {
            'loves': 'nodejs'
          }
        });
      }
      for (i = 0; i < railsLovers; i++){
        docs.push({
          event: 'survey',
          data: {
            'loves': 'rails'
          }
        });
      }
      EventModel.collection.insert(docs, done);
    });

    it('should be 80 nodejs lovers', function(done){
      MetricQuery.event('survey')
        .where({ 'data.loves': 'nodejs' })
        .count()
        .value()
        .then(function(count){
          expect(count).to.be.equal(80);
          done();
        });
    });

    it('should be 20 rails lovers', function(done){
      MetricQuery.event('survey')
        .where({ 'data.loves': 'rails' })
        .count()
        .value()
        .then(function(count){
          expect(count).to.be.equal(20);
          done();
        });
    });

    after(function(done){
      EventModel.remove({}, done);
    });

  });

  describe('Date Range Queries', function(){

    before(function(done){
      var signupsInLast7Days = 20;
      var signupsBeforeLastWeek = 80;
      var docs = [];
      var i;
      for (i = 0; i < signupsBeforeLastWeek; i++){
        docs.push({
          event: 'signup',
          timestamp: faker.date.between(reltime.parse(new Date(), '-365d'), reltime.parse(new Date(), '-7d')),
          data: {}
        });
      }
      for (i = 0; i < signupsInLast7Days; i++){
        docs.push({
          event: 'signup',
          timestamp: faker.date.between(reltime.parse(new Date(), '-7d'), new Date()),
          data: {}
        });
      }
      EventModel.collection.insert(docs, done);
    });

    it('should be 20 signups in the last week', function(done){
      MetricQuery.event('signup').from('-7d').count().value().then(function(count){
        expect(count).to.be.equal(20);
        done();
      });
    });

    it('should be 80 signups before the last week', function(done){
      MetricQuery.event('signup').from('-365d').to('-7d').count().value().then(function(count){
        expect(count).to.be.equal(80);
        done();
      });
    });

    it('should be 100 signups in the last year', function(done){
      MetricQuery.event('signup').from('-365d').count().value().then(function(count){
        expect(count).to.be.equal(100);
        done();
      });
    });

    after(function(done){
      EventModel.remove({}, done);
    });

  });

  describe('Combined Queries', function(){

    before(function(done){
      var gachaBuyers = 100;
      var docs = [];
      var i;
      for (i = 0; i < gachaBuyers; i++){
        docs.push({
          event: 'bought gacha',
          data: {
            'gacha_id': 19,
            'buyer_id': i,
            'price': 100
          }
        });
      }
      for (i = 0; i < gachaBuyers; i++){
        docs.push({
          event: 'bought gacha',
          data: {
            'gacha_id': 19,
            'buyer_id': i,
            'price': 300
          }
        });
      }
      for (i = 0; i < gachaBuyers; i++){
        var date = reltime.parse(new Date(), '-8d');
        if ( i < 40 ){
          date = reltime.parse(new Date(), '-6d');
        }
        docs.push({
          event: 'bought gacha',
          timestamp: date,
          data: {
            'gacha_id': 19,
            'buyer_id': i,
            'price': 900
          }
        });
      }
      EventModel.collection.insert(docs, done);
    });

    it('should be 200 cheap gachas bought', function(done){
      MetricQuery.event('bought gacha')
        .where({ 'data.price': { $lt: 900 } })
        .count()
        .value()
        .then(function(count){
          expect(count).to.equal(200);
          done();
        });
    });

    it('should be 40 expensive gachas bought in the last week', function(done){
      MetricQuery.event('bought gacha')
        .where({ 'data.price': { $gt: 500 } })
        .from('-7d')
        .count()
        .value()
        .then(function(count){
          expect(count).to.be.equal(40);
          done();
        });
    });

    it('should be 60 expensive gachas bought from last year up until last week', function(done){
      MetricQuery.event('bought gacha')
        .where({ 'data.price': { $gt: 500 } })
        .from('-365d')
        .to('-7d')
        .count()
        .value()
        .then(function(count){
          expect(count).to.be.equal(60);
          done();
        });
    });

    after(function(done){
      EventModel.remove({}, done);
    });

  });

  describe('Metric Expressions', function(){

    before(function(done){
      var nodejsLovers = 80;
      var railsLovers = 20;
      var docs = [];
      var i;
      for (i = 0; i < nodejsLovers; i++){
        docs.push({
          event: 'survey',
          data: {
            'loves': 'nodejs'
          }
        });
      }
      for (i = 0; i < railsLovers; i++){
        docs.push({
          event: 'survey',
          data: {
            'loves': 'rails'
          }
        });
      }
      EventModel.collection.insert(docs, done);
    });

    it('should be 0.8 proportion of survey participants who love nodejs', function(done){
      compute("event('survey').where({ 'data.loves': 'nodejs' }).count().value() / event('survey').count().value()")
        .then(function(value){
          expect(value).to.be.equal(0.8);
          done();
        });
    });

    it('should be greater than 80 % of survey participants who love nodejs', function(done){
      compute("( event('survey').where({ 'data.loves': 'nodejs' }).count().value() + 30 ) / ( event('survey').count().value() + 30 ) * 100")
        .then(function(value){
          expect(value).to.be.gt(80);
          done();
        });
    });

    after(function(done){
      EventModel.remove({}, done);
    });

  });

});
