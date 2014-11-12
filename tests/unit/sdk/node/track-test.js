var chai = require('chai');
var expect = chai.expect;
var request = require('superagent');

var config = require('../../../../config'); // load app configs
var models = require('../../../../models');
var EventModel = models.EventModel;

var apiKey = 'xxx';
var annie = require('../../../../sdk/node/annie');
annie.init(apiKey);

describe('NodeJS SDK for Track API', function(){

  // before each test, clear db, or insert fake data
  beforeEach(function(done){
    done();
    // EventModel.remove({}, done);
    // same as
    // EventModel.remove({}, function(err){
    //   if (err) done(err);
    //   done();
    //   // else EventModel.create({}, done); // done accepts err object
    // });
  });

  it('should track a Test event', function(done){
    annie.track('Test', {
      'sdk': 'node'
    })
    .then(function(res){
      EventModel.find({ event: 'Test', data: { 'sdk': 'node' } }, function(err, doc){
        expect(doc).to.not.be.null;
        done(err);
      });
    })
    .catch(function(err){
      done(err);
    });
  });

  after(function(done){
    EventModel.remove({}, done);
  })

});