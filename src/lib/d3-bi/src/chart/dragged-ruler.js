import * as d3 from "d3"

import core from '../core'
import utils from '../utils'

import ChartUtils from './models/chart-utils'

var DraggedRuler = function() {
  var distance = {left: 30, right: 30},
    sitePercentage = {pre: 0.1, lat: 0.7},
    disabledDrag = false;

  model.chartName = 'dragged-ruler';

  model.dispatch = d3.dispatch('dragging', 'drag-end', 'drag-start');

  model.mainLine = MainLine.call(model);
  model.preDraBut = DraggedButton.call(model).type('pre');
  model.latDraBut = DraggedButton.call(model).type('lat');

  function model(selections) {
    selections.each(function() {
      var hContainer = model.hContainer = d3.select(this);

      var dragPre = d3.drag()
        .on('drag', dragging)
        .on('start', dragStart)
        .on('end', dragEnd);

      var dragLat = d3.drag()
        .on('drag', dragging)
        .on('start', dragStart)
        .on('end', dragEnd);

      ChartUtils.initContainer(hContainer, {chartName: model.chartName});
      var width = model.width = hContainer.attr('width');
      var height = model.height = hContainer.attr('height');

      var mainArea = model.mainArea = {
        verCenter: height/2,
        left: distance.left,
        right: width - distance.right,
        width: width - distance.left - distance.right,
      };

      var hBGRec = hContainer
        .append('rect')
        .attr('width', width)
        .attr('height', height)
        .classed('background-rect', true);

      var hMailLine = hContainer
        .append('g')
        .call(model.mainLine);

      var hPreDraBut = hContainer
        .append('g')
        .classed('disabled', disabledDrag)
        .call(model.preDraBut)
        .call(dragPre);

      var hLatDraBut = hContainer
        .append('g')
        .classed('disabled', disabledDrag)
        .call(model.latDraBut)
        .call(dragLat);

      function dragging() {
        if (disabledDrag) return ;

        var newX = 0,
          newPer = 0,
          hThis = d3.select(this),
          type = hThis.classed('pre') ? 'pre' : 'lat';

        newX = d3.event.x < mainArea.left ? mainArea.left : d3.event.x;
        newX = newX > mainArea.right ? mainArea.right : newX;
        newPer = (newX - mainArea.left) / mainArea.width;

        if (type == 'pre') {
          if (newPer < 0 || newPer > sitePercentage.lat || newPer > 1) return ;
        } else {
          if (newPer < 0 || newPer < sitePercentage.pre || newPer > 1) return ;
        }

        sitePercentage[type] = newPer;
        model.mainLine.updateSelectedLine();
        hThis.attr('transform', 'translate('+ newX +','+ mainArea.verCenter +')');
        
        model.dispatch.call('dragging', this, newPer, type);
      }
      function dragStart() {
        if (disabledDrag) return ;

        var hThis = d3.select(this),
          type = hThis.classed('pre') ? 'pre' : 'lat';

        hThis.classed('drag', true);
        model.dispatch.call('drag-start', this, sitePercentage[type], type);
      }
      function dragEnd() {
        if (disabledDrag) return ;

        var hThis = d3.select(this),
          type = hThis.classed('pre') ? 'pre' : 'lat';

        hThis.classed('drag', false);
        model.dispatch.call('drag-end', this, sitePercentage[type], type);
      }
    });
  }

  model.sitePercentage = function(v) {
    if (!arguments.length) return sitePercentage;
    if (v.pre !== undefined) sitePercentage.pre = setToMiddle(+v.pre, 'pre');
    if (v.lat !== undefined) sitePercentage.lat = setToMiddle(+v.lat, 'lat');

    function setToMiddle(n, type) {
      if (isNaN(n)) {
        if (type === 'pre') {
          n = 0;
        } else if (type === 'lat') {
          n = 1;
        }
      } else {
        if (n < 0) {
          n = 0;
        } else if (n > 1) {
          n = 1;
        }
      }
      
      return n;
    }

    return model;
  };
  model.distance = function(v) {
    if (!arguments.length) return distance;
    if (v.left !== undefined) distance.left = +v.left;
    if (v.right !== undefined) distance.right = +v.right;
    return model;
  };
  model.disabledDrag = function(v) {
    if (!arguments.length) return disabledDrag;
    disabledDrag = !!v;
    return model;
  };

  return model;
};

