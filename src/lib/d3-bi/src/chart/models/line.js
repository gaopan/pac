import * as d3 from 'd3'

import utils from '../../utils.js'
import ChartUtils from './chart-utils'

var Line = function() {
  var host = this,
    curve = null,
    lineGeneratorWrapper = null;

  function model(selections) {
    selections.each(function(data) {
      var hContainer = d3.select(this);
      var x = host.x(),
        y = null,
        xScale = host.xAxis.scale(),
        yScale = null,
        yOriginValue = host.yOriginValue(),
        duration = host.duration(),
        yAxisPosition = host.yAxisPosition,
        tooltipDispatch = host.tooltipDispatch;
      var lineGroupsOffset = ChartUtils.getScaleConfig(xScale).offset;

      hContainer.attr('transform', 'translate('+ (yAxisPosition.x + lineGroupsOffset) +','+ yAxisPosition.y +')');

      // build line
      var updateGroup = hContainer
        .selectAll('g.line-group')
        .data(data);
      var exitGroup = updateGroup.exit();
      var enterGroup = updateGroup.enter();

      exitGroup.remove();
      createGroup(enterGroup, true);
      createGroup(updateGroup, false);

      // build line-tooltip
      hContainer.iappend('g.line-tooltip')
        .datum(data)
        .call(host.lineTooltip);

      function createGroup(selections, isEnter) {
        selections.each(function(tData){
          var hTContainer;

          // particular yaxis
          var axisName = tData.axis && host[tData.axis]() ? tData.axis : 'y';
          y = host[axisName]();
          yScale = host[axisName + 'Axis'].scale();

          var lineGenerator = d3.line()
            .defined(function(d){
              if (x(d) === null || y(d) === null) return false;
              return true;
            })
            .x(function(d){ return xScale(x(d))})
            .y(function(d){ return yScale(y(d))})
            .curve(utils.isFunction(curve) ? curve : d3.curveLinear);
          if (utils.isFunction(lineGeneratorWrapper)) {
            lineGenerator = lineGeneratorWrapper(lineGenerator, {data: tData});
          }

          if (isEnter) {
            hTContainer = d3.select(this)
              .append('g')
              .classed('line-group', true);
          } else {
            hTContainer = d3.select(this);
          }

          // build line path
          var hLine = hTContainer.iappend('path.line-path')
            .classed('visual-data-shape', true)
            .on('click', function(){ tooltipDispatch.call('click', this, tData, {chart: host}); })
            .transition()
            .duration(duration)
            .attr('d', lineGenerator(tData.values))
            .attr('stroke', tData.color);

          if(tData.dashed) {
            hLine.attr("stroke-dasharray", tData.dashed);
          } else {
            hLine.attr("stroke-dasharray", "");
          }

          // build area path
          if (tData.area) {
            var areaPath = d3.area()
              .defined(function(d){ 
                if (x(d) === null || y(d) === null) return false;
                return true;
              })
              .x(function(d){ return xScale(x(d))})
              .y0(function(d){ return yScale(yOriginValue)})
              .y1(function(d){ return yScale(y(d))})
              .curve(utils.isFunction(curve) ? curve : d3.curveLinear);

            hTContainer.iappend('g.area-group')
              .iappend('path.area-path')
              .transition()
              .duration(duration)
              .attr('d', areaPath(tData.values))
              .attr('fill', tData.color);
          }
        });
      }
    });
  }

  model.curve = function(v) {
    if (!arguments.length) return curve;
    curve = utils.isFunction(v) ? v : null;
    return model;
  };
  model.lineGeneratorWrapper = function(v) {
    if (!arguments.length) return lineGeneratorWrapper;
    lineGeneratorWrapper = utils.isFunction(v) ? v : null;
    return model;
  };

  return model;
};

export default Line
