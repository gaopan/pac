import * as d3 from "d3"

import utils from '../../utils.js'
import ChartUtils from './chart-utils'

var Spot = function() {
  var host = this,
    radius = 10;

  function model(selections) {
    selections.each(function(data) {
      var hContainer = d3.select(this);
      var tooltip = host.tooltip,
        x = host.x(),
        duration = host.duration(),
        xScale = host.xAxis.scale(),
        xFormat = host.xAxis.axis().tickFormat(),
        tooltipDispatch = host.tooltipDispatch;
      var spotGroupsOffset = ChartUtils.getScaleConfig(xScale).offset;

      hContainer.attr('transform', 'translate('+ (host.yAxisPosition.x + spotGroupsOffset) +','+ host.yAxisPosition.y +')');

      // deal data
      var updateGroup = hContainer
        .selectAll('g.spot-group')
        .data(data);
      var exitGroup = updateGroup.exit();
      var enterGroup = updateGroup.enter();

      exitGroup.remove();
      createGroup(enterGroup, true);
      createGroup(updateGroup, false);

      function createGroup(selections, isEnter) {
        selections.each(function(tData){
          var hTContainer;

          // particular yaxis
          var y, yScale, yFormat,
            axisName = tData.axis && host[tData.axis]() ? tData.axis : 'y';
          y = host[axisName]();
          yScale = host[axisName + 'Axis'].scale();
          yFormat = host[axisName + 'Axis'].axis().tickFormat();

          if (isEnter) {
            hTContainer = d3.select(this)
              .append('g')
              .classed('spot-group', true);
          } else {
            hTContainer = d3.select(this);
          }

          // deal data
          var updateCircles = hTContainer
            .selectAll('circle')
            .data(tData.values);
          var exitCircles = updateCircles.exit();
          var enterCircles = updateCircles.enter();

          exitCircles.remove();
          createCircles(enterCircles, true);
          createCircles(updateCircles, false);

          function createCircles(selections, isEnter) {
            selections.each(function(thData){
              var hCircle;

              if (isEnter) {
                hCircle = d3.select(this)
                  .append('circle')
                  .classed('visual-data-shape', true);

                hCircle
                  .attr('r', 0)
                  .attr('cx', xScale(x(thData)) )
                  .attr('cy', yScale(y(thData)) )
                  .attr('fill', tData.color );

                hCircle.transition()
                  .duration(duration)
                  .attr('r', tData.hasOwnProperty('radius') ? tData['radius'] : radius );
              } else {
                hCircle = d3.select(this);

                hCircle.transition()
                  .duration(duration)
                  .attr('r', tData.hasOwnProperty('radius') ? tData['radius'] : radius )
                  .attr('cx', xScale(x(thData)) )
                  .attr('cy', yScale(y(thData)) )
                  .attr('fill', tData.color );
              }

              hCircle
                .on('mouseenter', function() {
                  var data = ChartUtils.formatDisplayedData({
                    x: x(thData),
                    yValues: [{
                      data: thData,
                      config: tData
                    }]
                  }, {x: x, y: y, xFormat: xFormat, yFormat: yFormat});
                  
                  tooltipDispatch.call('build', this, data);
                })
                .on('mousemove', function() { tooltipDispatch.call('setPosition', this);})
                .on('mouseleave', function() { tooltipDispatch.call('remove', this);})
                .on('click', function(){ tooltipDispatch.call('click', this, thData, {chart: host}); });
            });
          }
        });
      }
    });
  }

  model.radius = function(v) {
    if (!arguments.length) return radius;
    radius = +v;
    return model;
  };

  return model;
}

export default Spot
