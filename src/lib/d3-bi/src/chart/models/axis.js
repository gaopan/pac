import * as d3 from "d3"

import utils from '../../utils.js'
import ChartUtils from './chart-utils'

var Axis = function() {
  var host = this,
    axis = null, // function, like d3.axisBottom()
    scale = null, // function, like d3.scaleLinear()
    title = null,
    packetAxis = null,
    titleDistance = 15,
    axisName = null,
    stackModel = false,
    domainToZero = false,
    givenDomain = null, // can be a callback function
    textRotate = null,
    axisVisibility = null,
    maxTextLength = null;

  model.needCreateTitle = true;

  function model(selections) {
    selections.each(function() {
      var hContainer = d3.select(this);
      var duration = host.duration ? host.duration() : 0,
        temp = axisName + 'AxisPosition',
        axisWidth = d3.max(scale.range()),
        axisPosition = host.hasOwnProperty(temp) ? host[temp] : {x:0, y:0};

      axis.scale(scale);

      hContainer.html('')
        .attr('transform', 'translate('+ axisPosition.x +','+ axisPosition.y +')')
        .call(axis);

      // remove some d3 settings for x,yAxis
      hContainer.attr('fill', null)
        .attr('font-size', null)
        .attr('text-anchor', null)
        .attr('font-family', null);
      hContainer.selectAll('g.tick').attr('opacity', null);
      hContainer.selectAll('text').attr('fill', null);
      hContainer.selectAll('path').attr('stroke', null);
      hContainer.selectAll('line').attr('stroke', null);

      // deal text
      var hTexts = hContainer.selectAll('g.tick').select('text');
      if (textRotate !== null) {
        hTexts.classed('rotated', true)
          .attr('transform', 'rotate('+ textRotate +')');
      }else {
        hTexts.classed('rotated', false);
      }
      if (maxTextLength !== null) {
        hTexts.each(function(){
          var hText = d3.select(this),
            text = hText.text(),
            showTitle = text.length >= maxTextLength ? true : false;
          
          if (showTitle) {
            hText.text( text.substr(0, maxTextLength) + '...' );
            hText.append('title').text(text);
          }
        });
      }

      if (axisVisibility !== null && !axisVisibility) {
        hContainer.selectAll('g.tick').style('display', 'none');
        hContainer.selectAll('path.domain').style('display', 'none');
      }

      // create title
      if (title !== null && model.needCreateTitle) {
        var containerBox = hContainer.node().getBBox();
        var hTitle = hContainer.iappend('text.title').text(title);
        var titleBox = hTitle.node().getBBox();
        
        if (axisName == 'x') {
          hTitle
            .attr('x', (axisWidth - titleBox.width) / 2 )
            .attr('y', containerBox.height + titleDistance + 5 );
        }else if (axisName == 'y') {
          hTitle
            .attr('x', -(axisWidth - titleBox.width) / 2 - titleBox.width )
            .attr('y', -(containerBox.width + titleDistance) );
        }else if (axisName == 'y2') {
          hTitle
            .attr('x', (axisWidth - titleBox.width) / 2 )
            .attr('y', -(containerBox.width + titleDistance) );
        }
      }

      // custome set
      if (packetAxis !== null) packetAxis(hContainer, {});
    });
  }

  // spaciel style in axis;
  model.wrapper = {};
  model.wrapper.fromToWrapper = function(hTick, textArr, config) {
    config = config || {};

    var textSpace =  config.textSpace || 3,
      maxTextLength = config.maxTextLength || 10,
      prevTextInfo = hTick.select('text').node().getBBox();

    hTick.selectAll('text').remove();

    textArr.forEach(function(ele, i){
      var text = ele,
        showTitle = ele.length > maxTextLength ? true : false,
        newHText = hTick.append('text');

      if (showTitle) text = ele.substr(0, maxTextLength) + '...';

      newHText
        .text(text)
        .attr('x', prevTextInfo.x + prevTextInfo.width/2)
        .attr('y', prevTextInfo.y + i*(prevTextInfo.height + textSpace) + prevTextInfo.height);
      if (showTitle) newHText.append('title').text(ele);
    });
  };

  model.stackModel = function(v) {
    if (!arguments.length) return stackModel;
    stackModel = !!v;
    return model;
  };
  model.axisVisibility = function(v) {
    if (!arguments.length) return axisVisibility;
    axisVisibility = v === null ? v : !!v;
    return model;
  };
  model.packetAxis = function(v) {
    if (!arguments.length) return packetAxis;
    packetAxis = utils.isFunction(v) ? v : null;
    return model;
  };
  model.givenDomain = function(v) {
    if (!arguments.length) return givenDomain;
    givenDomain = v;
    return model;
  };
  model.domainToZero = function(v) {
    if (!arguments.length) return domainToZero;
    domainToZero = !!v;
    return model;
  };
  model.titleDistance = function(v) {
    if (!arguments.length) return titleDistance;
    titleDistance = +v;
    return model;
  };
  model.title = function(v) {
    if (!arguments.length) return title;
    title = v;
    return model;
  };
  model.axisName = function(v) {
    if (!arguments.length) return axisName;
    axisName = v;
    return model;
  };
  model.textRotate = function(v) {
    if (!arguments.length) return textRotate;
    textRotate = v === null ? v : +v;
    return model;
  };
  model.maxTextLength = function(v) {
    if (!arguments.length) return maxTextLength;
    maxTextLength = v === null ? v : +v;
    return model;
  };
  model.scale = function(v) {
    if (!arguments.length) return scale;
    scale = v;
    return model;
  };
  model.axis = function(v) {
    if (!arguments.length) return axis;
    axis = v;
    return model;
  };

  return model;
};

export default Axis
