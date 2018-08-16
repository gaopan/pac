import * as d3 from 'd3'
import utils from '../../utils.js'
import ChartUtils from './chart-utils'
var Pie = function() {
  var host = this;

  function model(selections) {
    selections.each(function(data) {
      var hContainer = d3.select(this);
      var height = host.pieHeight ? host.pieHeight : 500,
        width = host.pieWidth ? host.pieWidth : 500,
        getLabel = function(d) { return d.label },
        getValue = function(d) { return d.value },
        color = [
          "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd",
          "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"
        ],
        marginTop=host.pieTop? host.pieTop:0,
        colors = host.colors ? host.colors : color,
        valueFormat = host.format ? host.format : d3.format(',.2f'),
        showLabels = host.showLabels ? host.showLabels : true,
        labelsOutside = host.labelsOutside ? host.labelsOutside : false,
        labelThreshold = host.labelThreshold ? host.labelThreshold : .02,
        hideOverlaLabels = host.hideOverlaLabels ? host.hideOverlaLabels : false,
        donut = host.donut ? host.donut : true,
        title = host.title ? host.title : false,
        titleUnit = host.titleUnit ? host.titleUnit : false,
        growOnHover = host.growOnHover ? host.growOnHover : false,
        titleOffset = 0,
        startAngle = host.startAngle ? host.startAngle : false,
        endAngle = host.endAngle ? host.endAngle : false,
        padAngle = false,
        donutRadius = utils.isNumber(host.donutRadius) ? host.donutRadius : 0.5,
        duration = 250,
        arcRadius = [],
        tooltipDispatch = host.tooltipDispatch ? host.tooltipDispatch : null,
        radius = host.radius ? host.radius : Math.min(width, height) / 2,
        arcsRadiusOuter = [],
        legendHeight = host.legendHeight ? host.legendHeight : 0,
        pieDispatch = host.pieDispatch,
        arcsRadiusInner = [];
      if (arcRadius.length === 0) {
        var outer = radius - radius / 10,
          inner = radius * donutRadius;
        for (var i = 0; i < data[0].length; i++) {
          arcsRadiusOuter.push(outer);
          arcsRadiusInner.push(inner);
        }
      } else {
        if (growOnHover) {
          arcsRadiusOuter = arcsRadius.map(function(d) { return (d.outer - d.outer / 10) * radius; });
          arcsRadiusInner = arcsRadius.map(function(d) { return (d.inner - d.inner / 10) * radius; });
          donutRatio = d3.min(arcsRadius.map(function(d) { return (d.inner - d.inner / 10); }));
        } else {
          arcsRadiusOuter = arcsRadius.map(function(d) { return d.outer * radius; });
          arcsRadiusInner = arcsRadius.map(function(d) { return d.inner * radius; });
          donutRatio = d3.min(arcsRadius.map(function(d) { return d.inner; }));
        }
      }
      var arcs = [];
      var arcsOver = [];
      for (var i = 0; i < data[0].length; i++) {

        if (donut) {
          var arc = d3.arc().outerRadius(arcsRadiusOuter[i]).innerRadius(arcsRadiusInner[i]);
          var arcOver = d3.arc().outerRadius(arcsRadiusOuter[i] + 5).innerRadius(arcsRadiusInner[i] - 5);

        } else {
          var arc = d3.arc().outerRadius(arcsRadiusOuter[i]);
          var arcOver = d3.arc().outerRadius(arcsRadiusOuter[i] + 5);
        }


        if (startAngle !== false) {
          arc.startAngle(startAngle);
          arcOver.startAngle(startAngle);
        }
        if (endAngle !== false) {
          arc.endAngle(endAngle);
          arcOver.endAngle(endAngle);
        }
        // if (donut) {
        //   arc.innerRadius(arcsRadiusInner[i]);
        //   arcOver.innerRadius(arcsRadiusInner[i]);
        // }

        // if (arc.cornerRadius && cornerRadius) {
        //     arc.cornerRadius(cornerRadius);
        //     arcOver.cornerRadius(cornerRadius);
        // }

        arcs.push(arc);
        arcsOver.push(arcOver);
      }


      utils.initSVG(hContainer);


      // create the chart
      var wrap;
      if (hContainer.selectAll('.bi-pie.bi-pie').size()) {
        wrap = hContainer.selectAll('.bi-wrap.bi-pie').data(data);
      } else {
        wrap = hContainer.selectAll('.bi-wrap.bi-pie').data(data).enter().append('g').attr('class', 'bi-wrap bi-pie');
      }

      var gEnter = wrap.append('g');
      var g = wrap.select('g');
      var g_pie = gEnter.append('g').attr('class', 'bi-pie');
      gEnter.append('g').attr('class', 'bi-pieLabels');
      g.select('.bi-pie').attr('transform', 'translate(' + width / 2 + ',' + (height / 2 + legendHeight+marginTop) + ')');
      g.select('.bi-pieLabels').attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

      var pie = d3.pie()
        .sort(null)
        .value(function(d) {
          return d.deleted ? 0 : getValue(d);
        });
      if (pie.padAngle && padAngle) {

        pie.padAngle(padAngle)
      }
      if (donut) {
        if (title) {
          g.append('text').attr('class', 'pie-title')
          g.select('.pie-title')
            .style("text-anchor", "middle")
            .text(function(d) {
              if (typeof title == 'function') {
                var text = title.call(this, d);
              } else {
                var text = title;
              }

              return text
            })
            .style("font-size", (Math.min(width, height)) * donutRadius * 2 / (title.length + 6) + "px")
            .attr('transform', 'translate(' + width / 2 + ',' + (height / 2 + legendHeight) + ')')
            .attr("dy", "0.35em"); // trick to vertically center text
          if (titleUnit) {
            g.select('.pie-title').attr('transform', 'translate(' + width / 2 + ',' + ((height / 2 + legendHeight) - (Math.min(width, height)) * donutRadius / (title.length + 12)) + ')');
            g.append('text').attr('class', 'pie-title-unit')
            g.select('.pie-title-unit')
              .style("text-anchor", "middle")
              .style("fill", '#858585')
              .text(function(d) {
                if (typeof titleUnit == 'function') {
                  var text = titleUnit.call(this, d);
                } else {
                  var text = titleUnit;
                }

                return text
              })
              .style("font-size", (Math.min(width, height)) * donutRadius / (title.length + 12) + "px")
              .attr("dy", "0.35em") // trick to vertically center text
              .attr('transform', 'translate(' + width / 2 + ',' + ((height / 2 + legendHeight) + (Math.min(width, height)) * donutRadius / (title.length + 8)) + ')');

          }
        }
      }

      var slices;
      if (wrap.select('.bi-pie').selectAll('.pie-slice').size() >= data[0].length) {
        slices = wrap.select('.bi-pie').selectAll('.pie-slice').data(pie);
        slices.exit().remove();
      } else {
        slices = wrap.select('.bi-pie').selectAll('.pie-slice').data(pie).enter().append('g').attr('class', 'pie-slice');
      }


      // var ae = slices.enter().append('g');
      // ae.attr('class', 'pie-slice');
      var paths = slices.append('path').each(function(d) {
        this._current = d;
        return d
      });


      slices.attr("fill", function(d, i) {
        var currentColor = d.data.color ? d.data.color : colors[i];
        return currentColor;
      });
      slices.attr('stroke', function(d, i) {
        var currentColor = d.data.color ? d.data.color : colors[i]
        return currentColor
      });
      slices.select("path")
        .transition()
        .duration(1000)
        .attrTween('d', arcTween);

      if (tooltipDispatch) {
        slices.on('mouseenter', function(d) {
            var data = {
              x: d.data.label,
              yValues: [{
                config: d.data,
                data: d.data.values
              }]
            };
            tooltipDispatch.call('build', this, data);
          })
          .on('mousemove', function() { tooltipDispatch.call('setPosition', this); })
          .on('mouseleave', function() { tooltipDispatch.call('remove', this); })
          .on('click', function(d, i) {

            if (1) {
              if (!d.data.isClicked) {
                d3.select(this).select('path').transition()
                  .duration(50)
                  .attr("d", arcsOver[i]);
                d.data.isClicked = true;
              } else {
                d3.select(this).select('path').transition()
                  .duration(50)
                  .attr("d", arcs[i]);
                d.data.isClicked = false;
              }
            };
            if (title) {
              g.select('.pie-title')
                .text(function(d) {
                  if (typeof title == 'function') {
                    var text = title.call(this, d);
                  } else {
                    var text = title;
                  }

                  return text
                })
              if (titleUnit) {
                g.select('.pie-title-unit')
                  .style("text-anchor", "middle")
                  .text(function(d) {
                    if (typeof titleUnit == 'function') {
                      var text = titleUnit.call(this, d);
                    } else {
                      var text = titleUnit;
                    }

                    return text
                  })

              }
            }

            pieDispatch.call('pieClick', this, d);
          });
      }

      function angle(d) {
        var a = (d.startAngle + d.endAngle) * 90 / Math.PI - 90;
        return a > 90 ? a - 180 : a;
      }

      function arcTween(a, idx) {
        a.endAngle = isNaN(a.endAngle) ? 0 : a.endAngle;
        a.startAngle = isNaN(a.startAngle) ? 0 : a.startAngle;
        // a.innerRadius = 0;
        var i = d3.interpolate(this._current, a);
        this._current = i(0);
        return function(t) {
          if (a.data.isClicked) {
            return arcsOver[idx](i(t));
          } else {
            return arcs[idx](i(t));
          }
        };
      }

    })
  };

  return model;
};
export default Pie
