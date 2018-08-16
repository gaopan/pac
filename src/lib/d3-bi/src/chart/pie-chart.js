import * as d3 from 'd3'

import core from '../core'
import utils from '../utils'

import ChartUtils from './models/chart-utils'

import Tooltip from './models/tooltip'
import Legend from './models/legend'
import Pie from './models/pie'

var pieChart = function() {
  var duration = 500,
    margin = { top: 20, right: 20, bottom: 15, left: 15 },
    valueFromate,
    showLabel,
    labelOutside,
    labelType,
    labelThreshould,
    hideOverlable,
    growHover,
    radius,
    donut,
    dountRatios,
    title,
    titleUnit,
    donutRadius,
    isLegendSide,
    x = function(d) {
      return d
    },
    y = function(d) {
      return d
    },
    colors = [
      "#feed01", "#000", "#82e238", "#00c9ff", "#8085e9",
      "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"
    ];

  chart.legend = Legend.call(chart);
  chart.tooltip = Tooltip.call(chart);
  chart.pie = Pie.call(chart);
  chart.chartName = 'pie-chart';
  chart.tooltipDispatch = d3.dispatch('build', 'setPosition', 'remove', 'click');
  chart.tooltipDispatch.on('build', chart.tooltip.build());
  chart.tooltipDispatch.on('setPosition', chart.tooltip.setPosition());
  chart.tooltipDispatch.on('remove', chart.tooltip.remove());

  chart.legendDispatch = d3.dispatch('click');
  chart.legendDispatch.on('click', chart.legend.defaultClick);
  chart.pieDispatch = d3.dispatch('pieClick');
  // chart.pieDispatch.on('pieClick',chart.pie.setPieClick);

  function chart(selections) {
    selections.each(function(data) {
      var hContainer = d3.select(this);
      ChartUtils.initContainer(hContainer, { chartName: chart.chartName });
      if (data.length == 0) {
        ChartUtils.buildNoDataChart(hContainer);
        return;
      }
      chart.width = parseInt(hContainer.attr('width'));
      chart.height = parseInt(hContainer.attr('height'));
      chart.colors = colors;
      chart.data = data;
      chart.hContainer = hContainer;
      chart.isLegendSide = isLegendSide;
      //build legend

      data.forEach(function(d, i) {
        d.name = d.label;
        d.color = d.color ? d.color : colors[i];
        var values = {
          value: d.value,
          label: d.label
        }
        d.values = values;
      })

      chart.availableHeight = chart.height - margin.top - margin.bottom;
      chart.availableWidth = chart.width;
      chart.limtLegenWidth = chart.availableWidth - margin.left - margin.right;
      hContainer.iappend('g.legend-groups')
        .datum(data)
        .call(chart.legend);
      chart.legendWidth = hContainer.select('g.legend-groups').node().getBBox().width;
      chart.legendHeight = hContainer.select('g.legend-groups').node().getBBox().height;
      if (isLegendSide) {

        var legendOffSetX = chart.width - chart.legendWidth - 15,
          legendOffSetY = (chart.availableHeight - chart.legendHeight) / 2;
        hContainer
          .select('g.legend-groups')
          .attr('transform', 'translate(' + legendOffSetX + ',' + legendOffSetY + ')');
        chart.legendHeight = 0;
        chart.availableWidth = chart.availableWidth - chart.legendWidth;
      }


      //build pie
      chart.pieTop=margin.top;
      chart.donut = true;
      chart.donutRadius = donutRadius;
      chart.pieHeight = chart.availableHeight;
      chart.pieWidth = chart.availableWidth;
      chart.title = title;
      chart.titleUnit = titleUnit;
      var pie = hContainer.iappend('g.pie').datum([data]).call(chart.pie);
    })
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
  chart.title = function(v) {
    if (!arguments.length) return title;
    title = v;
    return chart;
  }
  chart.titleUnit = function(v) {
    if (!arguments.length) return titleUnit;
    titleUnit = v;
    return chart;
  }
  chart.donutRatio = function(v) {
    if (!arguments.length) return donutRatio;
    donutRatio = v;
    return chart;
  }
  chart.donutRadius = function(v) {
    if (!arguments.length) return donutRadius;
    donutRadius = v;
    return chart;
  }
  chart.colors = function(v) {
    if (!arguments.length) return colors;
    colors = v;
    return chart;
  }
  chart.isLegendSide = function(v) {
    if (!arguments.length) return isLegendSide;
    isLegendSide = v;
    return chart;
  }
  return chart;
};

export default pieChart
