 import * as d3 from 'd3'
 import * as d3BI from '@/lib/d3-bi/index.js'
 import LEAPSelect from '@/components/leap-select/LEAPSelect'
 import SVG from 'svg.js'
 import shared from "@/shared.js"
 import typeChecker from '@/utils/type-checker.js'
 import DeepClone from '@/utils/common-utils.js'
 import DynamicFilterApi from '@/api/process-mining.js'


 let eventHub = shared.eventHub

 export default {
   name: "cycle-time-kpi",
   props: {
     conf: {
       type: Object,
       required: true
     },
     tileId: {
       type: String,
       required: true
     }
   },
   data() {
     return {
       processSelection: [{
         name: "Overall Cycle Time",
         value: "Overall Cycle Time"
       }, {
         name: "Cycle Time Breakdown & Comparison_Activities",
         value: "Cycle Time Breakdown & Comparison_Activities"
       }, {
         name: "Cycle Time Breakdown & Comparison_Connections",
         value: "Cycle Time Breakdown & Comparison_Connections"
       }, {
         name: "Time Consuming Activities",
         value: "Time Consuming Activities"
       }],
       showOverallCycleTimeChart: true,
       showTimeBreakdownChart: false,
       showTimeConsumingChart: false,
       showTimeBreakdownActiveChart: false,
       showTimeConsumingChange: false,
       selected: 'Overall Cycle Time',
       timeConsumingButtons: [],
       timeBreakdownButtons: [],
       timeBreakdActiveButton: [],
       timeConsumingactiveButton: {},
       timeBreakdConnButton: {},
       timeBreakConnUnits: 'Seconds',
       timeBreakActUnits: 'Seconds',
       timeConsumingActUnits: 'Seconds'
     }
   },
   watch: {
     conf: {
       handler(data, oldData) {
         this.filterChange(data.data);
       },
       deep: true
     }
   },
   methods: {
     fnSelected(args) {
       eventHub.$emit("showChartIcon", {
         chartIcon: true
       });

       //14 Feb 2018: adib.ghazali@hpe.com - refactor LEAP Select for emit data
       this.selected = args.value;
       
       var vm = this;
       if (this.selected == this.processSelection[0].name) {
         this.showOverallCycleTimeChart = true;
         this.showTimeBreakdownChart = false;
         this.showTimeConsumingChart = false;
         this.showTimeConsumingChange = false;
         this.showTimeBreakdownActiveChart = false;
         this.initOverallCycleTimeChart();
         setTimeout(function() {
           vm.updateChart(vm.horizontalBar, vm.getOCTData());
         }, 100)
       } else if (this.selected == this.processSelection[1].name) {
         this.showOverallCycleTimeChart = false;
         this.showTimeBreakdownChart = false;
         this.showTimeConsumingChart = false;
         this.showTimeConsumingChange = false;
         this.showTimeBreakdownActiveChart = true;
         this.initTimeBreakdownActiveChart();
         setTimeout(function() {
           vm.updateChart(vm.ActiveLine, vm.getCTBAData());
         }, 100)
       } else if (this.selected == this.processSelection[2].name) {
         this.showOverallCycleTimeChart = false;
         this.showTimeBreakdownChart = true;
         this.showTimeConsumingChart = false;
         this.showTimeConsumingChange = false;
         this.showTimeBreakdownActiveChart = false;
         this.initTimeBreakdownChart();
         setTimeout(function() {
           vm.updateChart(vm.line, vm.getCTBCData());
         }, 100)
       } else if (this.selected == this.processSelection[3].name) {
         this.showOverallCycleTimeChart = false;
         this.showTimeBreakdownChart = false;
         this.showTimeConsumingChart = true;
         this.showTimeConsumingChange = false;
         this.showTimeBreakdownActiveChart = false;
         this.initTimeConsumingChart();
         setTimeout(function() {
           vm.updateChart(vm.stackBar, vm.getCAData());
         }, 100)
       }
     },
     // init chart 
     initOverallCycleTimeChart() {
       let vm = this;
       this.hContainer = d3.select('#overallCycleTimeChart');
       this.horizontalBar = d3BI.baseChart('horizontalBar');
       // personal settings
       this.horizontalBar
         .x(function(d) { return d.value })
         .y(function(d) { return d.label })
         .margin({ top: 0, right: 15, bottom: 0, left: 0 });
       this.horizontalBar.xAxis
         .givenDomain(function(domain) {
           return [0, 85];
         });
       this.horizontalBar.yAxis.axis().ticks(5);
       this.horizontalBar.xAxis.axis().tickValues([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85]);
       this.horizontalBar.horizontalBar
         .showText(true)
         .fnTextWrapper(function(a, b, c) {});
       this.horizontalBar.tooltipDispatch.on('build', null);
       this.horizontalBar.tooltipDispatch.on('setPosition', null);
       this.horizontalBar.tooltipDispatch.on('remove', null);

     },
     initTimeBreakdownChart() {
       let vm = this;
       this.hContainer = d3.select('#timeBreakdownChart');
       this.line = d3BI.baseChart();
       // personal settings

       this.line
         .x(function(d) { return d.x })
         .y(function(d) { return d.y })
         .margin({ top: 10, right: 15, bottom: 0, left: 0 });

       this.line.lineTooltip.type('line');
       this.line.yAxis.axis()
         .ticks(5);
       this.line.xAxis.packetAxis(packetAxis);
       this.line.xAxis
         .packetAxis(packetAxis);
       this.line.yAxis.domainToZero(true);
       this.line.tooltip.styleType('base');
       var textArray = [];
       var maxTextLength = 10;
       if (vm.CTBCData != null) {
         maxTextLength = vm.CTBCData.length > 3 ? 10 : 25;
         vm.CTBCData.forEach(function(d) {
           var array = [d.connection.sourceLabel, '>', d.connection.targetLabel];
           textArray.push(array);
         })
       }

       this.line.tooltip.setContent(function(args) {
         var from = null,
           to = null,
           duration = null,
           benchmarkDuration = null;
         args.yValues.forEach(function(d) {
           d.config.values.forEach(function(r) {
             if (r.x == args.x && r.duration != null) {
               var dUnit = vm.setUnit(r.duration),
                 dUnitCount = vm.setUnitCount(dUnit);
               duration = (r.duration / dUnitCount).toFixed(1) + ' ' + dUnit;
             }
           })
         })
         args.yValues.forEach(function(d) {
           d.config.values.forEach(function(r) {
             if (r.x == args.x && r.benchmarkDuration != null) {
               var dUnit = vm.setUnit(r.benchmarkDuration),
                 dUnitCount = vm.setUnitCount(dUnit);
               benchmarkDuration = (r.benchmarkDuration / dUnitCount).toFixed(1) + ' ' + dUnit;;
             }
           })
         });
         args.yValues[0].config.values.forEach(function(d) {
           if (d.x == args.x) {
             from = d.from;
             to = d.to;
           }
         })
         var strDuration = duration ? ('<tr><td td class = "content">Actual Duration : </td><td>' + duration + '</td></tr>') : '';
         var strBenchDuration = benchmarkDuration ? '<tr><td td class = "content">Benchmark Duration : </td><td>' + benchmarkDuration + '</td></tr>' : '';
         var str =
           '<table>' +
           '<tr >' + '<td class = "content">' + 'From : ' + '</td>' + '<td >' + from + '</td>' + '</tr>' +
           '<tr >' + '<td class = "content">' + 'To : ' + '</td>' + '<td >' + to + '</td>' + '</tr>' +
           strDuration + strBenchDuration + '</table>'

         return '<div class="cycle-time-kpi-pop">' + str + '</div>';
       });


       function packetAxis(hAxis) {
         hAxis.selectAll('.tick').each(function(d, index) {
           vm.line.xAxis
             .wrapper
             .fromToWrapper(d3.select(this), textArray[index], { maxTextLength: maxTextLength });
         });
       };


     },
     initTimeBreakdownActiveChart() {
       let vm = this;
       this.hContainer = d3.select('#timeBreakdownActiveChart');
       this.ActiveLine = d3BI.baseChart();
       // personal settings

       this.ActiveLine
         .x(function(d) { return d.x })
         .y(function(d) { return d.y })
         .margin({ top: 10, right: 15, bottom: 0, left: 0 });

       this.ActiveLine.lineTooltip.type('line');
       this.ActiveLine.yAxis.axis()
         .ticks(5);
       this.ActiveLine.yAxis.domainToZero(true);
       this.ActiveLine.tooltip.styleType('base');
       var maxTextLength = 10;

       this.ActiveLine.tooltip.setContent(function(args, i) {
         var name = args.x,
           duration, benchmarkDuration;
         args.yValues.forEach(function(d) {
           d.config.values.forEach(function(r) {
             if (r.x == args.x && r.duration != null) {
               var dUnit = vm.setUnit(r.duration),
                 dUnitCount = vm.setUnitCount(dUnit);

               duration = (r.duration / dUnitCount).toFixed(1) + ' ' + dUnit;
             }
           })
         })
         args.yValues.forEach(function(d) {
           d.config.values.forEach(function(r) {
             if (r.x == args.x && r.benchmarkDuration != null) {
               var dUnit = vm.setUnit(r.benchmarkDuration),
                 dUnitCount = vm.setUnitCount(dUnit);
               benchmarkDuration = (r.benchmarkDuration / dUnitCount).toFixed(1) + ' ' + dUnit;;
             }
           })
         })
         var strDuration = duration ? '<tr><td td class = "content">Actual Duration : </td><td>' + duration + '</td></tr>' : '';
         var strBenchDuration = benchmarkDuration ? '<tr><td td class = "content">Benchmark Duration : </td><td>' + benchmarkDuration + '</td></tr>' : '';
         var str =
           '<table>' +
           '<tr >' + '<td class = "content">' + 'Name : ' + '</td>' + '<td >' + args.x + '</td>' + '</tr>' +
           strDuration + strBenchDuration + '</table>';
         return '<div class="cycle-time-kpi-pop">' + str + '</div>';
       });
     },
     initTimeConsumingChart() {
       let vm = this;
       this.hContainer = d3.select('#timeConsumingChart');
       this.stackBar = d3BI.baseChart('stackBar');
       // personal settings
       this.stackBar
         .x(function(d) { return d.activityName })
         .y(function(d) { return d.activityTime })
         .margin({ top: 10, right: 15, bottom: 0, left: 0 });
       this.stackBar.stackBar.showText(true).buildTotalBar(true);
       this.stackBar.xAxis.maxTextLength(10);
       this.stackBar.yAxis.axis()
         .ticks(5);
       // this.stackBar.yAxis.domainToZero(true);
       this.stackBar.tooltipDispatch.on('click', function(d) {
         vm.$data.showTimeConsumingChange = true;
         vm.$data.showTimeConsumingChart = false;
         vm.initBarChart();
         setTimeout(function() {
           vm.updateChart(vm.bar, vm.getBarChartData(d.data._x));
         }, 100)

       });

       this.stackBar.tooltip.setContent(function(args) {
         var activityType = null,
           caseCount = null,
           activityCount = null,
           caseFrequency = null,
           absoluteFrequency = null;
         if (vm.CAData) {
           vm.CAData.forEach(function(d) {
             if (args.x == d.activityName) {
               activityType = d.activityType;
               caseCount = d.overallNumOfCase;
               activityCount = d.overallNumOfActivity;
               caseFrequency = (d.overallCaseFrequencyPercentage * 100).toFixed(2);
               absoluteFrequency = (d.overallActivityFrequencyPercentage * 100).toFixed(2);

             }
           })
         }
         var str =
           '<table>' +
           '<tr >' + '<td class = "content">' + 'Name : ' + '</td>' + '<td >' + args.x + '</td>' + '</tr>' +
           '<tr >' + '<td class = "content">' + 'Absolute Frequency : ' + '</td>' + '<td >' + activityCount + ' ( ' + absoluteFrequency + '% )' + '</td>' + '</tr>' +
           '<tr >' + '<td class = "content">' + 'Case Frequency : ' + '</td>' + '<td >' + caseCount + ' ( ' + caseFrequency + '% )'
         '</td>' + '</tr>' +
         '</table>'
         return '<div class="cycle-time-kpi-pop">' + str + '</div>';
       })
     },
     initBarChart() {
       let vm = this;
       this.hContainer = d3.select('#cycleBarChart');
       this.bar = d3BI.baseChart('bar');
       this.bar.yAxis.title('total %');
       this.bar
         .x(function(d) { return d.label })
         .y(function(d) { return d.value })
         .margin({ top: 10, right: 15, bottom: 0, left: 0 });
       this.bar.xAxis.maxTextLength(10);
       this.bar.yAxis.domainToZero(true);
       this.bar.yAxis.axis().ticks(5);
       this.bar.tooltip.setContent(function(args) {

         var percentage = (args.yValues[0].data.y).toFixed(2);
         var str =
           '<table>' +
           '<tr >' + '<td class = "content">' + 'Name : ' + '</td>' + '<td >' + args.x  +'</td>' + '</tr>' +
           '<tr >' + '<td class = "content">' + 'Percentage : ' + '</td>' + '<td >' + percentage + ' %' + '</td>' + '</tr>' +
           '</table>'
         return '<div class="cycle-time-kpi-pop">' + str + '</div>';
       })

     },
     //update data 
     updateChart(group, data) {
       let vm = this;
       if (group == this.line) {
         this.line.yAxis.title(this.timeBreakConnUnits);
       } else if (group == this.stackBar) {
         this.stackBar.yAxis.title(this.timeConsumingActUnits);
       } else if (group == this.ActiveLine) {
         this.ActiveLine.yAxis.title(this.timeBreakActUnits)
       }

       this.hContainer.style('height', getChartHeight());
       if (this.hContainer.select('svg').size()) {
         // update
         this.hContainer
           .select('svg')
           .datum(function(d) { return data ? data : d })
           .call(group);
       } else {
         // create
         this.hContainer
           .append('svg')
           .datum(data)
           .call(group);
       }
       if (group == this.horizontalBar) {
         var labelName = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, '...', '>100', '', '', '', 'Days'];
         this.hContainer.select('.xaxis-group').selectAll('g').select('text').text(function(d, i) {
           return labelName[i];
         })
         this.hContainer.selectAll('.horizontalBar-groups').selectAll('g').select('text').text(
           function(d, i) {
             var unit = vm.setUnit(vm.OCTData[i]);
             var count = (vm.OCTData[i] / vm.setUnitCount(unit)).toFixed(1);
             var str = count + ' ' + unit;
             return str;
           })
         this.hContainer.selectAll('.horizontalBar-groups').selectAll('g').select('text').attr(
           'transform', 'translate(' + 25 + ',' + 0 + ')');
       }

       function getChartHeight() {
         let node = vm.hContainer.node();
         if (!node.offsetParent) console.info('Debuge, this chart box:', d3.select(node));
         let allHeight = node.offsetParent.clientHeight,
           offsetTop = node.offsetTop,
           parentPadding = parseFloat(d3.select(node.parentNode).style('padding-bottom'));
         return allHeight - offsetTop - parentPadding + 'px';
       }
     },
     //button click 
     buttonTCChanged(button) {
       var vm = this;
       if (button.index === this.$data.timeConsumingactiveButton.index) return;
       this.$data.timeConsumingactiveButton = button;
       setTimeout(function() {
         vm.updateChart(vm.stackBar, vm.getCAData());
       }, 100)
     },
     buttonTCCChanged(button) {
       var vm = this;
       this.$data.showTimeConsumingChange = false;
       this.$data.showTimeConsumingChart = true;
       this.initTimeConsumingChart();

       this.CAData = this.renderCAData(this.conf.data);

       setTimeout(function() {
         vm.updateChart(vm.stackBar, vm.getCAData());
       }, 100)
     },
     buttonTBChanged(button) {
       var vm = this;
       if (button.index === this.$data.timeBreakdConnButton.index) return;
       this.$data.timeBreakdConnButton = button;

       this.CTBCData = this.renderCTBCData(this.conf.data);
       setTimeout(function() {
         vm.updateChart(vm.line, vm.getCTBCData());
       }, 100)
     },
     buttonTBAhanged(button) {
       var vm = this;
       if (button.index === this.$data.timeBreakdActiveButton.index) return;
       this.$data.timeBreakdActiveButton = button;

       this.CTBAData = this.renderCTBAData(this.conf.data);
       setTimeout(function() {
         vm.updateChart(vm.ActiveLine, vm.getCTBAData());
       }, 100)
     },
     // filter change 
     filterChange(data) {
       var vm = this;
       var res = data;
       this.OCTData = this.renderOCTData(res);
       this.CTBCData = this.renderCTBCData(res);
       this.CAData = this.renderCAData(res);
       this.CTBAData = this.renderCTBAData(res);
       this.discrepanciesData = this.renderDiscrepanciesData(res);
       if (vm.showOverallCycleTimeChart) {
         vm.initOverallCycleTimeChart();
         vm.updateChart(vm.horizontalBar, vm.getOCTData());
       } else if (vm.showTimeBreakdownChart) {
         vm.initTimeBreakdownChart();
         vm.updateChart(vm.line, vm.getCTBCData());
       } else if (vm.showTimeBreakdownActiveChart) {
         vm.initTimeBreakdownChart();
         vm.updateChart(vm.ActiveLine, vm.getCTBAData());
       } else if (vm.showTimeConsumingChart) {
         vm.initTimeConsumingChart();
         vm.updateChart(vm.stackBar, vm.getCAData());
       } else if (vm.showTimeConsumingChange) {
         vm.initTimeConsumingChart();
         vm.updateChart(vm.stackBar, vm.getCAData());
       }
     },
     windowResized(args) {
       var vm = this;
       if (args.id == this.$props.tileId) {
         if (vm.showOverallCycleTimeChart) {
           this.updateChart(this.horizontalBar, null);
         } else if (vm.showTimeBreakdownActiveChart) {
           this.updateChart(this.ActiveLine, null);
         }  else if (vm.showTimeBreakdownChart) {
           this.updateChart(this.line, null);
         } else if (vm.showTimeConsumingChart) {
           this.updateChart(this.stackBar, null);
         } else if (this.showTimeConsumingChange) {
           this.updateChart(this.bar, null);
         }
       };
     },

     getCycleTime(data) {
       if (data >= 0 && data <= 60) {
         return data;
       } else if (data > 50 && data <= 60) {
         data = (data - 50) / 2 + 50;
         return data.toFixed(1);
       } else if (data > 60 && data <= 100) {
         data = (data - 60) / 4 + 55;
         return data.toFixed(1);
       } else if (data > 100 && data <= 500) {
         data = (data - 100) / 80 + 65;
         return data.toFixed(1);
       } else if (data > 500 && data <= 2500) {
         data = (data - 500) / 400 + 70;
         return data.toFixed(1);
       } else if (data > 2500 && data <= 15000) {
         data = (data - 2500) / 2500 + 75;
         return data.toFixed(1);
       } else if (data > 15000) {
         data = 80;
         return data;
       }
     },
     //
     getBarChartData(activityName) {
       var vm = this;
       if (this.discrepanciesData == null) {
         return [];
       }
       var barChartData = [];
       var discrepanciesData = DeepClone.deepClone(this.discrepanciesData);

       discrepanciesData.forEach(function(r) {
         if (r.activityName == activityName) {
           if (r.discrepancies && r.discrepancies.length) {
             r.discrepancies.sort(vm.sortByPercentage);
             r.discrepancies.forEach((d, i) => {
               var list = {};
               list.label = d.name;
               list.value = d.percentage * 100;
               if (i < 3) {
                 barChartData.push(list);
               }
             })
           }

         }

       })
       return [{
         name: 'discrepancies',
         color: '#00c9ff',
         values: barChartData
       }]
     },
     renderDiscrepanciesData(res) {
       if (res == null) { return null };
       var discrepanciesData = res.kpiDetail.timeConsumeActivities;


       return discrepanciesData;
     },
     //
     getOCTData() {
       if (this.OCTData == null) {
         return [];
       }
       var OCTData = this.OCTData;
       return [{
         type: 'horizontalBar',
         color: '#07d9d6',
         values: [{
           'label': 'Max',
           'value': this.getCycleTime(this.mathDay(OCTData[0])),
           'time': OCTData[0]
         }, {
           'label': 'Min',
           'value': this.getCycleTime(this.mathDay(OCTData[1])),
           'time': OCTData[1]
         }, {
           'label': 'Median',
           'value': this.getCycleTime(this.mathDay(OCTData[2])),
           'time': OCTData[2]
         }, {
           'label': 'Average',
           'value': this.getCycleTime(this.mathDay(OCTData[3])),
           'time': OCTData[3]
         }]
       }]
     },
     renderOCTData(res) {
       if (res == null) { return null };
       var overallAverageCycleTime = res.kpiDetail.overallAverageCycleTime,
         overallMinCycleTime = res.kpiDetail.overallMinCycleTime,
         overallMaxCycleTime = res.kpiDetail.overallMaxCycleTime,
         overallMedianCycleTime = res.kpiDetail.overallMedianCycleTime;
       var OCTData = [overallMaxCycleTime, overallMinCycleTime, overallMedianCycleTime, overallAverageCycleTime];
       return OCTData;
     },
     //1
     getCAData() {
       if (this.CAData == null) {
         return [];
       }
       var vm = this;
       var dProValues = [];
       var dWaitValues = [];
       var unitCount = vm.setUnitCount(vm.timeConsumingActUnits);
       this.CAData.forEach(function(d, i) {
         var list = {}
         list.activityName = d.activityName;
         list.activityType = d.activityType;
         if (vm.$data.timeConsumingactiveButton == vm.$data.timeConsumingButtons[0]) {
           list.activityTime = (d.overallAverageProcessTime / unitCount).toFixed(1);
           list.overallCaseFrequencyPercentage = d.overallAverageCaseFrequencyPercentage;
           list.overallActivityFrequencyPercentage = d.overallActivityFrequencyPercentage;
         } else {
           list.activityTime = (d.overallMedianProcessTime / unitCount).toFixed(1);
           list.overallCaseFrequencyPercentage = d.overallMedianCaseFrequencyPercentage;
           list.overallActivityFrequencyPercentage = d.overallMedianActivityFrequencyPercentage;
         }
         if (i < 5) {
           dProValues.push(list);
         }

       });
       this.CAData.forEach(function(d, i) {
         var list = {}
         list.activityName = d.activityName;
         list.activityType = d.activityType;
         if (vm.$data.timeConsumingactiveButton == vm.$data.timeConsumingButtons[0]) {
           list.activityTime = (d.overallAverageWaitingTime / unitCount).toFixed(1);
           list.overallCaseFrequencyPercentage = d.overallAverageCaseFrequencyPercentage;
           list.overallActivityFrequencyPercentage = d.overallActivityFrequencyPercentage;
         } else {
           list.activityTime = (d.overallMedianWaitingTime / unitCount).toFixed(1);
           list.overallCaseFrequencyPercentage = d.overallMedianCaseFrequencyPercentage;
           list.overallActivityFrequencyPercentage = d.overallMedianActivityFrequencyPercentage;
         }
         if (i < 5) {
           dWaitValues.push(list);
         }
       })
       return [{
         key: 'Waiting Time',
         name: 'Waiting Time',
         color: '#048ba9',
         values: dWaitValues

       }, {
         key: 'Processing Time',
         name: 'Processing Time',
         color: '#00c9ff',
         values: dProValues
       }];
     },
     renderCAData(res) {
       if (!(res && res.kpiDetail.timeConsumeActivities)) { return null };
       var vm = this;
       var data = DeepClone.deepClone(res.kpiDetail.timeConsumeActivities);
       if (vm.$data.timeConsumingactiveButton == vm.$data.timeConsumingButtons[0]) {
         var CAData = data.sort(this.sortByAvgTime);
         this.timeConsumingActUnits = this.setUnit(CAData[0].overallAverageProcessTime + CAData[0].overallAverageWaitingTime);
       } else {
         var CAData = data.sort(this.sortByMidTime);
         this.timeConsumingActUnits = this.setUnit(CAData[0].overallMedianProcessTime + CAData[0].overallMedianWaitingTime);
       }

       return CAData;
     },
     //
     getCTBCData() {
       if (this.CTBCData == null) {
         return [];
       }
       var benchmarkData = [],
         currentData = [],
         vm = this;
       var unitCount = vm.setUnitCount(vm.timeBreakConnUnits);
       this.CTBCData.forEach(function(d) {
         var list = {};
         list.x = d.connection.sourceLabel + d.connection.targetLabel;
         list.y = Math.ceil(d.benchmarkCycleTime / unitCount * 10) * 1.0 / 10;
         list.from = d.connection.sourceLabel;
         list.to = d.connection.targetLabel;
         list.benchmarkDuration = d.benchmarkCycleTime;
         benchmarkData.push(list);
       })
       this.CTBCData.forEach(function(d) {
         var list = {};
         list.x = d.connection.sourceLabel + d.connection.targetLabel;
         list.from = d.connection.sourceLabel;
         list.to = d.connection.targetLabel;
         if (vm.$data.timeBreakdConnButton == vm.$data.timeBreakdownButtons[0]) {
           list.duration = d.averageTime;
           list.y = Math.ceil(d.averageTime / unitCount * 10) * 1.0 / 10;
         } else {
           list.duration = d.medianTime;
           list.y = Math.ceil(d.medianTime / unitCount * 10) * 1.0 / 10;
         }
         currentData.push(list);
       })
       return [{
         type: 'line',
         name: 'Benchmark Process',
         color: '#FD625E',
         values: benchmarkData,
       }, {
         type: 'line',
         name: 'Current Process',
         color: '#5F6B6D',
         values: currentData,
       }];

     },
     renderCTBCData(res) {
       if (!(res && res.kpiDetail.connectionBenchmarks)) { return null };
       var vm = this;
       var CTBCData = DeepClone.deepClone(res.kpiDetail.connectionBenchmarks);
       var CTBCUnitData = DeepClone.deepClone(res.kpiDetail.connectionBenchmarks);
       if (vm.$data.timeBreakdConnButton == vm.$data.timeBreakdownButtons[0]) {
         var CTBCUnitData = CTBCUnitData.sort(this.sortByBreakAvgTime);
         this.timeBreakConnUnits = this.setUnit(CTBCUnitData[0].benchmarkCycleTime + CTBCUnitData[0].averageTime);
       } else {
         var CTBCUnitData = CTBCUnitData.sort(this.sortByBreakMidTime);
         this.timeBreakConnUnits = this.setUnit(CTBCUnitData[0].benchmarkCycleTime + CTBCUnitData[0].medianTime);
       }
       return CTBCData;
     },
     //

     getCTBAData() {
       if (this.CTBAData == null) {
         return [];
       }
       var benchmarkData = [],
         currentData = [],
         vm = this;
       var unitCount = vm.setUnitCount(vm.timeBreakActUnits);
       this.CTBAData.forEach(function(d) {
         var list = {};
         list.x = d.name;
         list.y = Math.ceil(d.benchmarkTime / unitCount * 10) * 1.0 / 10;
         list.benchmarkDuration = d.benchmarkTime;
         benchmarkData.push(list);
       })
       this.CTBAData.forEach(function(d) {
         var list = {};
         list.x = d.name;
         if (vm.$data.timeBreakdActiveButton == vm.$data.timeBreakdownButtons[0]) {
           list.duration = d.averageTime;
           list.y = Math.ceil(d.averageTime / unitCount * 10) * 1.0 / 10;
         } else {
           list.duration = d.medianTime;
           list.y = Math.ceil(d.medianTime / unitCount * 10) * 1.0 / 10;
         }
         currentData.push(list);
       })
       return [{
         type: 'line',
         name: 'Benchmark Process',
         color: '#FD625E',
         values: benchmarkData,
       }, {
         type: 'line',
         name: 'Current Process',
         color: '#5F6B6D',
         values: currentData,
       }];

     },
     renderCTBAData(res) {
       if (!(res && res.kpiDetail.activityBenchmarks)) { return null };
       var vm = this;
       var CTBAData = DeepClone.deepClone(res.kpiDetail.activityBenchmarks);
       var CTBCUnitData = DeepClone.deepClone(res.kpiDetail.activityBenchmarks);
       if (vm.$data.timeBreakdActiveButton == vm.$data.timeBreakdownButtons[0]) {
         var CTBCUnitData = CTBCUnitData.sort(this.sortByBreakAvgTime);
         this.timeBreakActUnits = this.setUnit(CTBCUnitData[0].averageTime + CTBCUnitData[0].benchmarkCycleTime);
       } else {
         var CTBCUnitData = CTBCUnitData.sort(this.sortByBreakMidTime);
         this.timeBreakActUnits = this.setUnit(CTBCUnitData[0].medianTime + CTBCUnitData[0].benchmarkCycleTime);
       }

       return CTBAData;
     },
     //
     mathDay(d) {
       if (d <= 0) {
         return 0;
       }
       var days = Math.ceil(d / 60 / 60 / 24 * 10) * 1.0 / 10;
       return days;
     },
     setTimeConsumingButtons() {
       return [{
         index: 0,
         key: 'average',
         name: 'Average'
       }, {
         index: 1,
         key: 'median',
         name: 'Median'
       }]
     },
     setTimeBreakdownButtons() {
       return [{
         index: 0,
         key: 'average',
         name: 'Average'
       }, {
         index: 1,
         key: 'median',
         name: 'Median'
       }]
     },
     setTimeBreakdownActiveButtons() {
       return [{
         index: 0,
         key: 'average',
         name: 'Average'
       }, {
         index: 1,
         key: 'median',
         name: 'Median'
       }]
     },
     setUnit(time) {
       var unit;
       if (time < 60) {
         unit = 'Seconds';
       } else if (60 <= time && time < 3600) {
         unit = 'Minutes';
       } else if (3600 <= time && time < 3600 * 24) {
         unit = 'Hours';
       } else {
         unit = 'Days';
       }
       return (unit);
     },
     setUnitCount(unit) {
       switch (unit) {
         case 'Seconds':
           return 1;
         case 'Minutes':
           return 60;
         case 'Hours':
           return 3600;
         case 'Days':
           return 86400;
       }
     },
     sortByMidTime(obj1, obj2) {
       var val1 = obj1.overallMedianProcessTime + obj1.overallMedianWaitingTime;
       var val2 = obj2.overallMedianProcessTime + obj2.overallMedianWaitingTime;
       if (val1 > val2) {
         return -1;
       } else if (val1 < val2) {
         return 1;
       } else {
         return 0;
       }
     },
     sortByPercentage(obj1, obj2) {
       var val1 = obj1.percentage;
       var val2 = obj2.percentage;
       if (val1 > val2) {
         return -1;
       } else if (val1 < val2) {
         return 1;
       } else {
         return 0;
       }
     },
     sortByAvgTime(obj1, obj2) {
       var val1 = obj1.overallAverageProcessTime + obj1.overallAverageWaitingTime;
       var val2 = obj2.overallAverageProcessTime + obj2.overallAverageWaitingTime;
       if (val1 > val2) {
         return -1;
       } else if (val1 < val2) {
         return 1;
       } else {
         return 0;
       }
     },
     sortByBreakAvgTime(obj1, obj2) {

       var val1 = obj1.benchmarkCycleTime > obj1.averageTime ? obj1.benchmarkCycleTime : obj1.averageTime;
       var val2 = obj2.benchmarkCycleTime > obj2.averageTime ? obj2.benchmarkCycleTime : obj2.averageTime;
       if (val1 > val2) {
         return -1;
       } else if (val1 < val2) {
         return 1;
       } else {
         return 0;
       }
     },

     sortByBreakMidTime(obj1, obj2) {

       var val1 = obj1.benchmarkCycleTime > obj1.medianTime ? obj1.benchmarkCycleTime : obj1.medianTime;
       var val2 = obj2.benchmarkCycleTime > obj2.medianTime ? obj2.benchmarkCycleTime : obj2.medianTime;
       if (val1 > val2) {
         return -1;
       } else if (val1 < val2) {
         return 1;
       } else {
         return 0;
       }
     },
   },

   components: {
     'leap-select': LEAPSelect
   },
   created() {
     this.hContainer = null;
     this.horizontalBar = null;
     this.stackBar = null;
     this.line = null;
     this.bar = null;
     this.OCTData = [];
     this.CAData = [];
     this.CTBCData = [];
     this.CTBAData = [];
     this.discrepanciesData = [];
     this.$data.timeConsumingButtons = this.setTimeConsumingButtons();
     this.$data.timeBreakdownButtons = this.setTimeBreakdownButtons();
     this.$data.timeConsumingactiveButton = this.$data.timeConsumingButtons[0];
     this.$data.timeBreakdConnButton = this.$data.timeBreakdownButtons[0];
     this.$data.timeBreakdActiveButton = this.$data.timeBreakdownButtons[0];

     eventHub.$on('tile-window-resized', this.windowResized);
   },
   mounted() {
     if (this.selected == "Overall Cycle Time") {
       this.res = this.conf.data;
       this.initOverallCycleTimeChart();
       this.CTBAData = this.renderCTBAData(this.res);
       this.CTBCData = this.renderCTBCData(this.res);
       this.OCTData = this.renderOCTData(this.res);
       this.CAData = this.renderCAData(this.res);
       this.discrepanciesData = this.renderDiscrepanciesData(this.res);
       this.updateChart(this.horizontalBar, this.getOCTData());
     }
   },
   beforeDestroy() {
     eventHub.$off('tile-window-resized', this.windowResized);
   }
 }
