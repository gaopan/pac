import * as d3 from 'd3'

import utils from '../../utils.js'
import ChartUtils from './chart-utils'

var Dashboard = function() {
    var host = this,
        defaultConf = {
            size: 320,
            min: 0,
            max: 140,
            ticks: 7
        };


    function model(selections) {
        selections.each(function(data) {
            var hContainer = d3.select(this);
            var dashTitle = host.dashTitle ? host.dashTitle : null,
                dashTitleUnit = host.dashTitleUnit ? host.dashTitleUnit : null,
                config = host.config ? host.config : defaultConf;
            config.radius = config.size / 2;
            config.range = data[0].dRange ? data[0].dRange : 140;
            config.cx = 0;
            config.cy = 0;
            config.height = host.height ? host.height : 320;
            if (data[0].data > data[0].dRange) {
                data[0].data = data[0].dRange;
            }
            if (hContainer.selectAll('.dashboradBody').size()) {

                var body = hContainer.selectAll('.dashboradBody');
                body.selectAll('line').remove();
                body.selectAll('text').remove();
                body.selectAll('circle').remove();
            } else {
                var body = hContainer
                    .append('g')
                    .data(data)
                    .attr('class', 'dashboradBody')
            }
            var wrap = body
                .attr('width', config.size + 'px')
                .attr('height', config.size + 'px')
                .attr('transform', 'translate(' + host.availableWidth / 2 + ',' + host.availableHeight / 2 + ')');

            var fontSize = Math.round(config.size / 8);
            var majorDelta = 140 / 6;
            for (var major = 0; major <= 140; major += majorDelta) {
                var i = 0;
                i = i++;
                var point1 = valueToPoint(major, 0.8);
                var point2 = valueToPoint(major, 0.9);

                wrap.append("g:line")
                    .attr("x1", point1.x)
                    .attr("y1", point1.y)
                    .attr("x2", point2.x)
                    .attr("y2", point2.y)
                    .attr('class', 'point' + i)
                    .style("stroke", "#c7c7c7")
                    .style("stroke-width", "3px")

                if (major == config.min) {
                    var point = valueToPoint(0 - majorDelta, 0.60);
                    if (dashTitle) {
                        wrap.append("g:text")
                            .attr("x", point.x)
                            .attr("y", point.y)
                            .attr("dy", fontSize / 6)
                            .attr("text-anchor", 'middle')

                            .text(function(d) {
                                if (typeof dashTitle == 'function') {
                                    var text = dashTitle.call(this, d);
                                } else {
                                    var text = dashTitle;
                                }

                                return text
                            })
                            .style("font-size", fontSize + "px")
                            .style("fill", "#333")
                            .style("font-weight", "900");
                        if (dashTitleUnit) {
                            var point = valueToPoint(0 - majorDelta, 0.80);
                            wrap.append("g:text")
                                .attr("x", point.x)
                                .attr("y", point.y)
                                .attr("dy", fontSize / 6)
                                .attr("text-anchor", 'middle')
                                .text(function(d) {
                                    if (typeof dashTitleUnit == 'function') {
                                        var text = dashTitleUnit.call(this, d);
                                    } else {
                                        var text = dashTitleUnit;
                                    }

                                    return text
                                })
                                .style("font-size", fontSize * 0.6 + "px")
                                .style("fill", "#333")
                                .style("font-weight", "600");
                        }
                    }
                }
            }
            var container1 = containerValueToPoint(data[0].data, 0);
            var container2 = containerValueToPoint(data[0].data, 0.55);
            var containerWidth = parseInt(config.size / 100) < 3 ? 3 : parseInt(config.size / 100);
            var pointerContainer = wrap.append("g:line")
                .attr("class", "pointerContainer")
                .attr("x1", container1.x)
                .attr("y1", container1.y)
                .attr("x2", container2.x)
                .attr("y2", container2.y)
                .style("stroke", "#000000")
                .style("stroke-width", containerWidth + 'px')
                .style("fill-opacity", 0.7)

            wrap.append("g:circle")
                .attr("cx", 0)
                .attr("cy", 0)
                .attr("r", 0.03 * config.size)
                .style("fill", "#000000")
                .style("stroke", "#000000")
                .style("opacity", 1);
            wrap.append("g:circle")
                .attr("cx", 0)
                .attr("cy", 0)
                .attr("r", 0.02 * config.size)
                .style("fill", "#d9d9d9")
                .style("stroke", "#d9d9d9")
                .style("opacity", 1);




            function valueToDegrees(value) {
                return value / 140 * 270 - 45;
            }

            function valueToRadians(value) {
                return valueToDegrees(value) * Math.PI / 180;
            }

            function valueToPoint(value, factor) {
                return {
                    x: config.cx - config.radius * factor * Math.cos(valueToRadians(value)),
                    y: config.cy - config.radius * factor * Math.sin(valueToRadians(value))
                };
            }

            function containerVsalueToDegrees(value) {
                return value / config.range * 270 - (config.min / config.range * 270 + 45);
            }

            function containerValueToRadians(value) {
                return containerVsalueToDegrees(value) * Math.PI / 180;
            }

            function containerValueToPoint(value, factor) {
                return {
                    x: config.cx - config.radius * factor * Math.cos(containerValueToRadians(value)),
                    y: config.cy - config.radius * factor * Math.sin(containerValueToRadians(value))
                };
            }

        })
    }

    return model
}
export default Dashboard