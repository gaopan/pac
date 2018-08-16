import * as d3 from "d3"
import utils from '../../utils.js'

var ChartUtils = {};

// get and set width and height, and set class name
ChartUtils.initContainer = function(container, config) {
  config = config || {};

  var chart = config.chart,
    width = parseFloat( d3.select(container.node().parentNode).style('width') ),
    height = parseFloat( d3.select(container.node().parentNode).style('height') );
  
  if (!utils.isNumber(width) || width < 10) width = 100;
  if (!utils.isNumber(height) || height < 10) height = 100;

  // Clear bi-tooltip
  chart && chart.tooltip && chart.tooltip.remove()();

  // if is no data chart, clear.
  if (container.classed('no-data-chart')) {
    container.selectAll('text').remove();
    container.html('').classed('no-data-chart', false);
  }
  
  // clear mark-class
  if (container.selectAll('.visual-data-shape').size()) {
    container.selectAll('.visual-data-shape')
      .classed('active', false)
      .classed('inactive', false);
  }

  container.attr('width', width)
    .attr('height', height)
    .classed('bi-container', true)
    .classed(config.chartName, true);
};

// build the chart with no data
ChartUtils.buildNoDataChart = function(container) {
  container.classed('no-data-chart', true);

  container.html('');

  container.iappend('text')
    .text('No data to display')
    .attr('x', function(){ return (parseFloat(container.style('width')) - this.getBBox().width) / 2})
    .attr('y', function(){ return (parseFloat(container.style('height')) - this.getBBox().height) / 2});
};

// get suit domain in two kind scale
ChartUtils.getScaleDomain = function(scale, data, fn, conf) {
  var domain = [], fData = [];

  if (!conf || !conf.axis) {
    fData = data;
  } else {
    fData = filterRightData(data, conf.axis);
  }

  if (scale.hasOwnProperty('bandwidth')) {
    domain = fData[0].values.map(fn);
  }else {
    domain = ChartUtils.getDataArrExtent(fData, fn);
  }

  function filterRightData(data, axis) {
    var res = [];
    data.forEach(function(ele){
      if (axis == 'x') {
        res.push(ele);
      } else if (axis == 'y') {
        if (ele.axis != 'y2') res.push(ele);
      } else if (axis == 'y2') {
        if (ele.axis == 'y2') res.push(ele);
      }
    });
    return res;
  }

  return domain;
}

ChartUtils.transformDomain = function(domain, Axis) {
  var scale = Axis.scale(),
    domainToZero = Axis.domainToZero();

  if (!scale.hasOwnProperty('bandwidth')) {
    // whether set min to zero ?
    if (domainToZero && d3.max(domain) > 0) {
      domain[0] > domain[1] ? (domain[1] = 0) : (domain[0] = 0);
    }

    // special situation: min == max
    if (domain[0] == domain[1]) {
      if (domain[0] > 86400000) {
        // for time
        domain = [domain[0] - 86400000, domain[0] + 86400000];
      } else if (domainToZero && domain[0] == 0) {
        domain = [0, 1];
      } else {
        domain = [domain[0] - 1, domain[0] + 1];
      }
    }
  }

  return domain;
}

ChartUtils.compareDomainValue = function(scale, value, originValue) {
  var res = null, range = scale.range();
  
  if (range[0] <= range[1]) {
    res = scale(value) >= scale(originValue);
  }else {
    res = scale(value) <= scale(originValue);
  }

  return res;
}

// get the extent value in arrs. Just like [[[], []], [[], []]].
ChartUtils.getDataArrExtent = function(data, fn) {
  var arr = [];

  data.forEach(function(ele){ arr = arr.concat(d3.extent(ele.values, fn)) });

  return d3.extent(arr);
}

// get the height of all axis in virtual environment
ChartUtils.getAxisHeight = function(container, config) {
  var res = {},
    hAxis = container.iappend('g.axis-groups').style('opacity', 0);

  if (config.xAxis){
    var hXAxis = hAxis.iappend('g.xaxis-group').call(config.xAxis);
    res.xAxisHeight = Math.ceil(hXAxis.node().getBBox().height);
  }

  if (config.yAxis){
    var hYAxis = hAxis.iappend('g.yaxis-group').call(config.yAxis);
    res.yAxisHeight = Math.ceil(hYAxis.node().getBBox().width);
  }

  if (config.y2Axis){
    var hY2Axis = hAxis.iappend('g.y2axis-group').call(config.y2Axis);
    res.y2AxisHeight = Math.ceil(hY2Axis.node().getBBox().width);
  }

  hAxis.html('').style('opacity', null);

  return res;
}

// get suit config in two kind scale
ChartUtils.getScaleConfig = function(scale, config) {
  var res = {}, hAxis = utils.isObject(config) ? config.hAxis : null;

  // offset
  res.offset = 0;
  if ( scale.hasOwnProperty('bandwidth') ) {
    res.offset = scale.bandwidth() / 2;
  }

  // list
  res.list = [];
  if (hAxis && hAxis.size()) {
    res.list = hAxis.selectAll('g.tick').select('text').data();
  }

  return res;
}

// dispense data by type
ChartUtils.dispenseData = function(data) {
  var res = {};

  data.forEach(function(ele){
    // transform the special line to spot, which only have one value.
    if(ele.type == 'line' && ele.values.length === 1) ele.type = 'spot';

    var type = ele.type;
    if (res.hasOwnProperty(type)) {
      res[type].push(ele);
    }else {
      res[type] = [ele];
    }
  });

  return res;
}

