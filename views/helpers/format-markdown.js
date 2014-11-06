var Showdown = require('showdown');
var converter = new Showdown.converter();

module.exports = function(input){
  return converter.makeHtml(input);
}