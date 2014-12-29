var valueTransform = function(input){
  // expects an array with 1 doc { _id: null, value: X }
  if (input && input.length > 0){
    return input[0].value;
  }
  return 0;
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
    labels: [],//options.labels,
    data: []
  };

  input.forEach(function(datum){
    if (typeof datum.label === 'object'){
      var tg = datum.label; // timeGroup, see parser.pegjs
      // use the finest part of the timeGroup as the label
      datum.label = tg.hour || tg.day || tg.week || tg.month || tg.year;
    }
    output.labels.push(datum.label);
    output.data.push(datum.value);
  });

  return output;
}

var pieChartTransform = function(input, options){
  var output = [];

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
  var transformSelector = function(type, subtype){
    switch(type){
      case 'value':
        return valueTransform;
      case 'table':
        return tableTransform;
      case 'chart':
        switch(subtype){
          case 'line':
            return lineChartTransform;
          case 'bar':
            return lineChartTransform;
          case 'pie':
            return pieChartTransform;
        }
      default:
        break;
    }
  }
  var transform = transformSelector(options.type, options.subtype);
  return transform(input, options);
};

module.exports = transform;