// together y value, which have same x value.
ChartUtils.togetherDatas = function(scale, data, config) {
  if (!scale.hasOwnProperty('bandwidth')) {
    return ChartUtils.togetherLinearDatas(data, config);
  }else {
    return ChartUtils.togetherOrdinalDatas(scale.domain(), data, config);
  }
}

// for Linear
ChartUtils.togetherLinearDatas = function(data, config) {
  var res = [],
    listObj = {},
    x = config.x;

  data.forEach(function(ele){
    ele.values.forEach(function(eele){
      var xValue = x(eele);
      if (listObj.hasOwnProperty(xValue)) {
        listObj[xValue].yValues.push({
          index: listObj[xValue].yValues.length,
          data: eele,
          config: ele
        });
      }else {
        listObj[xValue] = {
          x: xValue,
          yValues: [{
            index: 0,
            data: eele,
            config: ele
          }]
        };
      }
    });
  });

  for(var k in listObj) { if (listObj.hasOwnProperty(k)) res.push(listObj[k]); }

  return res;
}

// for Ordinal
ChartUtils.togetherOrdinalDatas = function(lists, data, config) {
  var res = [],
    listObj = {},
    x = config.x;

  lists.forEach(function(ele){listObj[ele] = {x: '', yValues:[]};});

  data.forEach(function(ele){
    ele.values.forEach(function(eele){
      var xValue = x(eele);
      if (listObj.hasOwnProperty(xValue)){
        listObj[xValue].x = xValue;
        listObj[xValue].yValues.push({
          index: listObj[xValue].yValues.length,
          data: eele,
          config: ele
        });
      }
    });
  });

  for(var k in listObj) { if (listObj.hasOwnProperty(k)) res.push(listObj[k]); }

  return res;
}

// format data, which will be displayed. PS; it's a data copy.
ChartUtils.formatDisplayedData = function(data, config) {
  var res = {x: '', yValues: []},
    x = config.x,
    y = config.y,
    xFormat = config.xFormat,
    yFormat = config.yFormat;

  res.x = xFormat === null ? data.x : xFormat(data.x);

  data.yValues.forEach(function(ele){
    var obj = {config: ele.config};
    for(var k in ele) {
      if (ele.hasOwnProperty(k)) {
        if (k == 'data') {
          obj[k] = {
            x: xFormat === null ? x(ele[k]) : xFormat(x(ele[k])),
            y: yFormat === null ? y(ele[k]) : yFormat(y(ele[k]))
          };
          // extend label
          if (obj.config.label && utils.isArray(obj.config.label.extends)) {
            obj.config.label.extends.forEach(function(extend){
              obj[k][extend.key] = extend.getFn(ele[k]);
            });
          }
        }else if (k != 'config'){
          obj[k] = ele[k];
        }
      }
    }
    res.yValues.push(obj);
  });

  return res;
}

// only in display level, change the css
// only one can be selected
ChartUtils.singleActive = function(data, config) {
  var hShape, chart = config.chart;

  if (this.nodeName.toLowerCase() != 'line') {
    hShape = d3.select(this);
  }else {
    hShape = d3.select(this.parentNode);
  }

  chart.hContainer
    .selectAll('.visual-data-shape')
    .classed('active', false)
    .classed('inactive', true);
  hShape.classed('active', true).classed('inactive', false);
}
ChartUtils.multiActive = function(data, config) {
  var hShape, chart = config.chart;

  if (this.nodeName.toLowerCase() != 'line') {
    hShape = d3.select(this);
  }else {
    hShape = d3.select(this.parentNode);
  }

  if ( hShape.classed('active') ) {
    hShape.classed('active', false).classed('inactive', true);
  }else {
    hShape.classed('active', true).classed('inactive', false);
  }
}

// work when scale is not scaleband
ChartUtils.getBarConfig = function(scale, config) {
  var res = {width: null, offset: 0},
    length = config.length;

  if (scale.hasOwnProperty('bandwidth') && scale.bandwidth() != 0) {
    res.width = scale.bandwidth();
  }else {
    res.width = d3.max(scale.range()) / length / 2;
    res.offset = res.width / 2;
  }

  return res;
}

// the adapter of stack data
ChartUtils.stackAdapter = function(data, config) {
  var res = [],
    values = [],
    vLength = data[0].values.length,
    x = config.x,
    y = config.y;

  for(var i = 0; i< vLength; i++) {
    var obj = {_x: x(data[0].values[i])};
    data.forEach(function(ele){ obj[ele.key] = y(ele.values[i]);});
    values.push(obj);
  }

  res = d3.stack().keys(data.map(function(d){ return d.key}))(values);
  res.forEach(function(ele, i){
    // add config
    ele.config = data[i];
    // add origin data
    ele.forEach(function(eele){ eele.oData = getOriginData(eele, ele.config, {x: x, y: y});});
  });

  function getOriginData(data, config, fns) {
    var res = {}, values = config.values, key = config.key;
    for (var i=0; i< values.length; i++) {
      if (fns.y(values[i]) === data.data[key] && fns.x(values[i]) === data.data._x) {
        res = values[i];
        break;
      }
    }
    return res;
  }

  return res;
};

export default ChartUtils
