import { select as d3Select } from 'd3-selection'
import { baseChart as d3BI_baseChart } from '@/lib/d3-bi/index.js'
import CommonUtils from '@/utils/common-utils.js'
import Internationalization from '@/utils/internationalization.js'

import sharedAttribute from "../../attribute-innerEvents";
let attributeInnerEvents = sharedAttribute.attributeInnerEvents;

export default {
    name: 'attribute-chart',
    props: ['attrData', 'config'],
    data() {
        return {
            element: null,
            svgContainer: null,
            barChart: null,
            colors: {
                true: '#00C9FF',
                false: '#C7CBD5'
            },
            displayChartData: null,
            totalItemPerPage: 20,
            start: 0,
            end: 20
        }
    },
    computed: {
        styles: function() {
            return this.$props.config;
        },
        barAxisTitle: function() {

            if (this.$props.attrData) {

                return {
                    x: (this.$props.attrData.fieldType == 'number') ? Internationalization.translate('Division') : this.$props.attrData.fieldLabel,
                    y: Internationalization.translate('Relative Frequency') + ' %'
                }

            } else {
                return {};
            }

        },
        chartData: function() {

            if (this.$props.attrData.value) {

                let arr = [];

                if (this.$props.attrData.value.length > 0) {

                    this.$props.attrData.value.find((val, index) => {

                        arr.push({
                            label: (val.attributeValue) ? val.attributeValue : '-',
                            value: (val.relativeFrequency) ? this.fnGetConvertedValue(val.relativeFrequency) : 0,
                            frequency: (val.frequency) ? val.frequency : 0,
                            index: index,
                            selected: val.selected
                        });
                        
                    });

                }

                return arr;
            }

        }
    },
    created() {

        attributeInnerEvents.$on('attribute-selected', this.updateChart);
        attributeInnerEvents.$on('change-pagination', this.updateDisplayChartData);
        window.addEventListener('resize', this.windowResize);

    },
    mounted() {

        setTimeout(() => {
            this.init();
        });

    },
    watch: {
        chartData: {
            handler(data, oldData) {
                //when data selected is changed
                this.displayChartData = this.chartData;
                this.displayChartData = this.displayChartData.slice(this.start, this.end);
            },
            deep: true
        },
        'attrData.field': {
            handler(data, oldData) {
                setTimeout(() => {
                    this.init();
                });
            },
            deep: true
        },
        'attrData.value.length': {
            handler(data, oldData) {

                if (data != oldData) {
                    setTimeout(() => {
                        this.init();
                    });
                }

            },
            deep: true
        }
    },
    methods: {
        setSvg() {

            this.element = this.$el;

            this.svgContainer = {
                height: this.element.clientHeight,
                width: this.element.clientWidth,
            }

            this.svg = d3Select(this.element)
                .attr("width", `${this.svgContainer.width}px`)
                .attr("height", `${this.svgContainer.height}px`)
                .classed("attribute-chart", true);

        },
        removeSvg() {
            d3Select(this.element).selectAll("*").remove();
        },
        create() {

            let vm = this;

            vm.barChart = d3BI_baseChart('bar')
                .x(function(d) {
                    return d.label
                })
                .y(function(d) {
                    return d.value
                })
                .margin({
                    top: 20,
                    right: 20,
                    left: 25,
                    bottom: 20
                });

            vm.barChart.bar.fnColorWrapper(vm.getColorCode);
            vm.barChart.axisLines.showAll({
                x: true,
                y: false
            });

            vm.barChart.axisLines.pattern({
                x: true,
                y: true
            });

            vm.barChart.yAxis.givenDomain(this.transformDomain);
            vm.barChart.yAxis.title(this.barAxisTitle.y);
            vm.barChart.xAxis.title(this.barAxisTitle.x);
            //.textRotate(-30).maxTextLength(10).titleDistance(5);
            vm.barChart.yAxis.axis().ticks(5);

            vm.setTooltip();

            vm.svg.append('svg')
                .datum([{
                    values: vm.displayChartData
                }])
                .call(vm.barChart);

        },
        getColorCode(h, d, config) {
            return (d.data.selected) ? this.colors.true : this.colors.false;
        },
        transformDomain(domain) {

            let max = 0;

            this.displayChartData.find( data => {

                let val = parseFloat(data.value);
                
                if(val > max) {
                    max = val;
                }

            });

            domain[1] = (max > 80) ? 100 : 1.0 * max;

            if (domain[0] > 0) domain[0] = 0;
            
            return domain;

        },
        setTooltip() {

            let vm = this;

            vm.barChart.tooltip.privateClass('df-attribute-chart-tooltip');
            vm.barChart.tooltipDispatch.on('click.active', function(args, ele, config) {
                vm.onSelectBar(args.data);
            });

            vm.barChart.tooltip.setContent(function(args) {

                let str = '',
                    xValue = args.yValues[0].data.x,
                    yValue = args.yValues[0].data.y,
                    arrValues = args.yValues[0].config.values,
                    selectedBar = null;

                arrValues.find(value => {
                    if (value.label == xValue) {
                        selectedBar = value;
                    }
                });

                let fieldType = vm.$props.attrData.fieldType;

                switch (fieldType) {
                    case 'number':
                        str = `<h6 class="title">${vm.barAxisTitle.x}: ${xValue}</h6>
                                <p>
                                    <span class="data">${Internationalization.translate('Number of Cases')}: </span>
                                    <span class="value">${selectedBar.frequency}</span>
                                </p>
                                <p>
                                    <span class="data">${Internationalization.translate('Relative Frequency')}: </span>
                                    <span class="value">${ yValue } %</span>
                                </p>`
                        break;

                    case 'caseId':
                        str = `<h6 class="title">${Internationalization.translate('Case ID')}: ${xValue}</h6>
                                <p>
                                    <span class="data">${Internationalization.translate('Frequency')}: </span>
                                    <span class="value">${selectedBar.frequency}</span>
                                </p>
                                <p>
                                    <span class="data">${Internationalization.translate('Relative Frequency')}: </span>
                                    <span class="value">${ yValue } %</span>
                                </p>`
                        break;

                    default:
                        str = `<h6 class="title">${xValue}</h6>
                                <p>
                                    <span class="data">${Internationalization.translate('Frequency')}: </span>
                                    <span class="value">${selectedBar.frequency}</span>
                                </p>
                                <p>
                                    <span class="data">${Internationalization.translate('Relative Frequency')}: </span>
                                    <span class="value">${ yValue } %</span>
                                </p>`
                        break;
                }

                return `<div class="attribute-hover-box">${str}</div>`;
            });

        },
        fnGetConvertedValue(val) {
            let convertedVal = val * 100;

            return (convertedVal > 0) ? `${convertedVal.toFixed(2)}` : '0';
        },
        onSelectBar(selectedBar) {

            let data = this.$props.attrData,
                index = selectedBar.index;

            data.value[index].selected = (data.value[index].selected) ? false : true;

            this.updateChart();

        },
        updateChart() {

            let vm = this;

            setTimeout(() => {

                vm.barChart.bar.fnColorWrapper(vm.getColorCode);

                vm.svg.select('svg')
                    .datum([{
                        values: vm.displayChartData
                    }])
                    .call(vm.barChart);
            });

        },
        updateDisplayChartData(pagination) {

            setTimeout(() => {

                this.start = pagination.start;
                this.end = pagination.end;

                if (this.chartData) {
                    if (this.chartData.length > 0) {
                        this.displayChartData = this.chartData;
                        this.displayChartData = this.displayChartData.slice(this.start, this.end);
                        this.updateChart();
                    }
                }

            });

        },
        init() {

            if (this.svg) {
                this.removeSvg();
            }

            this.setSvg();
            this.create();
        },
        windowResize() {
            this.init();
        }
    },
    beforeDestroy() {

        attributeInnerEvents.$off('attribute-selected', this.updateChart);
        attributeInnerEvents.$off('change-pagination', this.updateDisplayChartData);
        window.removeEventListener('resize', this.windowResize);

    }
}