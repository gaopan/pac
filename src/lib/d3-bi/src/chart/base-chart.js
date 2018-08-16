import * as d3 from "d3"

import core from '../core'
import utils from '../utils'

import ChartUtils from './models/chart-utils'

import Axis from './models/axis'
import Legend from './models/legend'
import Tooltip from './models/tooltip'
import AxisLines from './models/axis-lines'
import Bar from './models/bar'
import Spot from './models/spot'
import Line from './models/line'
import LineTooltip from './models/line-tooltip'
import StackBar from './models/stack-bar'

var baseChart = function(type) {
  var duration = 500,
    yOriginValue = 0,
    xOriginValue = null,
    margin = {top: 20, right: 20, bottom: 15, left: 15},
    x = function(d){ return d.label},
    y = function(d){ return d.value},
    y2 = null;

  chart.xAxis = Axis.call(chart).axisName('x');
  chart.yAxis = Axis.call(chart).axisName('y');
  chart.legend = Legend.call(chart);
  chart.tooltip = Tooltip.call(chart);
  chart.axisLines = AxisLines.call(chart);

  chart.tooltipDispatch = d3.dispatch('build', 'setPosition', 'remove', 'click');
  chart.tooltipDispatch.on('build', chart.tooltip.build());
  chart.tooltipDispatch.on('setPosition', chart.tooltip.setPosition());
  chart.tooltipDispatch.on('remove', chart.tooltip.remove());

  chart.legendDispatch = d3.dispatch('click');
  chart.legendDispatch.on('click', chart.legend.defaultClick);

  chart.chartName = 'base-chart';

  chart.xAxis
    .axis(d3.axisBottom())
    .scale(d3.scaleBand().padding(0.2));
  chart.yAxis
    .axis(d3.axisLeft())
    .scale(d3.scaleLinear());
  chart.axisLines.pattern({x: false, y: true});

  if (type) {
    switch (type) {
      case 'bar':
        chart.chartName = 'bar-chart';
        chart.bar = Bar.call(chart);
      break;

      case 'stackBar':
        chart.chartName = 'stackBar-chart';
        chart.stackBar = StackBar.call(chart);

        chart.yAxis.stackModel(true);
        chart.legend.visibility(true);
      break;

      case 'spot':
        chart.chartName = 'spot-chart';
        chart.spot = Spot.call(chart);
      break;

      case 'horizontalBar':
        chart.chartName = 'horizontalBar-chart';
        chart.horizontalBar = Bar.call(chart).barType('horizontalBar');

        xOriginValue = 0;
        yOriginValue = null;
        chart.xAxis.scale(d3.scaleLinear());
        chart.yAxis.scale(d3.scaleBand().padding(0.2));
        chart.axisLines.pattern({x: true, y: false});
      break;

      default:
        console.error('A Wrong Chart Type.');
        return ;
      break;
    }
  }else {
    chart.bar = Bar.call(chart);
    chart.spot = Spot.call(chart);
    chart.line = Line.call(chart);
    chart.lineTooltip = LineTooltip.call(chart);
    chart.horizontalBar = Bar.call(chart).barType('horizontalBar');
  }

  function chart(selections) {
    selections.each(function(data) {
      var hContainer = d3.select(this),
        xScale = chart.xAxis.scale(),
        yScale = chart.yAxis.scale(),
        y2Scale = y2 ? chart.y2Axis.scale() : null;

      chart.data = data;
      chart.hContainer = hContainer;

      // set class, width and height.
      ChartUtils.initContainer(hContainer, {
        chart: chart,
        chartName: chart.chartName
      });
      chart.width = hContainer.attr('width');
      chart.height = hContainer.attr('height');

      // no data chart
      // delete the data with values eq null, [] or ...
      if (utils.isArray(data) && data.length) {
        var resData = [];
        data.forEach(function(ele, i){ utils.isArray(ele.values) && ele.values.length && resData.push(ele); });

        if (resData.length) {
          data = resData;
        }else {
          ChartUtils.buildNoDataChart(hContainer);
          return ;
        }
      }else {
        ChartUtils.buildNoDataChart(hContainer);
        return ;
      }

      // build legend, include deleted data
      hContainer.iappend('g.legend-groups')
        .datum(data)
        .call(chart.legend);

      // remove deleted data
      var resData = [];
      data.forEach(function(ele, i){ !ele.deleted && resData.push(ele); });
      data = resData;
      
      if(chart.stackBar) chart.stackData = ChartUtils.stackAdapter(data, {x: chart.x(), y: chart.y()});

      // auto settings
      if (data.length >= 2) chart.tooltip.showName(true);

      // set all axis's scale. PS: with temporary range.
      ['x', 'y', 'y2'].forEach(function(ele){
        var fn = chart[ele]();
        if (fn) {
          var axis = ele + 'Axis',
            scale = chart[axis].scale(),
            domain = null,
            givenDomain = chart[axis].givenDomain();

          scale.range([0, 100]);

          if ( givenDomain !== null && !utils.isFunction(givenDomain) ) {
            scale.domain(givenDomain);
          }else {
            if (chart.stackBar && chart[axis].stackModel()) {
              var min = d3.max(chart.stackData[0], function(d){ return d[0]});
              var max = d3.max(chart.stackData[chart.stackData.length-1], function(d){ return d[1]});
              domain = [min, max];
            }else {
              domain = ChartUtils.getScaleDomain(scale, data, fn, {axis: ele});
            }
              
            if ( utils.isFunction(givenDomain) ) {
              domain = givenDomain(domain, chart);
            }else {
              domain = ChartUtils.transformDomain(domain, chart[axis]);
            }

            scale.domain(domain);
          }
        }
      });

      // get someone's height
      chart.legendHeight = chart.legend.getSpace(hContainer.select('g.legend-groups')).height;

      var temp = ChartUtils.getAxisHeight(hContainer, {
        xAxis: chart.xAxis,
        yAxis: chart.yAxis,
        y2Axis: chart.y2Axis
      });
      chart.xAxisHeight = temp.xAxisHeight;
      chart.yAxisHeight = temp.yAxisHeight;
      chart.y2AxisHeight = temp.hasOwnProperty('y2AxisHeight') ? temp.y2AxisHeight : 0;

      // count some space
      chart.xAxisWidth = chart.width - margin.left - chart.yAxisHeight - chart.y2AxisHeight - margin.right;
      chart.yAxisWidth = chart.height - margin.top - chart.legendHeight - chart.xAxisHeight - margin.bottom;
      chart.xAxisPosition = {x: margin.left + chart.yAxisHeight, y: chart.height - margin.bottom - chart.xAxisHeight};
      chart.yAxisPosition = {x: margin.left + chart.yAxisHeight, y: margin.top + chart.legendHeight};
      chart.y2AxisPosition = {x: chart.yAxisPosition.x + chart.xAxisWidth, y: chart.yAxisPosition.y};

      // set right range
      xScale.range([0, chart.xAxisWidth]);
      yScale.range([chart.yAxisWidth, 0]);
      if (y2Scale) y2Scale.range([chart.yAxisWidth, 0]);

      // build axis
      var hAxis = hContainer.iappend('g.axis-groups');
      hAxis.iappend('g.xaxis-group').call(chart.xAxis);
      hAxis.iappend('g.yaxis-group').call(chart.yAxis);
      if (chart.hasOwnProperty('y2Axis')) hAxis.iappend('g.y2axis-group').call(chart.y2Axis);

      // set right origin value
      if (xOriginValue !== null) {
        var sConfig = ChartUtils.getScaleConfig(xScale, {hAxis: hAxis.select('g.xaxis-group')});
        if (sConfig.list.indexOf(xOriginValue) === -1) xOriginValue = xScale.domain()[0];
      }
      if (yOriginValue !== null) {
        // TODO will cause problem: Don't save yOriginValue!
        var sConfig = ChartUtils.getScaleConfig(yScale, {hAxis: hAxis.select('g.yaxis-group')});
        if (sConfig.list.indexOf(yOriginValue) === -1) yOriginValue = yScale.domain()[0];
      }

      // build axis lines
      hAxis.iappend('g.axis-line-groups').datum(data).call(chart.axisLines);

      if (type) {
        // if has specail type
        hContainer.iappend('g.'+ type +'-groups')
          .datum(chart.stackBar ? chart.stackData : data)
          .call(chart[type]);
      }else {
        // dispense data
        var dData = ChartUtils.dispenseData(data);

        // build bar
        if (dData.bar && dData.bar.length > 0) {
          hContainer.iappend('g.bar-groups')
            .datum(dData.bar)
            .call(chart.bar);
        }else if (hContainer.select('g.bar-groups').size()) {
          hContainer.select('g.bar-groups').html('');
        }
        
        // build Line
        if (dData.line && dData.line.length > 0) {
          hContainer.iappend('g.line-groups')
            .datum(dData.line)
            .call(chart.line);
        }else if (hContainer.select('g.line-groups').size()) {
          hContainer.select('g.line-groups').html('');
        }

        // build spot
        if (dData.spot && dData.spot.length > 0) {
          hContainer.iappend('g.spot-groups')
            .datum(dData.spot)
            .call(chart.spot);
        }else if ( hContainer.select('g.spot-groups').size() ) {
          hContainer.select('g.spot-groups').html('');
        }

        // build horizontalBar
        if (dData.horizontalBar && dData.horizontalBar.length > 0) {
          hContainer.iappend('g.horizontalBar-groups')
            .datum(dData.horizontalBar)
            .call(chart.horizontalBar);
        }else if ( hContainer.select('g.horizontalBar-groups').size() ) {
          hContainer.select('g.horizontalBar-groups').html('');
        }
      }
    });
  }

  chart.yOriginValue = function(v) {
    if (!arguments.length) return yOriginValue;
    yOriginValue = v;
    return chart;
  }
  chart.xOriginValue = function(v) {
    if (!arguments.length) return xOriginValue;
    xOriginValue = v;
    return chart;
  }
  chart.duration = function(v) {
    if (!arguments.length) return duration;
    duration = +v;
    return chart;
  }
  chart.margin = function(v) {
    if (!arguments.length) return margin;
    margin.top = v.top !== undefined ? +v.top : margin.top;
    margin.right = v.right !== undefined ? +v.right : margin.right;
    margin.bottom = v.bottom !== undefined ? +v.bottom : margin.bottom;
    margin.left = v.left !== undefined ? +v.left : margin.left;
    return chart;
  }
  chart.x = function(v) {
    if (!arguments.length) return x;
    x = v;
    return chart;
  }
  chart.y = function(v) {
    if (!arguments.length) return y;
    y = v;
    return chart;
  }
  chart.y2 = function(v) {
    if (!arguments.length) return y2;
    y2 = v;

    // set y2Axis
    if (y2) {
      chart.y2Axis = Axis.call(chart).axisName('y2');
      chart.y2Axis
        .axis(d3.axisRight())
        .scale(d3.scaleLinear());
    }else if(chart.hasOwnProperty('y2Axis')){
      delete chart.y2Axis;
    }

    return chart;
  }

  return chart;
};

export default baseChart
