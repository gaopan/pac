import * as d3 from "d3"

import utils from '../../utils.js'
import ChartUtils from './chart-utils'

var Bar = function() {
  var host = this,
    barType = 'bar',
    showText = false,
    fnTextWrapper = null,
    activeType = null,
    fnPacketBar = null,
    fnColorWrapper = null;

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
        yOriginValue = host.yOriginValue(),
        xOriginValue = host.xOriginValue(),
        yAxisPosition = host.yAxisPosition,
        tooltipDispatch = host.tooltipDispatch;

      // transform data, and get bar config
      if (barType == 'bar') {
        var resData = ChartUtils.togetherDatas(xScale, data, {x: x});
        var barConfig = ChartUtils.getBarConfig(xScale, {length: resData.length});
      }else {
        var resData = ChartUtils.togetherDatas(yScale, data, {x: y});
        var barConfig = ChartUtils.getBarConfig(yScale, {length: resData.length});
      }

      hContainer.attr('transform', 'translate('+ yAxisPosition.x +','+ yAxisPosition.y +')');

      // deal data
      var updateGroup = hContainer
        .selectAll('g.'+ barType +'-group')
        .data(resData);
      var exitGroup = updateGroup.exit();
      var enterGroup = updateGroup.enter();

      exitGroup.remove();
      createGroup(enterGroup, true);
      createGroup(updateGroup, false);

      function createGroup(selections, isEnter) {
        selections.each(function(tData, tIndex){
          var hEContainer,
            barCreater = {
              bar: createBars,
              horizontalBar: createHorizontalBars
            },
            rLength = tData.yValues.length;

          if (isEnter) {
            hEContainer = d3.select(this)
              .append('g')
              .classed(barType+'-group', true);
          } else {
            hEContainer = d3.select(this);
          }

          // delete text
          hEContainer.selectAll('text.bar-text').remove();

          // deal tData
          var rectUpdateGroup = hEContainer
            .selectAll('rect')
            .data(tData.yValues);
          var rectExitGroup = rectUpdateGroup.exit();
          var rectEnterGroup = rectUpdateGroup.enter();

          rectExitGroup.remove();
          barCreater[barType](rectEnterGroup, true);
          barCreater[barType](rectUpdateGroup, false);

          function createBars(selections, isEnter) {
            selections.each(function(thData, thIndex){
              var hRContainer = d3.select(this), hRect;
              var xValue = x(thData.data),
                yValue = y(thData.data),
                isInUp = ChartUtils.compareDomainValue(yScale, yValue, yOriginValue);
              var yPosition, rectHeight,
                rectWidth = barConfig.width / rLength,
                xPosition = xScale(xValue) + thData.index/rLength*barConfig.width - barConfig.offset;

              if (isEnter) {
                hRect = hRContainer.append('rect').classed('visual-data-shape', true);
              } else {
                hRect = hRContainer;
              }

              if (isInUp) {
                yPosition = yScale(yValue);
                rectHeight = yScale(yOriginValue) - yScale(yValue);
                
                if (rectHeight == 0) {
                  rectHeight = 0.5;
                  hRect.style('transform-origin', function() {
                    var xc = xPosition + rectWidth / 2 + 'px';
                    var yc = yPosition + rectHeight / 2 + 'px';
                    return xc + ' ' + yc;
                  });
                } else {
                  hRect
                    .classed('rotated', true)
                    .style('transform-origin', function() {
                      var xc = xPosition + rectWidth / 2 + 'px';
                      var yc = yPosition + rectHeight / 2 + 'px';
                      return xc + ' ' + yc;
                    });
                }
              }else {
                yPosition = yScale(yOriginValue);
                rectHeight = yScale(yValue) - yScale(yOriginValue);

                hRect
                  .style('transform-origin', null)
                  .classed('rotated', false);
              }

              hRect
                .attr('y', yPosition)
                .attr('x', xPosition)
                .attr('width', rectWidth);

              if (isEnter) {
                hRect
                  .attr('height', 0)
                  .attr('fill', function(){
                    if (fnColorWrapper === null) {
                      return thData.config.color;
                    }else {
                      return fnColorWrapper(hRect, thData, {barGroupIndex: tIndex, barIndex: thIndex});
                    }
                  })
                  .transition()
                  .duration(duration)
                  .attr('height', rectHeight);
              } else {
                hRect
                  .transition()
                  .duration(duration)
                  .attr('height', rectHeight)
                  .attr('fill', function(){
                    if (fnColorWrapper === null) {
                      return thData.config.color;
                    }else {
                      return fnColorWrapper(hRect, thData, {barGroupIndex: tIndex, barIndex: thIndex});
                    }
                  });
              }

              // show text
              if (showText) {
                var hText = hEContainer.append('text')
                  .classed('bar-text', true)
                  .text(yFormat ? yFormat(yValue) : yValue)
                  .attr('x', xPosition + rectWidth/2)
                  .attr('y', function(){
                    var textHeight = this.getBBox().height;
                    return isInUp ? yPosition - textHeight/3 : yPosition + rectHeight + textHeight;
                  })
                  .style('opacity', 0);

                if (fnTextWrapper !== null) {fnTextWrapper(thData.data, hText.node(), {format: yFormat});}
                
                hText.transition()
                  .duration(duration + 500)
                  .style('opacity', 1);
              }

              hRect
                .on('mouseenter', function() {
                  var data = ChartUtils.formatDisplayedData({
                    x: x(thData.data),
                    yValues: [thData]
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

              if (fnPacketBar !== null) fnPacketBar(hRect, thData, {barGroupIndex: tIndex, barIndex: thIndex});
            });
          }
          function createHorizontalBars(selections, isEnter) {
            selections.each(function(thData, thIndex){
              var hRContainer = d3.select(this), hRect;
              var xValue = x(thData.data),
                yValue = y(thData.data),
                isInLeft = ChartUtils.compareDomainValue(xScale, xOriginValue, xValue);
              var xPosition, rectWidth,
                rectHeight = barConfig.width / rLength,
                yPosition = yScale(yValue) + thData.index/rLength*barConfig.width - barConfig.offset;

              if (isEnter) {
                hRect = hRContainer.append('rect').classed('visual-data-shape', true);
              } else {
                hRect = hRContainer;
              }

              if (isInLeft) {
                xPosition = xScale(xValue);
                rectWidth = xScale(xOriginValue) - xScale(xValue);

                if (rectWidth == 0) {
                  rectWidth = 0.5;
                  isInLeft = !isInLeft;

                  hRect.style('transform-origin', function() {
                    var xc = xPosition + rectWidth / 2 + 'px';
                    var yc = yPosition + rectHeight / 2 + 'px';
                    return xc + ' ' + yc;
                  });
                } else {
                  hRect
                    .classed('rotated', true)
                    .style('transform-origin', function() {
                      var xc = xPosition + rectWidth / 2 + 'px';
                      var yc = yPosition + rectHeight / 2 + 'px';
                      return xc + ' ' + yc;
                    });
                }
              }else {
                xPosition = xScale(xOriginValue);
                rectWidth = xScale(xValue) - xScale(xOriginValue);

                hRect
                  .style('transform-origin', null)
                  .classed('rotated', false);
              }

              hRect
                .attr('y', yPosition)
                .attr('x', xPosition)
                .attr('height', rectHeight);

              if (isEnter) {
                hRect
                  .attr('width', 0)
                  .attr('fill', function(){
                    if (fnColorWrapper === null) {
                      return thData.config.color;
                    }else {
                      return fnColorWrapper(hRect, thData, {barGroupIndex: tIndex, barIndex: thIndex});
                    }
                  })
                  .transition()
                  .duration(duration)
                  .attr('width', rectWidth);
              } else {
                hRect
                  .transition()
                  .duration(duration)
                  .attr('width', rectWidth)
                  .attr('fill', function(){
                    if (fnColorWrapper === null) {
                      return thData.config.color;
                    }else {
                      return fnColorWrapper(hRect, thData, {barGroupIndex: tIndex, barIndex: thIndex});
                    }
                  });
              }

              // show text
              if (showText) {
                var hText = hEContainer.append('text')
                  .classed('bar-text', true)
                  .text(xFormat ? xFormat(xValue) : xValue)
                  .attr('y', function(){
                    var textHeight = this.getBBox().height;
                    return yPosition + textHeight/3 + rectHeight / 2
                  })
                  .attr('x', function(){
                    var textWidth = this.getBBox().width;
                    return isInLeft ? xPosition - textWidth : xPosition + rectWidth + textWidth;
                  })
                  .style('opacity', 0);
                
                if (fnTextWrapper !== null) {fnTextWrapper(thData.data, hText.node(), {format: xFormat});}

                hText.transition()
                  .duration(duration + 500)
                  .style('opacity', 1);
              }

              hRect
                .on('mouseenter', function() {
                  var data = ChartUtils.formatDisplayedData({
                    x: x(thData.data),
                    yValues: [thData]
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

              if (fnPacketBar !== null) fnPacketBar(hRect, thData, {barGroupIndex: tIndex, barIndex: thIndex});
            });
          }
        });
      }
    });
  }

  model.fnColorWrapper = function(v) {
    if (!arguments.length) return fnColorWrapper;
    fnColorWrapper = utils.isFunction(v) ? v : null;
    return model;
  };
  model.fnTextWrapper = function(v) {
    if (!arguments.length) return fnTextWrapper;
    fnTextWrapper = utils.isFunction(v) ? v : null;
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

export default Bar
