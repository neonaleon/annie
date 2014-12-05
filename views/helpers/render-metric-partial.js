var fs = require('fs');
var path = require('path');
var hbs = require('hbs');

module.exports = function(){
  console.dir(this.result);
  var source;
  switch(this.result.options.type){
    case 'value':
      this.data = this.result.data;
      break;
    case 'table':
      this.data = this.result.data;
      break;
    case 'chart':
      switch(this.result.options.subtype){
        case 'line':
        case 'pie':
        case 'bar':
        this.data = JSON.stringify(this.result.data);
      }
      break;
  }
  var partialFile = '../partials/metric_' + this.result.options.type + (this.result.options.subtype ? ('_' + this.result.options.subtype) : '') + '.hbs';
  console.log(partialFile);
  source = fs.readFileSync(path.join(__dirname, partialFile), { encoding: 'utf8' });
  var template = hbs.handlebars.compile(source);
  return template(this);
}