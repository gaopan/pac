import * as d3 from 'd3'

import core from '../core'
import utils from '../utils'

import ChartUtils from './models/chart-utils'

import Axis from './models/axis'
import AxisLines from './models/axis-lines'

var benchmarkChart = function() {
  var duration = 500,
    blankLineHeight = 5,
    coloredRectHeightPercentage = 3/5,
    margin = {top: 20, right: 20, bottom: 15, left: 15};

  chart.xAxis = Axis.call(chart).axisName('x');
  chart.axisLines = AxisLines.call(chart);

  chart.chartName = 'benchmark-chart';
  chart.axisLines.pattern({y: false});
  chart.xAxis.scale(d3.scaleLinear()).axis(d3.axisBottom());

  function chart(selections) {
    selections.each(function(data) {
      var hContainer = d3.select(this),
        markerData = data.markerData,
        backgroundData = data.backgroundData,
        xScale = chart.xAxis.scale();

      chart.data = data;
      chart.hContainer = hContainer;

      ChartUtils.initContainer(hContainer, {chartName: chart.chartName});
      chart.width = hContainer.attr('width');
      chart.height = hContainer.attr('height');

      if (utils.isArray(backgroundData) && backgroundData.length) {
        var resData = [];
        backgroundData.forEach(function(ele, i){
          utils.isObject(ele) && utils.isNumber(ele.value) && ele.value > 0 && resData.push(ele);
        });

        if (resData.length) {
          backgroundData = resData;
        }else {
          ChartUtils.buildNoDataChart(hContainer);
          return ;
        }
      }else {
        ChartUtils.buildNoDataChart(hContainer);
        return ;
      }

      var hDefs = hContainer.select('defs').size() ? hContainer.select('defs') : hContainer.append('defs');
      if (!hDefs.select('symbol#map-marker').size()) {
        hDefs.append('symbol')
          .attr('id', 'map-marker')
          .attr('viewBox', '0 0 18 32')
          .html('<title>map-marker</title><path d="M13.714 11.714c0-2.518-2.054-4.571-4.571-4.571s-4.571 2.054-4.571 4.571 2.054 4.571 4.571 4.571 4.571-2.054 4.571-4.571zM18.286 11.714c0 1.089-0.125 2.214-0.589 3.196l-6.5 13.821c-0.375 0.786-1.196 1.268-2.054 1.268s-1.679-0.482-2.036-1.268l-6.518-13.821c-0.464-0.982-0.589-2.107-0.589-3.196 0-5.054 4.089-9.143 9.143-9.143s9.143 4.089 9.143 9.143z"></path>');
      }

      backgroundData.sort(function(p, c){ return p.value - c.value});
      xScale.domain([0, backgroundData[backgroundData.length-1].value]).range([0, 100]);

      var xTicksList = backgroundData.map(function(d){ return d.value});
      xTicksList.unshift(0);
      chart.xAxis.axis().tickValues(xTicksList);

      chart.xAxisHeight = ChartUtils.getAxisHeight(hContainer, {xAxis: chart.xAxis}).xAxisHeight;

      chart.xAxisWidth = chart.width - margin.left - margin.right;
      chart.yAxisWidth = chart.height - margin.top - chart.xAxisHeight - margin.bottom;
      chart.xAxisPosition = {x: margin.left, y: margin.top + chart.yAxisWidth};
      chart.yAxisPosition = {x: margin.left, y: margin.top};

      xScale.range([0, chart.xAxisWidth]);

      var hAxis = hContainer.iappend('g.axis-groups');
      hAxis.iappend('g.xaxis-group').call(chart.xAxis);
      hAxis.iappend('g.axis-line-groups').call(chart.axisLines);

      var hGroups = hContainer.iappend('g.background-groups')
        .html('')
        .attr('transform', 'translate('+ chart.yAxisPosition.x +','+ chart.yAxisPosition.y +')')
        .selectAll('g')
        .data(backgroundData)
        .enter()
        .append('g')
        .classed('background-group', true);
      hGroups.each(function(oData, oIndex){
        var hOContainer = d3.select(this),
          areaSpacing = 1,
          colorRectHeight = coloredRectHeightPercentage * chart.yAxisWidth,
          titleHeight = chart.yAxisWidth - 3*blankLineHeight - colorRectHeight,
          xPosition = xScale(xTicksList[oIndex]) + areaSpacing,
          oWidth = xScale(oData.value) - xScale(xTicksList[oIndex]) - 2*areaSpacing;

        var hBlankLine1 = hOContainer.append('rect')
          .classed('blank-line', true)
          .attr('x', xPosition)
          .attr('y', chart.yAxisWidth - blankLineHeight)
          .attr('width', oWidth)
          .attr('height', blankLineHeight);

        var hColorLine = hOContainer.append('rect')
          .classed('colored-line', true)
          .attr('x', xPosition)
          .attr('y', chart.yAxisWidth - 2*blankLineHeight)
          .attr('width', oWidth)
          .attr('height', blankLineHeight)
          .attr('fill', oData.color);

        var hBlankLine2 = hOContainer.append('rect')
          .classed('blank-line', true)
          .attr('x', xPosition)
          .attr('y', chart.yAxisWidth - 3*blankLineHeight)
          .attr('width', oWidth)
          .attr('height', blankLineHeight);

        var hColorRect = hOContainer.append('rect')
          .classed('colored-rect', true)
          .attr('x', xPosition)
          .attr('y', chart.yAxisWidth - 3*blankLineHeight - colorRectHeight)
          .attr('width', oWidth)
          .attr('height', colorRectHeight)
          .attr('fill', oData.color)
          .attr('opacity', 0.3);

        var hTitle = hOContainer.append('text')
          .text(oData.name)
          .classed('top-title', true)
          .attr('x', xPosition + oWidth/2 )
          .attr('y', chart.yAxisWidth - 3*blankLineHeight - colorRectHeight - titleHeight/2);

        var titleBoxInfo = hTitle.node().getBBox();
        if (titleBoxInfo.width > oWidth) {
          var leftTextLength =  Math.floor(oData.name.length * (oWidth/titleBoxInfo.width));
          hTitle.text(oData.name.substr(0, leftTextLength-3) + '...');
          hTitle.append('title').text(oData.name);
        }
      });

      var hMarkerGroup = hContainer.iappend('g.marker-group'),
        markerIcon = markerData.iconUrl ? markerData.iconUrl : '#map-marker',
        markerWidth = markerData.width ? markerData.width : 30,
        markerHeight = markerData.height ? markerData.height : 30,
        markerXPosition = xScale(markerData.value),
        markerYPosition = chart.xAxisPosition.y - 2*blankLineHeight - markerHeight;
      var hMarkerSvg = hMarkerGroup.iappend('svg.marker-svg')
        .attr('width', markerWidth)
        .attr('height', markerHeight)
        .attr('x', markerXPosition)
        .attr('y', markerYPosition)
        .attr('fill', markerData.color)
        .html('<use xlink:href="'+ markerIcon +'"></use>');
      var hMarkerTitle = hMarkerGroup.iappend('text.marker-text')
        .text(markerData.name)
        .attr('x', markerXPosition + markerWidth/2)
        .attr('y', function(){ return markerYPosition - 10});
    });
  }
  chart.updateMarkerValue = function(v) {
    var value = +v;
    if (!utils.isNumber(value) || value < 0) return ;

    var duration = chart.duration(),
      relValue = chart.xAxis.scale()(value),
      hMarkerGroup = chart.hContainer.select('g.marker-group'),
      hMarkerSvg = hMarkerGroup.select('svg.marker-svg'),
      hMarkerTitle = hMarkerGroup.select('text.marker-text');
    hMarkerSvg.transition()
      .duration(duration)
      .attr('x', relValue);
    hMarkerTitle.transition()
      .duration(duration)
      .attr('x', relValue + hMarkerSvg.attr('width')/2);
  };

  chart.duration = function(v) {
    if (!arguments.length) return duration;
    duration = +v;
    return chart;
  };
  chart.blankLineHeight = function(v) {
    if (!arguments.length) return blankLineHeight;
    blankLineHeight = +v;
    return chart;
  };
  chart.coloredRectHeightPercentage = function(v) {
    if (!arguments.length) return coloredRectHeightPercentage;
    coloredRectHeightPercentage = parseFloat(v);
    return chart;
  };
  chart.margin = function(v) {
    if (!arguments.length) return margin;
    margin.top = v.top !== undefined ? +v.top : margin.top;
    margin.right = v.right !== undefined ? +v.right : margin.right;
    margin.bottom = v.bottom !== undefined ? +v.bottom : margin.bottom;
    margin.left = v.left !== undefined ? +v.left : margin.left;
    return chart;
  };

  return chart;
};

export default benchmarkChart
