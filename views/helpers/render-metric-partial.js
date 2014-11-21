var fs = require('fs');
var path = require('path');
var hbs = require('hbs');

module.exports = function(){
  var source;
  switch(this.settings.metricType){
    case 'value':
      break;
    case 'table':
      break;
    case 'line_chart':
    case 'pie_chart':
    case 'bar_chart':
      if (typeof this.value === 'object') {
        this.value = JSON.stringify(this.value);
      }
      break;
  }
  source = fs.readFileSync(path.join(__dirname, '../partials/metric_' + this.settings.metricType + '.hbs'), { encoding: 'utf8' });
  var template = hbs.handlebars.compile(source);
  return template(this);
}