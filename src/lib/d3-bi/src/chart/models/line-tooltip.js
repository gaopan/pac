import * as d3 from "d3"

import utils from '../../utils.js'
import ChartUtils from './chart-utils'

var LineTooltip = function() {
  var host = this,
    type = 'spot',
    visibility = null,
    activeRadius = 5,
    triggerAreaRadius = 15;

  function model(selections) {
    selections.each(function(data) {
      if (visibility === false) return ;
      
      var hContainer = d3.select(this);
      var tooltip = host.tooltip,
        x = host.x(),
        xScale = host.xAxis.scale(),
        xFormat = host.xAxis.axis().tickFormat(),
        tooltipDispatch = host.tooltipDispatch;

      hContainer.html('');

      if (type == 'spot') {
        hContainer.classed('line-tooltip-spot', true);

        var hGGroups = hContainer.selectAll('g')
          .data(data)
          .enter()
          .append('g');

        hGGroups.each(function(tData) {
          var hTContainer = d3.select(this);

          // particular yaxis
          var y, yScale, yFormat,
            axisName = tData.axis && host[tData.axis]() ? tData.axis : 'y';
          y = host[axisName]();
          yScale = host[axisName + 'Axis'].scale();
          yFormat = host[axisName + 'Axis'].axis().tickFormat();

          // delete invaild data
          var resValues = [];
          tData.values.forEach(function(ele){
            y(ele) !== null && resValues.push(ele);
          });

          var hTGGroups = hTContainer.selectAll('g')
            .data(resValues)
            .enter()
            .append('g');

          hTGGroups.append('circle')
            .attr('r', activeRadius)
            .attr('cx', function(d){ return xScale(x(d))})
            .attr('cy', function(d){ return yScale(y(d))})
            .attr('fill', tData.color)
            .style('opacity', 0);

          hTGGroups.append('circle')
            .attr('r', triggerAreaRadius)
            .attr('cx', function(d){ return xScale(x(d))})
            .attr('cy', function(d){ return yScale(y(d))})
            .classed('trigger-area', true)
            .on('mouseenter', function(d) {
              var data = ChartUtils.formatDisplayedData({
                x: x(d),
                yValues: [{
                  data: d,
                  config: tData
                }]
              }, {x: x, y: y, xFormat: xFormat, yFormat: yFormat});
              
              tooltipDispatch.call('build', this, data);
              d3.select(this.previousSibling).style('opacity', 1);
            })
            .on('mousemove', function() { tooltipDispatch.call('setPosition', this);})
            .on('mouseleave', function() {
              tooltipDispatch.call('remove', this);
              d3.select(this.previousSibling).style('opacity', 0);
            });
        });
      }else if (type == 'line') {
        hContainer.classed('line-tooltip-line', true);

        var resData = ChartUtils.togetherDatas(xScale, data, {x: x});
        var triggerWidth = 2 * triggerAreaRadius;
        var hGGroups = hContainer.selectAll('g')
          .data(resData)
          .enter()
          .append('g');

        hGGroups.each(function(tData) {
          var hTContainer = d3.select(this),
            xValue = xScale(tData.x);

          // particular yaxis
          var y, yScale, yFormat,
            temp = tData.yValues[0].config.axis,
            axisName = temp && host[temp]() ? temp : 'y';
          y = host[axisName]();
          yScale = host[axisName + 'Axis'].scale();
          yFormat = host[axisName + 'Axis'].axis().tickFormat();

          hTContainer.append('line')
            .attr('x1', xValue)
            .attr('y1', 0)
            .attr('x2', xValue)
            .attr('y2', host.yAxisWidth);

          tData.yValues.forEach(function(ele) {
            if ( y(ele.data) !== null ) {
              hTContainer.append('circle')
                .attr('r', activeRadius)
                .attr('cx', xValue)
                .attr('cy', yScale(y(ele.data)))
                .attr('fill', ele.config.color);
            }
          });

          hTContainer.append('rect')
            .attr('y', 0)
            .attr('x', xValue - triggerWidth/2)
            .attr('width', triggerWidth)
            .attr('height', host.yAxisWidth)
            .classed('trigger-area', true)
            .on('mouseenter', function(d) {
              var data = ChartUtils.formatDisplayedData(d, {x: x, y: y, xFormat: xFormat, yFormat: yFormat});
              tooltipDispatch.call('build', this, data);
              d3.select(this.parentNode).style('opacity', 1);
            })
            .on('mousemove', function() { tooltipDispatch.call('setPosition', this);})
            .on('mouseleave', function() {
              tooltipDispatch.call('remove', this);
              d3.select(this.parentNode).style('opacity', 0);
            });
        });
      }
    });
  }

  model.visibility = function(v) {
    if (!arguments.length) return visibility;
    visibility = v === null ? v : !!v;
    return model;
  }
  model.activeRadius = function(v) {
    if (!arguments.length) return activeRadius;
    activeRadius = +v;
    return model;
  };
  model.triggerAreaRadius = function(v) {
    if (!arguments.length) return triggerAreaRadius;
    triggerAreaRadius = +v;
    return model;
  };
  model.type = function(v) {
    if (!arguments.length) return type;
    type = v;
    return model;
  };
  
  return model;
}

export default LineTooltip
