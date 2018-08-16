import Datepicker from "@/components/leap-datepicker/Datepicker.vue"
import DatetimeUtils from "@/utils/datetime-utils.js"
import Internationalization from '@/utils/internationalization.js'

import * as d3 from 'd3'
import { baseChart as d3BI_baseChart, draggedRuler as d3BI_draggedRuler } from '@/lib/d3-bi/index.js'

export default {
    name: 'attribute-date',
    props: ['attrData'],
    components: {
        Datepicker
    },
    data() {
        return {
            chartData: null,
            endDateDisable: {
                to: null,
                from: null
            },
            startDateDisable: {
                to: null, //disable before date
                from: null //disable after date
            },
            initialDisableRange: {
                to: null,
                from: null
            },
            selectedCasesPercent: null
        }
    },
    computed: {
        rangeDate: function() {

            if (this.$props.attrData) {
                return this.$props.attrData.selectedDate;
            }

        }

    },
    created() {
        this.fnCreated();
    },
    mounted() {
        this.fnMounted();
    },
    watch: {
        rangeDate: {
            handler: function(latest, old) {

                let range = latest;

                if (range.start && range.end) {

                    this.calculateSelectedCases(range);

                    this.startDateDisable.to = new Date(this.initialDisableRange.to);
                    this.startDateDisable.from = new Date(range.end);

                    this.endDateDisable.to = new Date(range.start);
                    this.endDateDisable.from = new Date(this.initialDisableRange.from);

                    this.updateChart();

                }


            },
            deep: true
        },
        'attrData.field': {
            handler: function(newData, oldData) {
                this.fnCreated();
                this.fnMounted();
            },
            deep: true
        }
    },
    methods: {
        fnCreated() {

            this.chartData = this.setChartData();
            
            this.sorting();
    
            this.lineData = null;
            this.totalLineParts = 0;
            this.extentLineX = null;
            this.extentLineY = null;
            this.selectedLineLeft = 0;
            this.selectedLineRight = 0;
    
            this.lineChart = null;
            this.draggedRuler = null;
    
            this.hLineChart = null;
            this.hDraggedRuler = null;
    
            window.addEventListener('resize', this.windowResize);

        },
        fnMounted() {
            
            this.initChart();
            
            this.hLineChart = d3.select(this.$refs.lineChart);
            this.hDraggedRuler = d3.select(this.$refs.draggerLine);
    
            this.drawChart();
    
            if (this.$props.attrData.selectedDate.start && this.$props.attrData.selectedDate.end) {
    
                this.updateChart();
                this.calculateSelectedCases(this.rangeDate);
    
            }

        },
        setChartData() {

            if (this.$props.attrData) {
                
                let arr = [],
                    minTime = Infinity,
                    maxTime = 0,
                    lisOfDate = []; //timestamp milliseconds (epoch format)

                if (this.$props.attrData.value.length > 0) {

                    this.$props.attrData.value.find(data => {

                        let obj = {
                            caseCount: null,
                            time: null
                        };

                        //convert to UTC 00:00:00
                        let midnightUTCDate = new Date(parseInt(data['attributeValue'])).setUTCHours(0,0,0,0);
                        let frequency = parseInt(data['frequency']);

                        obj.time = new Date(midnightUTCDate);
                        obj.caseCount = frequency;

                        //check duplicate date
                        let status = lisOfDate.includes(obj.time.getTime());
                                
                        if(status) {
                            
                            //if duplicate, make a cumulutive frequency for that date
                            arr.find(objData => {
                                
                                if(obj.time.getTime() == objData.time.getTime()) {

                                    objData.caseCount += obj.caseCount;

                                }
                            
                            });

                        } else {

                            lisOfDate.push(obj.time.getTime());
                            arr.push(obj);

                        }
                            
                    });

                }

                minTime = Math.min(...lisOfDate);
                maxTime = Math.max(...lisOfDate);
            
                for (let t = minTime; t <= maxTime; t = t + 24 * 3600000) {
                    
                    let isFound = lisOfDate.includes(t);

                    if(!isFound) {
                        //add new date that not exist in the rangeDate
                        arr.push({
                            time: new Date(t),
                            caseCount: 0
                        });

                    } 

                }

                return arr;
                
            }

        },
        sorting() {
            // min to max date

            this.chartData.sort((a, b) => {
                return new Date(a.time) - new Date(b.time);
            });

            this.initialDisableRange = {
                to: this.chartData[0].time,
                from: this.chartData[this.chartData.length - 1].time
            }

            this.startDateDisable = Object.assign({}, this.initialDisableRange);
            this.endDateDisable = Object.assign({}, this.initialDisableRange);

            //default range date when start as default/ don't have data from BE
            if (!this.$props.attrData.selectedDate.start && !this.$props.attrData.selectedDate.end) {

                let defaultRange = Object.assign({}, this.initialDisableRange);

                this.rangeDate.start = DatetimeUtils.getFullDate(defaultRange.to, 'yyyy-MM-dd'),
                this.rangeDate.end = DatetimeUtils.getFullDate(defaultRange.from, 'yyyy-MM-dd');

            }

        },
        initChart() {

            let vm = this;

            this.lineChart = d3BI_baseChart();
            this.draggedRuler = d3BI_draggedRuler();

            this.lineChart.duration(0).margin({
                top: 10,
                right: 45,
                bottom: 0,
                left: 0
            });

            this.lineChart.legend.visibility(false);

            this.lineChart.yAxis.title(Internationalization.translate('Number of cases')).domainToZero(true).packetAxis((hC) => {
                if (this.lineChart.hasOwnProperty('yAxisPosition')) {
                    let axisPosition = this.lineChart.yAxisPosition;
                    hC.attr('transform', 'translate(' + axisPosition.x + ',' + (axisPosition.y - 5) + ')');
                }
            });

            this.lineChart.xAxis.scale(d3.scaleLinear()).axisVisibility(false);
            this.lineChart.line.curve(d3.curveMonotoneX);
            this.lineChart.lineTooltip.type('line');

            this.draggedRuler.dispatch.on('dragging', function(per, type) {

                if (type == 'pre') {

                    vm.lineData[1].values[0].label = (vm.extentLineX[vm.extentLineX.length - 1] - vm.extentLineX[0]) * per + vm.extentLineX[0];

                    let newDate = new Date();
                    newDate.setTime(vm.lineData[1].values[0].label);

                    let rdate = new Date(newDate.toJSON());
                    vm.rangeDate.start = DatetimeUtils.getFullDate(rdate, 'yyyy-MM-dd');

                } else {

                    vm.lineData[1].values[1].label = (vm.extentLineX[vm.extentLineX.length - 1] - vm.extentLineX[0]) * per + vm.extentLineX[0];

                    let newDate = new Date();
                    newDate.setTime(vm.lineData[1].values[1].label);

                    let rdate = new Date(newDate.toJSON());
                    vm.rangeDate.end = DatetimeUtils.getFullDate(rdate, 'yyyy-MM-dd');

                }

            });

            this.draggedRuler.dispatch.on('drag-end', function(per, type) {

                if (type == 'pre') {

                    let nDate = (vm.extentLineX[vm.extentLineX.length - 1] - vm.extentLineX[0]) * per + vm.extentLineX[0],
                        dDate = new Date(nDate);
            
                    // vm.lineData[1].values[0].label = new Date(dDate.getFullYear(), dDate.getMonth(), dDate.getDate()).getTime();
                    vm.lineData[1].values[0].label = Date.UTC(dDate.getFullYear(), dDate.getMonth(), dDate.getDate());
                    
                    let rdate = new Date(vm.lineData[1].values[0].label);
                    vm.rangeDate.start = DatetimeUtils.getFullDate(rdate, 'yyyy-MM-dd');;

                } else {

                    let nDate = (vm.extentLineX[vm.extentLineX.length - 1] - vm.extentLineX[0]) * per + vm.extentLineX[0],
                        dDate = new Date(nDate);

                    // vm.lineData[1].values[1].label = new Date(dDate.getFullYear(), dDate.getMonth(), dDate.getDate()).getTime();
                    vm.lineData[1].values[1].label = Date.UTC(dDate.getFullYear(), dDate.getMonth(), dDate.getDate());
                    
                    let rdate = new Date(vm.lineData[1].values[1].label);
                    vm.rangeDate.end = DatetimeUtils.getFullDate(rdate, 'yyyy-MM-dd');;

                }

            });

        },
        drawChart() {

            let vm = this;

            this.lineData = getLineData();
            
            this.totalLineParts = this.lineData[0].values.length - 1;

            this.extentLineX = d3.extent(this.lineData[0].values.map(function(d) {
                return d.label
            }));

            this.extentLineY = d3.extent(this.lineData[0].values.map(function(d) {
                return d.value
            }));

            this.lineData[1].values = [{
                label: this.extentLineX[0],
                value: this.extentLineY[1]
            }, {
                label: this.extentLineX[0],
                value: this.extentLineY[1]
            }];

            this.hLineChart.iappend('svg').datum(this.lineData).call(this.lineChart);

            this.draggedRuler
                .distance({
                    left: this.lineChart.xAxisPosition.x,
                    right: this.lineChart.width - (this.lineChart.xAxisPosition.x + this.lineChart.xAxisWidth)
                })
                .sitePercentage({
                    pre: this.selectedLineLeft / (vm.extentLineX[vm.extentLineX.length - 1] - vm.extentLineX[0]),
                    lat: this.selectedLineRight / (vm.extentLineX[vm.extentLineX.length - 1] - vm.extentLineX[0])
                });

            this.hDraggedRuler.iappend('svg').call(this.draggedRuler);

            function getLineData() {

                let bgValues = [],
                    selectedValues = [];

                let selectedDate = vm.chartData;

                selectedDate.forEach((d, i) => {

                    if (i > 0) {

                        var sTime = Date.parse(new Date(selectedDate[i - 1].time)) + 24 * 3600000;
                        var eTime = Date.parse(new Date(selectedDate[i].time));
                        if (sTime < eTime) {
                          var listZeroBefore = {};
                          listZeroBefore.label = Date.parse(new Date(selectedDate[i - 1].time)) + 24 * 3600000;
                          listZeroBefore.value = 0;
                          var listZeroAfter = {};
                          listZeroAfter.label = Date.parse(new Date(selectedDate[i].time)) - 24 * 3600000;
                          listZeroAfter.value = 0;
                          bgValues.push(listZeroBefore);
                          bgValues.push(listZeroAfter);
                        }

                    }

                    let list = {};
                    list.label = Date.parse(new Date(d.time));
                    list.value = d.caseCount;
                    bgValues.push(list);

                });

                return [{
                    type: 'line',
                    name: 'bg area',
                    area: true,
                    color: '#5F6B6D',
                    label: {
                        x: 'bg x',
                        y: 'bg y',
                        name: 'name'
                    },
                    values: bgValues
                }, {
                    type: 'line',
                    name: 'selected area',
                    area: true,
                    color: '#01B8AA',
                    label: {
                        x: 'selected x',
                        y: 'selected y',
                        name: 'name'
                    },
                    values: []
                }];
            }

        },
        updateChart() {

            let vm = this;

            if (this.extentLineY != null) {

                this.lineData[1].values = [{
                    label: Date.parse(new Date(vm.rangeDate.start)),
                    value: this.extentLineY[1]
                }, {
                    label: Date.parse(new Date(vm.rangeDate.end)),
                    value: this.extentLineY[1]
                }];

                this.lineChart.tooltip.setContent(function(d) {

                    let rdate = new Date(vm.rangeDate.start),
                        endDate = new Date(vm.rangeDate.end),
                        str = null;

                    if (Date.parse(rdate) < d.x && Date.parse(endDate) > d.x) {

                        let dTimeTip = new Date(d.x),
                            count = d.yValues[0].data.y,
                            timeTip = DatetimeUtils.getFullDate(dTimeTip, 'yyyy-MM-dd');

                        str = `<tr>
                                    <td>Case Count :</td>
                                    <td>${count}</td>
                                </tr>
                                <tr>
                                    <td >Date :</td>
                                    <td>${timeTip}</td>
                                </tr>`;

                    } else if(Date.parse(rdate) == d.x || Date.parse(endDate) == d.x) {
                        
                        let  count = null;

                        vm.chartData.find( obj => {


                            let data = new Date(obj.time).getTime(); 
                            
                            if(data == d.x) {
                                count = obj.caseCount;
                            }


                        });

                        let dTimeTip = new Date(d.x),
                            timeTip = DatetimeUtils.getFullDate(dTimeTip, 'yyyy-MM-dd');

                        if (count != null) {

                            str = ` <tr>
                                        <td >Case Count : </td>
                                        <td>${count}</td>
                                    </tr>
                                    <tr>
                                        <td >Date : </td>
                                        <td>${timeTip}</td>
                                    </tr>`;
                       
                        } else {

                            str = ` <tr>
                                        <td >Date : </td>
                                        <td>${timeTip}</td>
                                    </tr>`;

                        }

                    } else {

                        str = `<tr><span> Out Of Date Range <span><tr>`;

                    }

                    return `<table>${str}</table>`;

                });

                this.hLineChart.iappend('svg').datum(this.lineData).call(this.lineChart);

                this.draggedRuler
                    .sitePercentage({
                        pre: (Date.parse(new Date(vm.rangeDate.start)) - vm.extentLineX[0]) / (vm.extentLineX[vm.extentLineX.length - 1] - vm.extentLineX[0]),
                        lat: (Date.parse(new Date(vm.rangeDate.end)) - vm.extentLineX[0]) / (vm.extentLineX[vm.extentLineX.length - 1] - vm.extentLineX[0])
                    });

                this.hDraggedRuler.iappend('svg').call(this.draggedRuler);

            }

        },
        calculateSelectedCases(range) {

            let currentSelectedDiff,
                leftDiff,
                rightDiff;

            // |----------0______________________0-----------|
            //   leftDiff    currentSelectedDiff    rightDiff

            let currentSelectedDiff_start = new Date(range.start),
                currentSelectedDiff_end = new Date(range.end);

            currentSelectedDiff = Math.ceil(Math.abs(currentSelectedDiff_end.getTime() - currentSelectedDiff_start.getTime()) / (1000 * 3600 * 24));

            let leftDiff_start = new Date(DatetimeUtils.getFullDate(this.initialDisableRange.to, 'yyyy-MM-dd')),
                leftDiff_end = new Date(range.start);

            leftDiff = Math.ceil(Math.abs(leftDiff_end.getTime() - leftDiff_start.getTime()) / (1000 * 3600 * 24));

            let rightDiff_start = new Date(range.end),
                rightDiff_end = new Date(DatetimeUtils.getFullDate(this.initialDisableRange.from, 'yyyy-MM-dd'));

            rightDiff = Math.ceil(Math.abs(rightDiff_end.getTime() - rightDiff_start.getTime()) / (1000 * 3600 * 24));

            this.selectedCasesPercent = `${( (currentSelectedDiff * 100) / (currentSelectedDiff + (leftDiff + rightDiff)) ).toFixed(2)}%`;

        },
        windowResize() {
            this.drawChart();
            this.updateChart();
        }
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.windowResize);
    }
}