var parse = require('../../core/parser').parse;

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

        var tokens = location.href.split('/');
        tokens.length -= 1; // remove /dashboard
        tokens.push('metric', $item.data('metric-id'));
        var path = tokens.join('/');

        $.get(path)
        .done(function(res){
          console.log(res);
          $('#complete-dialog').data('modal', {
            title: '<strong>' + res.name + '</strong>',
            body: '<h6>Expression</h6>' + '<p>' + res.expression + '</p>',
            footer: '<a class="btn btn-default" href="' + path + '/edit' + '">edit</a><button class="btn btn-primary" data-dismiss="modal">close</button>'
          }).modal('show');
        });
      };

      $('.gridster li').each(function(i, e){
        var $item = $(e);
        $item.on('transitionend', function(event){
          if (!$item.hasClass('dragging'))
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
        if ($w) {
          gridster.remove_widget($w);
          // using add_widget on existing widget to reposition it
          var size_x = $w.data('sizex');
          var size_y = $w.data('sizey');
          gridster.add_widget($w[0].outerHTML, size_x, size_y, info.col, info.row);
        }
      });

      $('.loading-spinner').remove();
      $('.gridster').each(function(){ $(this).css('opacity', 1); });
    };

    $('.gridster').before('<div class="center-block loading-spinner"><div class="fa fa-spinner fa-spin fa-5x center-block loading-spinner"></div><h3>Loading your dashboard...</h3></div>');
    $('.gridster').each(function(){ $(this).css('opacity', 0); });

    $.ajax({
      type: 'GET',
      url: location.href + '/layout'
    }).done(function(res){
      setTimeout(function(){
        gridster.deserialize(res);
        initializeDashboardItems();
        drawCharts();
      }, 0);
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
            var legend = $(chart.generateLegend());
            $(e).find('.legend').append(legend);
            break;
        }
        $(e).data('chart', chart);
      });
    }
  }
});

// METRIC
$(document).ready(function(){
  var timer = null;
  var scheduleParseInput = function(){
    var input = $(this).val();
    var inputFormGroup = $('#expression-form-group');
    var helpBlock = $('#expression-feedback');
    var submitButton = $('#submitButton');
    if (timer){
      clearTimeout(timer);
    }
    timer = setTimeout(function(){
      try {
        var result = parse(input);
        inputFormGroup.removeClass('has-error');
        helpBlock.html('');
        submitButton.removeAttr('disabled');
      } catch(e){
        inputFormGroup.addClass('has-error');
        helpBlock.html('<p>Parse Error</p><p>' + 'at line: ' + e.line + ' column: ' + e.column + '</p><p>' + e.message + '</p>');
        submitButton.attr('disabled', 'disabled');
      }
    }, 500);
  }
  $('#expression-input').each(function(){
    $(this)
      .change(scheduleParseInput)
      .keyup(scheduleParseInput)
      .keydown(scheduleParseInput);
  });

  var deleteButton = $('#deleteButton').click(function(e){
    e.preventDefault();
    if (confirm('Truly, madly, deeply delete this metric?')) {
      $.ajax({
        type: 'DELETE',
        url: location.pathname
      })
      .done(function(res){
        location.href = res.redirect;
      });
    }
  });

  $(window).scroll(function(event){
    // keep the form on top
    $('#metric-form').css('margin-top', $(this).scrollTop());
  });

  $('#event-filter').keyup(function(e){
    var search = $(this).val();
    $('#event-list div')
      .each(function(){
        if (this.id.indexOf(search) == -1) {
          $(this).hide();
        } else {
          $(this).show();
        }
      });
  });
});

// LOGIN & SIGNUP
$(document).ready(function(){
  $('#loginEmail').focus();
  $('#loginPassword')
    .focusin(function(){
      $('#owl-login').addClass('password');
    })
    .focusout(function(){
      $('#owl-login').removeClass('password');
    });


  var alert = $('#alert-area .login-failure');
  alert.hide();
  var qs = getUrlParameters();
  if (qs['status'] == 'failed'){
    alert.show();
  }
});

$(document).ready(function(){
  var alert = $('#alert-area .signup-success');
  alert.hide();
  var qs = getUrlParameters();
  if (qs['signedup']){
    alert.show();
  }
});

$(document).ready(function(){
  var alert = $('#alert-area .signup-failure');
  alert.hide();
  var qs = getUrlParameters();
  if (qs['error'] == 'duplicate'){
    alert.show();
  }
});

function getUrlParameters() {
    var qs = (function(a) {
    if (a == "") return {};
    var b = {};
    for (var i = 0; i < a.length; ++i)
    {
        var p=a[i].split('=', 2);
        if (p.length == 1)
            b[p[0]] = "";
        else
            b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
    }
    return b;
  })(window.location.search.substr(1).split('&'));
  return qs;
}