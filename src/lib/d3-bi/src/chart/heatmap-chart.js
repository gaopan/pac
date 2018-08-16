import * as d3 from 'd3'

import core from '../core'
import utils from '../utils'

import ChartUtils from './models/chart-utils'

import Axis from './models/axis'
import AxisLines from './models/axis-lines'
import Legend from './models/legend'

var heatmapChart = function() {
  var duration = 500,
    margin = { top: 20, right: 15, bottom: 15, left: 15 },
    colors = [
      "#ff931e", "#01c9fe", "#82e237", "#d62728", "#9467bd"
    ];
  chart.xAxis = Axis.call(chart).axisName('x');
  chart.yAxis = Axis.call(chart).axisName('y');
  chart.legend = Legend.call(chart);
  // chart.tooltip = Tooltip.call(chart);
  chart.axisLines = AxisLines.call(chart);

  chart.chartName = 'heatmap-chart';
  chart.xAxis
    .axis(d3.axisBottom())
    .scale(d3.scaleBand().padding(0.2));
  chart.yAxis
    .axis(d3.axisLeft())
    .scale(d3.scaleLinear());
  chart.axisLines.pattern({ x: false, y: true });

  function chart(selections) {
    selections.each(function(data) {
      xScale = chart.xAxis.scale(),
        yScale = chart.yAxis.scale(),
        y2Scale = y2 ? chart.y2Axis.scale() : null;

      chart.data = data;
      chart.hContainer = hContainer;

      ChartUtils.initContainer(hContainer, { chartName: chart.chartName });
      chart.width = hContainer.attr('width');
      chart.height = hContainer.attr('height');
      ChartUtils.initContainer(hContainer, { chartName: chart.chartName });

      chart.width = hContainer.attr('width');
      chart.height = hContainer.attr('height');
      if (!data) {
        ChartUtils.buildNoDataChart(hContainer);
        return;
      }
      chart.colors = colors;

      hContainer.iappend('g.legend-groups')
        .datum(data)
        .call(chart.legend);

      ['x', 'y', 'y2'].forEach(function(ele) {
        var fn = chart[ele]();
        if (fn) {
          var axis = ele + 'Axis',
            scale = chart[axis].scale(),
            domain = null,
            givenDomain = chart[axis].givenDomain();

          scale.range([0, 100]);

          if (givenDomain !== null && !utils.isFunction(givenDomain)) {
            scale.domain(givenDomain);
          } else {
            if (chart.stackBar && chart[axis].stackModel()) {
              var min = d3.max(chart.stackData[0], function(d) { return d[0] });
              var max = d3.max(chart.stackData[chart.stackData.length - 1], function(d) { return d[1] });
              domain = [min, max];
            } else {
              domain = ChartUtils.getScaleDomain(scale, data, fn);
            }

            if (utils.isFunction(givenDomain)) {
              domain = givenDomain(domain, chart);
            } else {
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
      chart.xAxisPosition = { x: margin.left + chart.yAxisHeight, y: chart.height - margin.bottom - chart.xAxisHeight };
      chart.yAxisPosition = { x: margin.left + chart.yAxisHeight, y: margin.top + chart.legendHeight };
      chart.y2AxisPosition = { x: chart.yAxisPosition.x + chart.xAxisWidth, y: chart.yAxisPosition.y };

      // set right range
      xScale.rangeRound([0, chart.xAxisWidth]);
      yScale.rangeRound([chart.yAxisWidth, 0]);
      if (y2Scale) y2Scale.rangeRound([chart.yAxisWidth, 0]);

      // build axis
      var hAxis = hContainer.iappend('g.axis-groups');
      hAxis.iappend('g.xaxis-group').call(chart.xAxis);
      hAxis.iappend('g.yaxis-group').call(chart.yAxis);
      if (chart.hasOwnProperty('y2Axis')) hAxis.iappend('g.y2axis-group').call(chart.y2Axis);

    });
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
    } else if (chart.hasOwnProperty('y2Axis')) {
      delete chart.y2Axis;
    }

    return chart;
  }





  return chart;
};


export default heatmapChart
