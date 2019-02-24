import * as d3 from "d3"

import utils from '../../utils.js'
import ChartUtils from './chart-utils'

var Legend = function() {
  var host = this,
    cricleR = 5,
    visibility = null,
    maxTextLength = null,
    margin = { top: 0, right: 0, bottom: 25, left: 10 },
    legendGroupsAlign = "top-left",
    fnCustClick = null;

  function model(selections) {
    selections.each(function(data) {
      var hContainer = d3.select(this);
      var duration = host.duration(),
        hostMargin = host.margin(),
        legendDispatch = host.legendDispatch,
        isLegendSide=host.isLegendSide,
        isPie=host.isPie,
        limtWidth = host.limtLegenWidth ? (host.limtLegenWidth - margin.left - margin.right) : 0;

      hContainer
        .html('')
        .attr('transform', 'translate(' + (hostMargin.left + margin.left) + ',' + (hostMargin.top + margin.top) + ')');

      if (visibility !== null) {
        if (!visibility) return ;
      } else{
        if (data.length <= 1) return; // single bar don't need show
      }

      // build
      var prevWidth = 0,
          prevHeight = 0;

      // added by hong-yu
      utils.ascendSort_ObjectsInArray(data,"type");
      //====
      
      var legendGroups = hContainer.selectAll('g')
        .data(data)
        .enter()
        .append('g')
        .classed('legend-group', true);
      legendGroups.each(function(data, index) {
        var showTitle = false,
          legendGroup = d3.select(this);

        if (data.deleted) legendGroup.classed('deleted', true);
        if (isLegendSide) {
          addLegendInSide();
        } else {
          addLegend();
        }

        function addLegend() {
          legendGroup.append('circle')
            .attr('r', cricleR)
            .attr('cx', prevWidth)
            .attr('cy', prevHeight)
            .attr('fill', function(d) { return d.color; });

          legendGroup.append('text')
            .text(function(d) {
              if (maxTextLength === null || d.name.length <= maxTextLength) {
                return d.name;
              } else {
                showTitle = true;
                return d.name.substr(0, maxTextLength) + '...';
              }
            })
            .attr('x', prevWidth + cricleR + 3)
            .attr('y', cricleR + prevHeight);


          if (showTitle) {
            legendGroup.select('text')
              .append('title')
              .text(function(d) { return d.name });
          }

          prevWidth += legendGroup.node().getBBox().width + 15;
          if (limtWidth) {
            if (prevWidth > limtWidth) {
              prevHeight += legendGroup.node().getBBox().height + 5;
              prevWidth = 0;
              legendGroup.select('circle').remove();
              legendGroup.select('text').remove();
              addLegend();
            }
          }
        };

        function addLegendInSide() {
          legendGroup.append('rect')
            .attr('height', cricleR*2)
            .attr('width', cricleR*2)
            .attr('x', prevWidth)
            .attr('y', prevHeight)
            .attr('fill', function(d) { return d.color; });

          legendGroup.append('text')
            .text(function(d) {
              if (maxTextLength === null || d.name.length <= maxTextLength) {
                return d.name;
              } else {
                showTitle = true;
                return d.name.substr(0, maxTextLength) + '...';
              }
            })
            .attr('x', prevWidth + cricleR*2+5)
            .attr('y', cricleR*2 + prevHeight);


          if (showTitle) {
            legendGroup.select('text')
              .append('title')
              .text(function(d) { return d.name });
          }
          prevHeight += legendGroup.node().getBBox().height + 5;

        }
        // event

        legendGroups.select('rect')
          .on('click', function(d) {
            legendDispatch.call('click', this, d, { host: host, data: host.data, hContainer: host.hContainer });
          });
        legendGroups.select('circle')
          .on('click', function(d) {
            legendDispatch.call('click', this, d, { host: host, data: host.data, hContainer: host.hContainer });
          });
        legendGroups.select('text')
          .on('click', function(d) {
            legendDispatch.call('click', this, d, { host: host, data: host.data, hContainer: host.hContainer });
          });

        var m1 = hostMargin.left + margin.left;
        var m2 = hostMargin.top + margin.top;
        if (legendGroupsAlign == "top-right") {
          m1 = host.width - margin.right - hostMargin.right - prevWidth + 15 + 6;
        }
        hContainer.attr('transform', 'translate(' + m1 + ',' + m2 + ')');

      });
    });
  }
  model.defaultClick = function(d, config) {
    var host = config.host,
      data = config.data,
      hContainer = config.hContainer;

    d.deleted = d.deleted ? false : true;

    // if all of the deleted are true, set all to false
    var deletedNum = 0;
    data.forEach(function(ele) { if (ele.deleted) deletedNum++ });
    if (deletedNum === data.length) data.forEach(function(ele) { ele.deleted = false });

    hContainer.datum(data).call(host);

    if (fnCustClick) {
      fnCustClick.call(this, d, config);
    }
  }

  model.fnCustClick = function(v) {
    if (!arguments.length) return fnCustClick;
    fnCustClick = utils.isFunction(v) ? v : null;
    return model;
  }

  model.visibility = function(v) {
    if (!arguments.length) return visibility;
    visibility = v === null ? v : !!v;
    return model;
  }
  model.maxTextLength = function(v) {
    if (!arguments.length) return maxTextLength;
    maxTextLength = v === null ? v : +v;
    return model;
  }
  model.margin = function(v) {
    if (!arguments.length) return margin;
    margin.top = v.top !== undefined ? +v.top : margin.top;
    margin.right = v.right !== undefined ? +v.right : margin.right;
    margin.bottom = v.bottom !== undefined ? +v.bottom : margin.bottom;
    margin.left = v.left !== undefined ? +v.left : margin.left;
    return model;
  }
  model.cricleR = function(v) {
    if (!arguments.length) return circleR;
    cricleR = +v;
    return model;
  }
  // get this legend-groups size
  model.getSpace = function(h) {
    var size = h.node().getBBox();
    if (size.height == 0 || size.width == 0) return { width: 0, height: 0 };
    return {
      width: margin.left + (size.width > margin.right ? +size.width : margin.right),
      height: margin.top + (size.height > margin.bottom ? +size.height : margin.bottom)
    };
  }

  model.legendGroupsAlign = function(align) {
    if (!arguments.length) return "top-left";
    legendGroupsAlign = align;
    return model;
  }

  return model;
}

export default Legend
