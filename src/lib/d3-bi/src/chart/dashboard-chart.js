import * as d3 from 'd3'

import core from '../core'
import utils from '../utils'

import ChartUtils from './models/chart-utils'
import Legend from './models/legend'
import Pie from './models/pie'
import Dashboard from './models/dashboard'

// import Pie from './models/pie.js'

var dashboardChart = function() {
    var duration = 500,
        margin = { top: 20, right: 15, bottom: 15, left: 15 },
        colors = [
            "#ff931e", "#01c9fe", "#82e237", "#d62728", "#9467bd",
            "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"
        ],
        dashTitle = function(d) { return d.data },
        dashTitleUnit = 'days',
        isLegendAvailable = true;


        
    chart.chartName = 'dashboard-chart';
    chart.pie = Pie.call(chart);
    chart.dashboard = Dashboard.call(chart);
    chart.legend = Legend.call(chart);
    chart.legendDispatch = d3.dispatch('click');
    chart.legendDispatch.on('click', null);

    function chart(selections) {
        selections.each(function(data) {
            var hContainer = d3.select(this);
            var dPieData = data.dPieData,
                dDashboardData = data.dDashboardData;

            ChartUtils.initContainer(hContainer, { chartName: chart.chartName });

            chart.width = parseInt(hContainer.attr('width'));
            chart.height = parseInt(hContainer.attr('height'));
            if (!dPieData) {
                ChartUtils.buildNoDataChart(hContainer);
                return;
            }
            chart.colors = colors;
            //build legend  
            if (isLegendAvailable) {
                dPieData.forEach(function(d, i) {
                    d.name = d.label;
                    d.color = colors[i];
                    var values = {
                        value: d.value,
                        label: d.label
                    }
                    d.values = values;
                })
                hContainer.iappend('g.legend-groups')
                    .datum(dPieData)
                    .call(chart.legend);
                var legendWidth = hContainer.select('g.legend-groups').node().getBBox().width;
                var legendHeight = hContainer.select('g.legend-groups').node().getBBox().height;
                hContainer.select('g.legend-groups').attr('transform', 'translate(' + (chart.width / 2 - legendWidth / 2) + ',' + (chart.height - legendHeight - 5) + ')')
            };
            //build dashboard   

            // chart.legendHeight = chart.legend.getSpace(hContainer.select('g.dashboard-group')).height;
            chart.availableHeight = chart.height - margin.top - margin.bottom;
            chart.availableWidth = chart.width;
            chart.config = {
                size: Math.min(chart.availableHeight, chart.availableWidth),
                min: 0,
                max: 140
            };
            chart.dashTitle = dashTitle;
            chart.dashTitleUnit = dashTitleUnit;
            var dashboardGroup = hContainer.iappend('g.dashboard-group');
            var dashboard = dashboardGroup.iappend('g.dashboard').datum([dDashboardData]).call(chart.dashboard);

            //build pie
            chart.startAngle = (function(d) { return d.startAngle / 4 * 3 - Math.PI / 4 * 3 });
            chart.endAngle = (function(d) { return d.endAngle / 4 * 3 - Math.PI / 4 * 3 });
            chart.donut = true;
            chart.donutRadius = 0.8;
            chart.pieHeight = chart.availableHeight;
            chart.pieWidth = chart.availableWidth;
            chart.radius = Math.min(chart.availableHeight, chart.availableWidth) / 2 * 0.7
            var pie = dashboardGroup.iappend('g.pie').datum([dPieData]).call(chart.pie);

        });
    }
    chart.duration = function(v) {
        if (!arguments.length) return duration;
        duration = +v;
        return chart;
    };
    chart.margin = function(v) {
        if (!arguments.length) return margin;
        margin.top = v.top !== undefined ? +v.top : margin.top;
        margin.right = v.right !== undefined ? +v.right : margin.right;
        margin.bottom = v.bottom !== undefined ? +v.bottom : margin.bottom;
        margin.left = v.left !== undefined ? +v.left : margin.left;
        return chart;
    };
    chart.colors = function(v) {
        if (!arguments.length) return colors;
        colors = v;
        return chart;
    };
    chart.dashTitle = function(v) {
        if (!arguments.length) return dashTitle;
        dashTitle = v;
        return chart;
    };
    chart.dashTitleUnit = function(v) {
        if (!arguments.length) return dashTitleUnit;
        dashTitleUnit = v;
        return chart;
    };
    chart.config = function(v) {
        if (!arguments.length) return config;
        config = v;
        return chart;
    };
    chart.isLegendAvailable = function(v) {
        if (!arguments.length) return isLegendAvailable;
        isLegendAvailable = v;
        return chart;
    };
    return chart;
};

export default dashboardChart