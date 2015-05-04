var request = require('superagent');
var RSVP = require('rsvp');

var annie = {
  options: {
    apiKey: '',
    /**
     * set apiUrl to where you are mounting Annie
     * e.g. apiUrl: 'http://kts-leonho/annie/api'
     */
    apiUrl: 'http://annie-node-1522.herokuapp.com/api'
  },

  init: function(){
    if ( arguments.length == 1 && typeof arguments[0] === 'string' ){
      this.options.apiKey = arguments[0];
      this._init = true;
    }
  },

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