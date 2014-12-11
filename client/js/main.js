// BS MATERIAL
$(document).ready(function() {
  $.material.init();

  $('#complete-dialog').on('show.bs.modal', function(event){
    var modal = $(this);
    var modalData = modal.data('modal');
    modal.find('.modal-title').html(modalData.title);
    modal.find('.modal-body').html(modalData.body);
    modal.find('.modal-footer').html(modalData.footer);
  });
});

// DASHBOARD
var gridster;
$(document).ready(function(){
  gridster = $(".gridster ul").gridster({
    widget_margins: [10, 10],
    widget_base_dimensions: [ ( $(window).width() - 100 ) / 4, 140],
    min_cols: 4,
    max_cols: 4,
    resize: {
      enabled: false,
      max_size: [4, 4],
      min_size: [1, 1],
      resize: function(e, ui, $widget){
        $widget.find('.metric-flot').data('chart').resize();
      }
    },
    draggable: {
      stop: function(e, ui){
        $.ajax({
          type: 'POST',
          data: {
            dashboard: {
              layout: JSON.stringify(gridster.serialize())
            }
          },
          dataType: 'json'
        });
      }
    },
    serialize_params: function($w, wgd){
      return {
        'metric-id': $w.data('metric-id'),
        col: wgd.col,
        row: wgd.row,
        sizex:
        wgd.size_x,
        sizey: wgd.size_y
      };
    }
  }).data('gridster');

  if (gridster){
    gridster.deserialize = function(obj){
      obj.forEach(function(info){
        var elem = $('[data-metric-id=' + info['metric-id'] + ']');
        Object.keys(info).forEach(function(k){
          elem.attr('data-' + k, info[k]);
        })
      });
    };

    $.ajax({
      type: 'GET',
      url: location.href + '/layout'
    }).done(function(res){
      console.log(res);
      gridster.deserialize(res);
    })

    $('.dashboard-item').mousedown(function(){
      $(this).addClass('shadow-z-1');
    });

    var dashboardItemClickHandler = function(event){
      var $item = $(event.delegateTarget);
      if ($item.hasClass('player-revert')){
        return false;
      }

      $('#complete-dialog').data('modal', {
        title: $item.data('metric-id'),
        body: $item.data('metric-id'),
        footer: '<button class="btn btn-primary" data-dismiss="modal">close</button>'
      }).modal('show');
    };

    $('.gridster li').each(function(i, e){
      var $item = $(e);
      $item.on('transitionend', function(event){
        // console.log(event);
        $item.find('.dashboard-item').removeClass('shadow-z-1');
        // player-revert is a gridster class that marks the last moved element
        $item.removeClass('player-revert');
      });
      $item.on('click', dashboardItemClickHandler);
    });

    Chart.defaults.global.maintainAspectRatio = false;
    Chart.defaults.global.responsive = true;
    Chart.defaults.global.animation = false;

    var drawCharts = function(){
      $('.metric-flot').each(function(i, e){
        var data = JSON.parse($(e).find('.metric-data').html());
        var metricType = $(e).data('metric-type');
        var options = {
          bezierCurve: false,
          datasetFill: false
        };

        var canvas = $(e).find('canvas');
        var width = canvas.parent().width();
        canvas.attr('width', width);
        var ctx = canvas.get(0).getContext('2d');
        var chart;
        switch (metricType) {
          case 'line':
            chart = new Chart(ctx).Line({
              labels: data.labels,
              datasets: [
                {
                  pointColor: '#4285f4',
                  data: data.data
                }
              ]
            }, options);
            break;
          case 'bar':
            chart = new Chart(ctx).Bar({
              labels: data.labels,
              datasets: [
                {
                  pointColor: '#4285f4',
                  data: data.data
                }
              ]
            }, options);
            break;
          case 'pie':
            // use circumference to compute %
            options.tooltipTemplate = '<%if (label){%><%=label%>: <%}%><%= (circumference / (Math.PI * 2) * 100).toFixed(2) %>%';
            var colors = [ '#5B90BF', '#96b5b4', '#a3be8c', '#ab7967', '#d08770', '#b48ead' ];
            data.forEach(function(datum, i){
              datum.color = colors[i % colors.length];
            });
            chart = new Chart(ctx).Pie(data, options);
            // var img = $('<img>');
            // img.attr('src', pieChart.toBase64Image());
            // canvas.after(img);
            var legend = $(chart.generateLegend());
            $(e).find('.legend').append(legend);
            break;
        }
        $(e).data('chart', chart);
      });
    }
    drawCharts();
  }
});

// LOGIN
$(document).ready(function(){
  $('#loginPassword')
    .focusin(function(){
      $('#owl-login').addClass('password');
    })
    .focusout(function(){
      $('#owl-login').removeClass('password');
    });
})