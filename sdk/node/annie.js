var request = require('superagent');

var annie = {
  options: {
    apiKey: '',
    host: 'http://10.25.11.45:3000'
  },

  init: function(){
    if ( arguments.length == 1 && typeof arguments[0] === 'string' ){
      this.options.apiKey = arguments[0];
    } else {
      console.error('Annie::apiKey not set.');
    }
  },

  page: function(name){
    console.log('page');
    request
      .post(this.options.host + '/api/page')
      .end(function(err, res){
        if (res.error){

        } else {

        }
      });
  },

  track: function(event, data){
    request
      .post(this.options.host + '/api/track')
      .send({
        event: event,
        data: data,
        timestamp: new Date()
      })
      .end(function(err, res){
        if (res.error){

        } else {

        }
      });
  },

  identify: function(uid, data){
    console.log('identify');
    request
      .post(this.options.host + '/api/identify/' + uid)
      .send(data)
      .end(function(err, res){
        if (res.error){

        } else {

        }
      });
  }
}

module.exports = annie;