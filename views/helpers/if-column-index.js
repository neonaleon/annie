module.exports = function(columns, index, test, options){
  if ( index % columns == test ){
    return options.fn(this);
  }
  return options.inverse(this);
}