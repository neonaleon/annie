var hbs = require('hbs');

module.exports = function(label, route){
  var activeRoute = this.url.substr(1) === route;
  var active = activeRoute ? ' class="active"' : '';

  return new hbs.handlebars.SafeString('<li' + active + '><a href="' + route + '">' + label + '</a></li>');
}