import * as d3 from "d3"

import utils from '../../utils.js'
import ChartUtils from './chart-utils'

var Line = function() {
  var host = this;

  function model(selections) {
    selections.each(function(data) {
      var hContainer = d3.select(this);
      var x = host.x(),
        duration = host.duration(),
        yOriginValue = host.yOriginValue(),
        xScale = host.xAxis.scale(),
        yBaseScale = host.yAxis.scale(),
        yAxisPosition = host.yAxisPosition,
        tooltipDispatch = host.tooltipDispatch;
      var resData = transformLineData(data),
        lineGroupsOffset = ChartUtils.getScaleConfig(xScale).offset;

      hContainer.attr('transform', 'translate('+ (yAxisPosition.x + lineGroupsOffset) +','+ yAxisPosition.y +')');

      // build line
      var updateGroup = hContainer
        .selectAll('g.line-group')
        .data(resData);
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
          var y, yScale,
            temp = tData[0].config.axis,
            axisName = temp && host[temp]() ? temp : 'y';
          y = host[axisName]();
          yScale = host[axisName + 'Axis'].scale();

          if (isEnter) {
            hTContainer = d3.select(this)
              .append('g')
              .classed('line-group', true)
              .classed('visual-data-shape', true);
          } else {
            hTContainer = d3.select(this);
          }

          // deal data
          var updateLines = hTContainer
            .selectAll('line')
            .data(tData);
          var exitLines = updateLines.exit();
          var enterLines = updateLines.enter();

          exitLines.remove();
          createLines(enterLines, true);
          createLines(updateLines, false);

          function createLines(selections, isEnter) {
            selections.each(function(thData){
              // not created when value is null
              if ( y(thData.y1) !== null && y(thData.y2) !== null ) {
                var hLine,
                  x1Value = xScale(x(thData.x1)),
                  x2Value = xScale(x(thData.x2)),
                  y1Value = yScale(y(thData.y1)),
                  y2Value = yScale(y(thData.y2));

                if (isEnter) {
                  hLine = d3.select(this).append('line');

                  hLine
                    .style('opacity', 0)
                    .attr('x1', x1Value )
                    .attr('y1', y1Value )
                    .attr('x2', x2Value )
                    .attr('y2', y2Value )
                    .attr('stroke', thData.config.color);

                  hLine.transition()
                    .duration(duration)
                    .style('opacity', 1);
                } else {
                  hLine = d3.select(this);

                  hLine.transition()
                    .duration(duration)
                    .attr('x1', x1Value )
                    .attr('y1', y1Value )
                    .attr('x2', x2Value )
                    .attr('y2', y2Value )
                    .attr('stroke', thData.config.color);
                }

                hLine.on('click', function(){ tooltipDispatch.call('click', this, thData, {chart: host}); });

                // create line area
                if (thData.config.area) {
                  var dPath = 'M' +
                    x1Value + ',' + y1Value + ' ' +
                    x1Value + ',' + yBaseScale(yOriginValue) + ' ' +
                    x2Value + ',' + yBaseScale(yOriginValue) + ' ' +
                    x2Value + ',' + y2Value;

                  var hPath = hLine.node().nextSibling;
                  if (hPath && hPath.nodeName.toUpperCase() == 'PATH') {
                    hPath = d3.select(hPath);
                  }else {
                    hPath = hTContainer.append('path');
                  }

                  hPath.style('opacity', 0)
                    .attr('d', dPath)
                    .attr('fill', thData.config.color);
                  
                  setTimeout(function(){
                    hPath.transition()
                      .duration(duration)
                      .style('opacity', 0.5);
                  }, duration);
                }
              }else {
                if (!isEnter) {
                  if (this.nextSibling.nodeName.toLowerCase() == 'path') {
                    d3.select(this.nextSibling).remove();
                    d3.select(this).remove();
                  }else {
                    d3.select(this).remove();
                  }
                }
              }
            });
          }
        });
      }
    });
  }
  function transformLineData(data) {
    var res = [];

    data.forEach(function(ele){
      var arr = [], index = 0, firstSpot = ele.values[0];

      arr[0] = {
        x1: firstSpot,
        y1: firstSpot,
        config: ele
      };

      ele.values.slice(1).forEach(function(eele, i){
        arr[index].x2 = eele;
        arr[index].y2 = eele;
        
        index++;
        arr[index] = {
          x1: eele,
          y1: eele,
          config: ele
        };
      });

      arr.pop();
      res.push(arr);
    });

    return res;
  }

  return model;
}

export default Line
