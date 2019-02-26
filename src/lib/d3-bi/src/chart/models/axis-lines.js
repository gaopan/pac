import * as d3 from "d3"

import utils from '../../utils.js'
import ChartUtils from './chart-utils'

var AxisLines = function() {
  var host = this,
    pattern = {x: true, y: true}, // create x/y lines ro no
    showAll = {x: true, y: true},
    focusLineValue = {x: null, y: null};

  function model(selections) {
    selections.each(function(data) {
      var hContainer = d3.select(this);

      hContainer.html('')
        .attr('transform', 'translate('+ host.yAxisPosition.x +','+ host.yAxisPosition.y +')');

      if (pattern.x) {
        var hXGroup = hContainer.append('g').classed('x-group', true);

        var xScale = host.xAxis.scale();
        var xScaleConfig = ChartUtils.getScaleConfig(xScale, {hAxis: host.hContainer.select('g.xaxis-group')});
        var xOriginValue = host.hasOwnProperty('xOriginValue') ? host.xOriginValue() : null;
        var fLineValue = focusLineValue.x !== null ? focusLineValue.x : xOriginValue;

        if (showAll.x) {
          hXGroup.selectAll('line')
            .data(xScaleConfig.list)
            .enter()
            .append('line')
            .attr('x1', function(d){ return xScale(d) + xScaleConfig.offset})
            .attr('y1', 0)
            .attr('x2', function(d){ return xScale(d) + xScaleConfig.offset})
            .attr('y2', host.yAxisWidth)
            .classed('origin-axis-line', function(d){ return d === fLineValue ? true : false;});
        }else {
          if (fLineValue !== null) {
            hXGroup.append('line')
              .attr('x1', xScale(fLineValue) + xScaleConfig.offset )
              .attr('y1', 0)
              .attr('x2', xScale(fLineValue) + xScaleConfig.offset )
              .attr('y2', host.yAxisWidth)
              .classed('origin-axis-line', true);
          }
        }
      }
      if (pattern.y) {
        var hYGroup = hContainer.append('g').classed('y-group', true);

        // when don't select all data relation y axis. we will use y2.
        var curAxis = useYaxisOrY2axis(data);
        var yScale = host[curAxis+'Axis'].scale();
        var yScaleConfig = ChartUtils.getScaleConfig(yScale, {hAxis: host.hContainer.select('g.'+ curAxis +'axis-group')});
        var yOriginValue = host.hasOwnProperty('yOriginValue') ? host.yOriginValue() : null;
        var fLineValue = focusLineValue.y !== null ? focusLineValue.y : yOriginValue;
        
        if (showAll.y) {
          hYGroup.selectAll('line')
            .data(yScaleConfig.list)
            .enter()
            .append('line')
            .attr('x1', 0)
            .attr('y1', function(d){ return yScale(d) + yScaleConfig.offset })
            .attr('x2', host.xAxisWidth )
            .attr('y2', function(d){ return yScale(d) + yScaleConfig.offset })
            .classed('origin-axis-line', function(d){ return d === fLineValue ? true : false;});
        }else {
          if (fLineValue !== null) {
            hYGroup.append('line')
              .attr('x1', 0)
              .attr('y1', yScale(fLineValue) + yScaleConfig.offset )
              .attr('x2', host.xAxisWidth )
              .attr('y2', yScale(fLineValue) + yScaleConfig.offset )
              .classed('origin-axis-line', true);
          }
        }
      }

      function useYaxisOrY2axis(data) {
        var useAxis = 'y2';
        data.some(function(ele){
          if (!ele.axis || ele.axis != 'y2') {
            useAxis = 'y';
            return true;
          }
        });
        return useAxis;
      }
    });
  }

  model.pattern = function(v) {
    if (!arguments.length) return pattern;
    pattern.x = v.x !== undefined ? !!v.x : pattern.x;
    pattern.y = v.y !== undefined ? !!v.y : pattern.y;
    return model;
  };
  model.showAll = function(v) {
    if (!arguments.length) return showAll;
    showAll.x = v.x !== undefined ? !!v.x : showAll.x;
    showAll.y = v.y !== undefined ? !!v.y : showAll.y;
    return model;
  };
  model.focusLineValue = function(v) {
    if (!arguments.length) return focusLineValue;
    focusLineValue.x = v.x !== undefined ? v.x : focusLineValue.x;
    focusLineValue.y = v.y !== undefined ? v.y : focusLineValue.y;
    return model;
  };

  return model;
}

export default AxisLines
