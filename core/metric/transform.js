var valueTransform = function(input){
  return input;
}

var tableTransform = function(input, options){
  var output = {
    labels: options.labels, // copy options.labels
    data: []
  };

  // transform data for output in a table
  input.forEach(function(datum){
    var row = [];
    output.labels.forEach(function(label){
      row.push(datum[label]);
    });
    output.data.push(row);
  });

  return output;
}

var lineChartTransform = function(input, options){
  var output = {
    labels: options.labels,
    data: []
  };

  // transform data for output in a table
  input.forEach(function(datum){
    output.data.push(datum.value);
  });

  return output;
}

var pieChartTransform = function(input, options){
  var output = [];

  // transform data for output in a table
  input.forEach(function(datum){
    output.push({
      value: datum.value,
      label: datum.label
    });
  });

  return output;
}

var radarChartTransform = function(input, options){

}

var barChartTransform = function(input, options){

}

var transform = function(input, options){
  options = options || {};
  var transforms = {
    'value': valueTransform,
    'table': tableTransform,
    'line_chart': lineChartTransform,
    'bar_chart': lineChartTransform,
    'pie_chart': pieChartTransform
  }
  var transform = transforms[options.type];
  if ( transform ){
    return transform(input, options);
  } else {
    // error! unhandled transform type
  }
};

module.exports = transform;