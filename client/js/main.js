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
        var viewData = {
          dashboard: {
            layout: gridster.serialize()
          }
        };

        $.ajax({
          type: 'POST',
          url: '',
          data: JSON.stringify(viewData),
          contentType: 'application/json; charset=utf-8'
        });
      }
    },
    serialize_params: function($w, wgd){
      return {
        'metric-id': $w.data('metric-id'),
        col: wgd.col,
        row: wgd.row,
        size_x: wgd.size_x,
        size_y: wgd.size_y
      };
    }
  }).data('gridster');

  if (gridster){

    var initializeDashboardItems = function(){
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
    }

    // add method to deserialize dashboard layout from server
    gridster.deserialize = function(serialization){
      var table = {};
      var widgets = gridster.$widgets.each(function(){
        var $w = $(this);
        table[$w.data('metric-id')] = $w;
      });

      serialization.forEach(function(info){
        var $w = table[info['metric-id']];
        gridster.remove_widget($w);
        // using add_widget on existing widget to reposition it
        gridster.add_widget($w[0].outerHTML, info.size_x, info.size_y, info.col, info.row);
      });

      $('.loading-spinner').remove();
    };

    $('.gridster').before('<div class="center-block loading-spinner"><div class="fa fa-spinner fa-spin fa-5x center-block loading-spinner"></div></div>');

    $.ajax({
      type: 'GET',
      url: location.href + '/layout'
    }).done(function(res){
      gridster.deserialize(res);

      initializeDashboardItems();
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
  $('#loginEmail').focus();
  $('#loginPassword')
    .focusin(function(){
      $('#owl-login').addClass('password');
    })
    .focusout(function(){
      $('#owl-login').removeClass('password');
    });
})