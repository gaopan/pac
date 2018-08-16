import * as d3 from "d3"

import utils from '../../utils.js'
import ChartUtils from './chart-utils'

var StackBar = function() {
  var host = this,
    barType = 'bar',
    showText = false,
    fnTextWrapper = null,
    buildTotalBar = false,
    activeType = null,
    fnPacketBar = null;

  function model(selections) {
    selections.each(function(data) {
      var hContainer = d3.select(this);
      var tooltip = host.tooltip,
        x = host.x(),
        y = host.y(),
        duration = host.duration(),
        xScale = host.xAxis.scale(),
        yScale = host.yAxis.scale(),
        xFormat = host.xAxis.axis().tickFormat(),
        yFormat = host.yAxis.axis().tickFormat(),
        yAxisPosition = host.yAxisPosition,
        tooltipDispatch = host.tooltipDispatch;

      // transform data, and get bar config
      if (barType == 'bar') {
        var barConfig = ChartUtils.getBarConfig(xScale, {length: data[0].length});
      }else {
        var barConfig = ChartUtils.getBarConfig(yScale, {length: data[0].length});
      }

      hContainer.attr('transform', 'translate('+ yAxisPosition.x +','+ yAxisPosition.y +')');

      // deal data
      var updateGroup = hContainer
        .selectAll('g.stack-'+ barType +'-group')
        .data(data);
      var exitGroup = updateGroup.exit();
      var enterGroup = updateGroup.enter();

      exitGroup.remove();
      createGroup(enterGroup, true);
      createGroup(updateGroup, false);

      // total bar group
      hContainer.selectAll('g.total-bar-group').remove();
      if (buildTotalBar) {
        var totalBarGroup = hContainer.append('g').classed('total-bar-group', true);
        var totalBars = totalBarGroup.selectAll('rect')
          .data(data[data.length - 1])
          .enter()
          .append('rect')
          .attr('x', function(d){ return xScale(d.data._x)})
          .attr('y', function(d){ return yScale(d[1])})
          .attr('width', barConfig.width)
          .attr('height', function(d){ return yScale(0) - yScale(d[1])})
          .on('mouseenter', function(d) {
            var displayData = {
              x: xFormat ? xFormat(d.data._x) : d.data._x,
              yValues: []
            };
            data.forEach(function(ele){
              var key = ele.key;
              displayData.yValues.push({
                data: {
                  x: displayData.x,
                  y: yFormat ? yFormat(d.data[key]) : d.data[key]
                },
                config: ele.config
              });
            });
            tooltipDispatch.call('build', this, displayData);
          })
          .on('mousemove', function() { tooltipDispatch.call('setPosition', this); })
          .on('mouseleave', function() { tooltipDispatch.call('remove', this); })
          .on('click', function(d){ tooltipDispatch.call('click', this, d, {chart: host}); });
      }

      function createGroup(selections, isEnter) {
        selections.each(function(tData){
          var hEContainer,
            barCreater = {
              bar: createBars,
              horizontalBar: createHorizontalBars
            };

          if (isEnter) {
            hEContainer = d3.select(this)
              .append('g')
              .classed('stack-'+barType+'-group', true);
          } else {
            hEContainer = d3.select(this);
          }

          // delete text
          hEContainer.selectAll('text.bar-text').remove();

          // deal tData
          var rectUpdateGroup = hEContainer
            .selectAll('rect')
            .data(tData);
          var rectExitGroup = rectUpdateGroup.exit();
          var rectEnterGroup = rectUpdateGroup.enter();

          rectExitGroup.remove();
          barCreater[barType](rectEnterGroup, true);
          barCreater[barType](rectUpdateGroup, false);

          function createBars(selections, isEnter) {
            selections.each(function(thData){
              var hRContainer = d3.select(this), hRect;
              var xValue = thData.data._x,
                yValue = thData[1];
              var yPosition = yScale(yValue),
                rectHeight = yScale(thData[0]) - yScale(yValue),
                rectWidth = barConfig.width,
                xPosition = xScale(xValue) - barConfig.offset;

              if (isEnter) {
                hRect = hRContainer.append('rect');
              } else {
                hRect = hRContainer;
              }

              hRect
                .attr('y', yPosition)
                .attr('x', xPosition)
                .attr('width', rectWidth)
                .style('transform-origin', function() {
                  var xc = xPosition + rectWidth / 2 + 'px';
                  var yc = yPosition + rectHeight / 2 + 'px';
                  return xc + ' ' + yc;
                })
                .classed('rotated', true);

              if (isEnter) {
                setTimeout(function(){
                  hRect
                    .attr('height', 0)
                    .attr('fill', tData.config.color)
                    .transition()
                    .duration(duration)
                    .attr('height', rectHeight);
                }, tData.index * duration);
              } else {
                setTimeout(function(){
                  hRect
                    .transition()
                    .duration(duration)
                    .attr('height', rectHeight)
                    .attr('fill', tData.config.color);
                }, tData.index * duration);
              }

              // show text
              if (showText) {
                var hText = hEContainer.append('text')
                  .classed('bar-text', true)
                  .text(yFormat ? yFormat(yValue) : yValue)
                  .attr('x', xPosition + rectWidth/2)
                  .attr('y', function(){ return yPosition + this.getBBox().height * 2/3 + 2;})
                  .style('opacity', 0);
                
                if (fnTextWrapper !== null) {fnTextWrapper(thData.oData, hText.node(), {format: yFormat});}

                hText.transition()
                  .duration(tData.index * duration + duration + 500)
                  .style('opacity', 1);
              }

              hRect
                .on('mouseenter', function() {
                  var data = ChartUtils.formatDisplayedData({
                    x: x(thData.oData),
                    yValues: [{
                      data: thData.oData,
                      config: tData.config
                    }]
                  }, {x: x, y: y, xFormat: xFormat, yFormat: yFormat});
                  tooltipDispatch.call('build', this, data);
                })
                .on('mousemove', function() { tooltipDispatch.call('setPosition', this); })
                .on('mouseleave', function() { tooltipDispatch.call('remove', this); })
                .on('click', function(){ tooltipDispatch.call('click', this, thData, {chart: host}); });

              if (activeType == 'single') {
                hRect.classed('active', true);
                host.tooltipDispatch.on('click.active', ChartUtils.singleActive);
              }else if (activeType == 'multi') {
                hRect.classed('active', true);
                host.tooltipDispatch.on('click.active', ChartUtils.multiActive);
              }

              if (fnPacketBar !== null) fnPacketBar(hRect, thData);
            });
          }
          function createHorizontalBars(selections, isEnter) {
          }
        });
      }
    });
  }

  model.fnTextWrapper = function(v) {
    if (!arguments.length) return fnTextWrapper;
    fnTextWrapper = utils.isFunction(v) ? v : null;
    return model;
  };
  model.buildTotalBar = function(v) {
    if (!arguments.length) return buildTotalBar;
    buildTotalBar = !!v;
    return model;
  };
  model.showText = function(v) {
    if (!arguments.length) return showText;
    showText = !!v;
    return model;
  };
  model.activeType = function(v) {
    if (!arguments.length) return activeType;
    activeType = v;
    return model;
  };
  model.barType = function(v) {
    if (!arguments.length) return barType;
    barType = v;
    return model;
  };
  model.fnPacketBar = function(v) {
    if (!arguments.length) return fnPacketBar;
    fnPacketBar = utils.isFunction(v) ? v : null;
    return model;
  };

  return model;
}

export default StackBar
