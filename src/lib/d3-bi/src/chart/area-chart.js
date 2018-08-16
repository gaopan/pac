import * as d3 from "d3"

import core from '../core'
import utils from '../utils'

import ChartUtils from './models/chart-utils'

import Axis from './models/axis'
import AxisLines from './models/axis-lines'

var areaChart = function() {

  var x = function(d) { return d.x; },
    y = function(d) { return d.y; },
    margin = { top: 20, right: 20, bottom: 15, left: 15 };

  chart.xAxis = Axis.call(chart).axisName('x');
  chart.yAxis = Axis.call(chart).axisName('y');
  chart.axisLines = AxisLines.call(chart);

  chart.chartName = 'area-chart';

  chart.xAxis
    .axis(d3.axisBottom())
    .scale(d3.scaleTime())
    .title("Log Timeline");
  chart.yAxis
    .axis(d3.axisLeft())
    .title("Activity")
    .scale(d3.scaleLinear());
  chart.axisLines.pattern({x: true, y: false});

  function chart(selections) {
    selections.each(function(data) {
      var hContainer = d3.select(this),
        xScale = chart.xAxis.scale(),
        yScale = chart.yAxis.scale();

      chart.data = data;
      chart.hContainer = hContainer;

      // set class, width and height.
      ChartUtils.initContainer(hContainer, { chartName: chart.chartName });
      chart.width = hContainer.attr('width');
      chart.height = hContainer.attr('height');

      // no data chart
      // delete the data with values eq null, [] or ...
      if (utils.isArray(data) && data.length) {
        var resData = [];
        data.forEach(function(ele, i) { utils.isArray(ele.values) && ele.values.length && resData.push(ele); });
        if (resData.length) {
          data = resData;
        } else {
          ChartUtils.buildNoDataChart(hContainer);
          return;
        }
      } else {
        ChartUtils.buildNoDataChart(hContainer);
        return;
      }

      ['x', 'y'].forEach(function(ele) {
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
            domain = ChartUtils.getScaleDomain(scale, data, fn);

            if (utils.isFunction(givenDomain)) {
              domain = givenDomain(domain, chart);
            } else {
              domain = ChartUtils.transformDomain(domain, chart[axis]);
            }
            scale.domain(domain);
          }
        }
      });

      var temp = ChartUtils.getAxisHeight(hContainer, {
        xAxis: chart.xAxis,
        yAxis: chart.yAxis
      });
      chart.xAxisHeight = temp.xAxisHeight;
      chart.yAxisHeight = temp.yAxisHeight;

      chart.xAxisWidth = chart.width - margin.left - chart.yAxisHeight - margin.right;
      chart.yAxisWidth = chart.height - margin.top - chart.xAxisHeight - margin.bottom;
      chart.xAxisPosition = { x: margin.left + chart.yAxisHeight, y: chart.height - margin.bottom - chart.xAxisHeight };
      chart.yAxisPosition = { x: margin.left + chart.yAxisHeight, y: margin.top };

      xScale.rangeRound([0, chart.xAxisWidth]);
      yScale.rangeRound([chart.yAxisWidth, 0]);

      // build axis
      var hAxis = hContainer.iappend('g.axis-groups');
      hAxis.iappend('g.xaxis-group').call(chart.xAxis);
      hAxis.iappend('g.yaxis-group').call(chart.yAxis);
      // axis line
      hAxis.iappend('g.axis-line-groups').call(chart.axisLines);

      var aData = data.map(function(d) { return d.values });

      var fnX = function(d) { return xScale(d.x); },
        fnY = function(d) { return yScale(d.y); };

      var hAreaGroup = hContainer.iappend('g.area-group');
      hAreaGroup.attr('transform', 'translate(' + chart.xAxisPosition.x + ',' + chart.yAxisPosition.y + ')');

      var area = d3.area()
        .x(fnX)
        .y0(chart.xAxisPosition.y - chart.yAxisPosition.y)
        .y1(fnY);

      var valueLine = d3.line()
        .x(fnX)
        .y(fnY);

      var hArea = hAreaGroup.append('path');
      hArea.data(aData).attr("class", "area").attr("d", area);

      var hValueLine = hAreaGroup.append("path");
      hValueLine.data(aData).attr("class", "line").attr("d", valueLine);

    });
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

  return chart;
};

export default areaChart
