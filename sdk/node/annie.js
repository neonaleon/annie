var request = require('superagent');
var RSVP = require('rsvp');

var annie = {
  options: {
    apiKey: '',
    apiUrl: 'http://kts-leonho/annie/api'
  },

  init: function(){
    if ( arguments.length == 1 && typeof arguments[0] === 'string' ){
      this.options.apiKey = arguments[0];
      this._init = true;
    }
  },

  // page: function(name){
  //   console.log('page');
  //   request
  //     .post(this.options.host + '/api/page')
  //     .end(function(err, res){
  //       if (res.error){

  //       } else {

  //       }
  //     });
  // },

  // identify: function(uid, data){
  //   console.log('identify');
  //   request
  //     .post(this.options.host + '/api/identify/' + uid)
  //     .send(data)
  //     .end(function(err, res){
  //       if (res.error){

  //       } else {

  //       }
  //     });
  // },

  track: function(event, data){
    if (!this._init){
      console.error('Annie - apiKey not set, call init("YOUR-API-KEY") first!');
      return;
    }
    data = data || {};
    var apiEndpoint = this.options.apiUrl + '/track';
    var apiKey = this.options.apiKey;
    return new RSVP.Promise(function(resolve, reject){
      request
        .post(apiEndpoint)
        .set('X-API-KEY', apiKey)
        .send({
          event: event,
          data: data,
          timestamp: new Date()
        })
        .end(function(err, res){
          resolve(res);
          reject(err);
        });
    });
  }
}

module.exports = annie;