var MainLine = function() {
  var host = this;
  var lineStrokeHeight = 4,
    maxTextLength = 5,
    leftText = null,
    rightText = null,
    valueRange = {min: 0, max: 1},
    showValueText = false,
    valueTextFormat = defaultValueTextFormat;

  function model(selections) {
    selections.each(function() {
      var mainArea = host.mainArea,
        sitePercentage = host.sitePercentage();

      var hContainer = d3.select(this)
        .html('')
        .classed('mail-line-wrapper', true);

      var hMainLine = hContainer
        .append('line')
        .attr('x1', mainArea.left)
        .attr('y1', mainArea.verCenter)
        .attr('x2', mainArea.right)
        .attr('y2', mainArea.verCenter)
        .attr('stroke-width', lineStrokeHeight)
        .classed('main-line', true);

      var hSelectedLine = model.hSelectedLine = hContainer
        .append('line')
        .attr('x1', mainArea.left + mainArea.width * sitePercentage.pre)
        .attr('y1', mainArea.verCenter)
        .attr('x2', mainArea.left + mainArea.width * sitePercentage.lat)
        .attr('y2', mainArea.verCenter)
        .attr('stroke-width', lineStrokeHeight)
        .classed('selected-line', true);

      if (showValueText) buildValueText();
      if (leftText !== null) buildLineText(leftText, 'left');
      if (rightText !== null) buildLineText(rightText, 'right');

      function buildValueText() {
        var hValueTexts = hContainer
          .append('g')
          .classed('value-text-group', true);

        var hMinMainLineText = hValueTexts
          .append('text')
          .classed('min-main-line-text', true)
          .text( valueTextFormat(valueRange.min) )
          .attr('x', function(){ return hMainLine.attr('x1') })
          .attr('y', function(){ return +hMainLine.attr('y1') + 25 });
        var hMaxMainLineText = hValueTexts
          .append('text')
          .classed('max-main-line-text', true)
          .text( valueTextFormat(valueRange.max) )
          .attr('x', function(){ return hMainLine.attr('x2') })
          .attr('y', function(){ return +hMainLine.attr('y2') + 25 });

        var hMinSelectedLineText = model.hMinSelectedLineText = hValueTexts
          .append('text')
          .classed('min-selected-line-text', true)
          .text( valueTextFormat(sitePercentage.pre * (valueRange.max - valueRange.min)) )
          .attr('x', function(){ return hSelectedLine.attr('x1') })
          .attr('y', function(){ return +hSelectedLine.attr('y1') + 25 });
        var hMaxSelectedLineText = model.hMaxSelectedLineText = hValueTexts
          .append('text')
          .classed('max-selected-line-text', true)
          .text( valueTextFormat(sitePercentage.lat * (valueRange.max - valueRange.min)) )
          .attr('x', function(){ return hSelectedLine.attr('x2') })
          .attr('y', function(){ return +hSelectedLine.attr('y2') + 25 });
      }
      function buildLineText(text, type) {
        var hTextWrapper = hContainer
          .append('g')
          .classed(type, true)
          .classed('line-text', true);

        var hTexts = hTextWrapper.selectAll('text')
          .data(utils.isArray(text) ? text : [text])
          .enter()
          .append('text');

        var curYPos = 0;
        hTexts.each(function(text, iText){
          var hText = d3.select(this), addTitle = text.length > maxTextLength ? true : false;

          hText.text(addTitle ? text.substr(0, maxTextLength) + '...' : text)
            .attr('x', 0)
            .attr('y', curYPos ? curYPos : 0);

          if (addTitle) hText.append('title').text(text);

          curYPos = hTextWrapper.node().getBBox().height;
        });

        hTextWrapper.attr('transform', function(){
          var box = this.getBBox();
          var length = hTexts.size();

          var othersTextHeight = length > 1 ? box.height/length*(length-1) : 0;
          var resY = mainArea.verCenter + box.height/length/2 - lineStrokeHeight/2 - othersTextHeight/2;

          if (type == 'left') {
            return 'translate('+ (mainArea.left-box.width-host.preDraBut.radius()) +','+ resY +')';
          } else {
            return 'translate('+ (mainArea.right+host.latDraBut.radius()) +','+ resY +')';
          }
        });
      }
    });
  }
  function defaultValueTextFormat(_d) {
    var d = +_d;
    if (!utils.isNumber(d)) {
      return _d;
    } else {
      return d.toFixed(1);
    }
  }

  model.updateSelectedLine = function() {
    var mainArea = host.mainArea,
      sitePercentage = host.sitePercentage();

    model.hSelectedLine
      .attr('x1', mainArea.left + mainArea.width * sitePercentage.pre)
      .attr('y1', mainArea.verCenter)
      .attr('x2', mainArea.left + mainArea.width * sitePercentage.lat)
      .attr('y2', mainArea.verCenter);

    if (showValueText) {
      model.hMinSelectedLineText
        .text( valueTextFormat(sitePercentage.pre * (valueRange.max - valueRange.min)) )
        .attr('x', function(){ return model.hSelectedLine.attr('x1') })
        .attr('y', function(){ return +model.hSelectedLine.attr('y1') + 25 });
      model.hMaxSelectedLineText
        .text( valueTextFormat(sitePercentage.lat * (valueRange.max - valueRange.min)) )
        .attr('x', function(){ return model.hSelectedLine.attr('x2') })
        .attr('y', function(){ return +model.hSelectedLine.attr('y2') + 25 });
    }
  };

  model.valueTextFormat = function(v) {
    if (!arguments.length) return valueTextFormat;
    if (!utils.isFunction(v)) {
      console.error('Dragged ruler: the value text format is not function.');
    } else {
      valueTextFormat = v;
    }

    return model;
  };
  model.valueRange = function(v) {
    if (!arguments.length) return valueRange;
    if (v.min !== undefined) valueRange.min = +v.min;
    if (v.max !== undefined) valueRange.max = +v.max;

    if (valueRange.min >= valueRange.max) console.error('Dragged ruler: set value-range error.');

    return model;
  };
  model.showValueText = function(v) {
    if (!arguments.length) return showValueText;
    showValueText = !!v;
    return model;
  };
  model.maxTextLength = function(v) {
    if (!arguments.length) return maxTextLength;
    maxTextLength = +v;
    return model;
  };
  model.rightText = function(v) {
    if (!arguments.length) return rightText;
    rightText = v;
    return model;
  };
  model.leftText = function(v) {
    if (!arguments.length) return leftText;
    leftText = v;
    return model;
  };
  model.lineStrokeHeight = function(v) {
    if (!arguments.length) return lineStrokeHeight;
    lineStrokeHeight = +v;
    return model;
  };

  return model;
};

var DraggedButton = function() {
  var host = this;
  var type = 'pre',
    radius = 10;

  function model(selections) {
    selections.each(function() {
      var mainArea = host.mainArea,
        sitePercentage = host.sitePercentage();

      var hContainer = d3.select(this)
        .html('')
        .attr('transform', 'translate('+ (mainArea.left + mainArea.width * sitePercentage[type]) +','+ mainArea.verCenter +')')
        .classed(type, true)
        .classed('dragged-button-wrapper', true);//i'm here

      var hCircle = hContainer
        .append('circle')
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('r', radius)
        .classed('dragged-button', true);
    });
  }

  model.radius = function(v) {
    if (!arguments.length) return radius;
    radius = +v;
    return model;
  };
  model.type = function(v) {
    if (!arguments.length) return type;
    type = v;
    return model;
  };

  return model;
};

export default DraggedRuler
