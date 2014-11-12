var faker = require('faker');
var expect = require('chai').expect;
var compute = require('../../../../core/metric').compute;
var MetricQuery = require('../../../../core/metric/query');

var config = require('../../../../config'); // load app configs
var models = require('../../../../models');
var EventModel = models.EventModel;

describe('MetricQuery', function(){

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

  describe('Counting Queries', function(){

    it('There are 80 nodejs lovers', function(done){
      MetricQuery.event('survey')
        .where({ 'data.loves': 'nodejs' })
        .count()
        .value()
        .then(function(count){
          expect(count).to.equal(80);
          done();
        });
    });

    it('There are 20 rails lovers', function(done){
      MetricQuery.event('survey')
        .where({ 'data.loves': 'rails' })
        .count()
        .value()
        .then(function(count){
          expect(count).to.equal(20);
          done();
        });
    });

  });

  after(function(done){
    EventModel.remove({}, done);
  });

  describe('Date Range Queries', function(){
    // it('should be 0', function(done){
    //   MetricQuery.event('survey').where({ 'data.none': 'haha'}).count().value().then(function(count){
    //     expect(count).to.equal(0);
    //     done();
    //   });
    // });

    // it('should be 2', function(done){
    //   MetricQuery.event('survey').where({ 'data.none': 'hehe'}).count().value().then(function(count){
    //     expect(count).to.equal(2);
    //     done();
    //   });
    // });
  });
});
