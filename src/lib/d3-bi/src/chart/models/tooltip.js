import * as d3 from "d3"

import utils from '../../utils.js'
import ChartUtils from './chart-utils'

var Tooltip = function() {
  var host = this,
    hTooltip = null, // this tooltip html
    showName = false,
    privateClass = null,
    styleType = 'base';

  // tooltip action
  var init = function() {
    hTooltip = d3.select('div.bi-tooltip');

    if (hTooltip.size()) {
      hTooltip.html('')
    } else {
      hTooltip = d3.select('body')
        .append('div')
        .classed('bi-tooltip', true);
    }

    if (privateClass) hTooltip.classed(privateClass, true);
  }
  var build = function(data) {
    init();
    show();
    hTooltip.html( setContent(data) ); // set content
    setPosition();
  }
  var setContent = function(data) {
    return tooltipStyle[styleType](data);
  }
  var setContentDefault = function(data) {
    return tooltipStyle[styleType](data);
  }
  var setPosition = function() {
    var windowSize = utils.windowSize(),
      tooltipSize = {width: parseFloat(hTooltip.style('width')), height: parseFloat(hTooltip.style('height'))},
      x = d3.event.clientX,
      y = d3.event.clientY,
      className = null;

    hTooltip.classed('leftTop', false)
      .classed('leftBottom', false)
      .classed('rightTop', false)
      .classed('rightBottom', false);

    if (x <= windowSize.width / 2){
      if (y <= windowSize.height / 2) {
        x += 20;
        y -= 20;
        className = 'leftTop';
      }else {
        x += 20;
        y -= tooltipSize.height - 20;
        className = 'leftBottom';
      }
    }else {
      if (y <= windowSize.height / 2) {
        x += - tooltipSize.width - 20;
        y -= 20;
        className = 'rightTop';
      }else {
        x += - tooltipSize.width - 20;
        y -= tooltipSize.height - 20;
        className = 'rightBottom';
      }
    }

    hTooltip.classed(className, true)
      .style('top', y + 'px').style('left', x + 'px');
  }
  var show = function() {
    hTooltip.style('display', 'block');
    if (privateClass) hTooltip.classed(privateClass, true);
  }
  var remove = function() {
    if (hTooltip) {
      hTooltip.style('display', 'none');
      if (privateClass) hTooltip.classed(privateClass, false);
    }
  }

  // tooltip style
  var tooltipStyle = {};
  tooltipStyle.base = function(d) {
    if (d.yValues.length > 1) return tooltipStyle.baseMulti(d);

    var str = '',
      data = d.yValues[0].data,
      config = d.yValues[0].config;
      
    if (showName) str += '<tr><td class="title">'+ config.label.name.toUpperCase() +'</td><td>'+ config.name +'</td></tr>';
    for (var k in data) {
      if (data.hasOwnProperty(k) && config.label.hasOwnProperty(k)) {
        str += '<tr><td class="title">'+ config.label[k].toUpperCase() +'</td><td>'+ data[k] +'</td></tr>';
      }
    }

    return '<table>'+ str +'</table>';
  };
  tooltipStyle.baseMulti = function(d) {
    var str = '';
    
    str += '<tr><td colspan="3">'+ d.x +'</td></tr>';
    
    d.yValues.forEach(function(ele){
      str += 
        '<tr>' +
          '<td><div class="circle" style="background-color: '+ ele.config.color +';"></div></td>' +
          '<td class="title">'+ ele.config.label.y.toUpperCase() +'</td>' +
          '<td>'+ ele.data.y +'</td>' +
        '</tr>';
    });

    return '<table class="style-one">'+ str +'</table>';
  };

  function model() {}

  model.privateClass = function(v) {
    if (!arguments.length) return privateClass;
    privateClass = v;
    return model;
  }
  model.styleType = function(v) {
    if (!arguments.length) return styleType;
    styleType = v;
    return model;
  }
  model.showName = function(v) {
    if (!arguments.length) return showName;
    showName = !!v;
    return model;
  }
  model.build = function(v) {
    if (!arguments.length) return build;
    build = v;
    return model;
  }
  model.setContent = function(v) {
    if (!arguments.length) return setContent;
    setContent = utils.isFunction(v) ? v : setContentDefault;
    return model;
  }
  model.setPosition = function(v) {
    if (!arguments.length) return setPosition;
    setPosition = v;
    return model;
  }
  model.remove = function(v) {
    if (!arguments.length) return remove;
    remove = v;
    return model;
  }

  return model;
}

export default Tooltip
