import * as d3 from 'd3'
import * as d3BI from '@/lib/d3-bi/index.js'
import SVG from 'svg.js'
import shared from "@/shared.js"
// import { axios, cookies } from '../../../../../api/api-config.js'
// let baseUrl = process.env.baseUrl;
// let instance = axiosHelper.createAxios({
//   baseURL: "http://ec4t01767.itcs.entsvcs.net:8082/dashboard/api/v1",
//   timeout: 900000
// });

var eventHub = shared.eventHub;

export default {
  name: 'process-deviation-kpi',
  props: {
    tileId: {
      type: String,
      required: true
    },
    conf: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      buttonshow: false,
      container: null,
      barChart: null,
      barContainer: null,
      deviationChartShow: false,
      deviationChartButtons: [],
      deviationTitle: 'Deviation',
      possibleData: [],
      activeButton: {},
      deviationCasedata: null,
     
    }
  },

  created: function() {
    // console.log(this.$props.conf.data)
      this.top5CaseFrequncyDeviations = [],
      this.top5ActivityFrequncyDeviations = [],
      eventHub.$on("tile-window-resized", this.windowResized);
  },
  watch: {
    conf: {
      handler(data, oldData) {
        if (data) {
          this.deviationChartShow = true;
        }
        this.top5CaseFrequncyDeviations = data.data.kpiDetail.top5CaseFrequncyDeviations;
        this.top5ActivityFrequncyDeviations = data.data.kpiDetail.top5ActivityFrequncyDeviations;
        this.init();
        this.deviationCasedata = this.getDeviationCaseData();
        this.draw(this.chartData(this.deviationCasedata));
        this.deviationTitle = "Top " + this.top5CaseFrequncyDeviations.length + " Deviation";
      },
      deep: true
    }
  },
  mounted: function() {
    if (this.conf.data != null) {

      this.deviationChartShow = true;
      this.top5CaseFrequncyDeviations = this.conf.data.kpiDetail.top5CaseFrequncyDeviations;
      this.top5ActivityFrequncyDeviations = this.conf.data.kpiDetail.top5ActivityFrequncyDeviations;
      this.deviationTitle = "Top " + this.top5CaseFrequncyDeviations.length + " Deviation";
    }
    this.init();
    this.deviationTitle = "Top " + this.top5CaseFrequncyDeviations.length + " Deviation";
    this.deviationChartButtons = [{
      index: 0,
      name: 'Case Frequency',
    }, {
      index: 1,
      name: 'Absolute Frequency',
    }];
    this.$data.activeButton = this.$data.deviationChartButtons[0];
    this.getDeviationCaseData;
    this.deviationCasedata = this.getDeviationCaseData();
    this.draw(this.chartData(this.deviationCasedata));
  },

  methods: {

    init() {
      let vm = this,
        // colors = ['#8085E9', '#07D9D6', '#82E237', '#FEED01', '#FF931E', '#95EA4C', '#BCBCDD', '#C5DBF0'];
        colors = ['#ffbb78', '#ff9896', '#c49c94', '#c7c7c7', '#9edae5', '#95EA4C', '#BCBCDD', '#C5DBF0'];
      this.barContainer = d3.select('#deviation-bar-chart');
      vm.barChart = d3BI.baseChart('bar')
        .x(function(d) { return d.label })
        .y(function(d) { return d.value })
        .margin({ top: 0, right: 5, left: 5, bottom: 5 });
      vm.barChart.bar.fnColorWrapper(fnColorWrapper);
      vm.barChart.yAxis.givenDomain(vm.transformDomain);
      // vm.barChart.tooltipDispatch.on('build', null);
      // vm.barChart.tooltipDispatch.on('setPosition', null);
      // vm.barChart.tooltipDispatch.on('remove', null);

      vm.barChart.xAxis.packetAxis(packetAxis);
      vm.barChart.xAxis.scale().padding(0.15);
      vm.barChart.yAxis.axis().ticks(5);
      vm.barChart.tooltip.setContent(function(args) {
        var str='';
        var contentData=vm.top5CaseFrequncyDeviations[args.x];
        str='<div>'+'<div class="deviationContentLable">'+'SOURCE '+'</div>'+
            contentData.connection.sourceLabel+
            '</div>'+
            '<div>'+'<div class="deviationContentLable">'+'TARGET '+'</div>'+
            contentData.connection.targetLabel+
            '</div>'+
            '<div>'+'<div class="deviationContentLable">'+'VALUE '+'</div>'+args.yValues[0].data.y.toFixed(2)+'%'+'</div>' ;
        return str;
        })

      var textArray = [];
      if (vm.deviationChartShow) {
        if (vm.top5CaseFrequncyDeviations != null) {
          vm.top5CaseFrequncyDeviations.forEach(function(d) {
            var array = [d.connection.sourceLabel, '>', d.connection.targetLabel];
            textArray.push(array);
          });
        }
      }

      function fnColorWrapper(h, d, config) {
        let barGroupIndex = config.barGroupIndex || 0;
        return colors[barGroupIndex % colors.length];
      }

      function packetAxis(hAxis) {
        hAxis.selectAll('.tick').each(function(d, index) {
          vm.barChart.xAxis
            .wrapper
            .fromToWrapper(d3.select(this), textArray[index], { maxTextLength: 10 });
        });
      };

      vm.barChart.tooltipDispatch.on('click', function(args, config) {
        vm.clickEachBar(d3.select(this), args, config);
      });
    },
    draw(data) {
      let vm = this;
      this.barContainer.style('height', vm.barChartHeight());
      if (data) {
        // vm.barChart.xAxis.title(data[0].title);
        vm.barChart.yAxis.title('Total %');
      }
      if (vm.barContainer.select('svg').size()) {
        vm.barContainer
          .select('svg')
          .datum(function(d) { return data ? data : d })
          .call(vm.barChart);
      } else {
        vm.barContainer
          .append('svg')
          .datum(data)
          .call(vm.barChart);
      }
    },
    clickEachBar(hBar, data, config) {
      // this.$refs.container.innerHTML='';
      let vm = this;
      this.barContainer = d3.select('#deviation-bar-chart');
      vm.barChart = d3BI.baseChart('bar')
        .x(function(d) { return d.label })
        .y(function(d) { return d.value })
        .margin({ top: 0, right: 5, left: 5, bottom: 5 });
      vm.barChart.tooltipDispatch.on('click', null);
     
      vm.barChart.yAxis.givenDomain(vm.transformDomain);
      // vm.barChart.tooltipDispatch.on('build', null);
      // vm.barChart.tooltipDispatch.on('setPosition', null);
      // vm.barChart.tooltipDispatch.on('remove', null);
      vm.barChart.yAxis.axis().ticks(5);
      var _index;
      var tempdata = [];
      _index = data.data.label;
      if (this.$data.activeButton.index == 0) {
        if (this.top5CaseFrequncyDeviations[_index].top3DeviationDiscrepancies != null) {
          this.top5CaseFrequncyDeviations[_index].top3DeviationDiscrepancies.forEach(function(d) {
            var aa = {
              'label': d.name,
              'value': d.percentage*100
            }
            tempdata.push(aa);
          })
          vm.possibleData = tempdata
        } else {
          vm.possibleData = [];
          // document.getElementsByClassName('bi-tooltip')[0].innerHTML='';
            document.getElementsByClassName('bi-tooltip')[0].style.display='none';
          vm.barChart.tooltipDispatch.on('build', null);
          vm.barChart.tooltipDispatch.on('setPosition', null);
          vm.barChart.tooltipDispatch.on('remove', null);
          vm.barChart.tooltip.setContent(null)
        }
      } else {
        if (this.top5ActivityFrequncyDeviations[_index].top3DeviationDiscrepancies != null) {
          this.top5ActivityFrequncyDeviations[_index].top3DeviationDiscrepancies.forEach(function(d) {
            var aa = {
              'label': d.name,
              'value': d.percentage*100
            }
            tempdata.push(aa);
          })
          vm.possibleData = tempdata;
        } else {
          vm.possibleData = [];
          // document.getElementsByClassName('bi-tooltip')[0].innerHTML='';
          document.getElementsByClassName('bi-tooltip')[0].style.display='none';
          vm.barChart.tooltipDispatch.on('build', null);
          vm.barChart.tooltipDispatch.on('setPosition', null);
          vm.barChart.tooltipDispatch.on('remove', null);
          vm.barChart.tooltip.setContent(null)
        }
      }
     
      vm.buttonshow = true;
      vm.deviationChartShow = false;
      vm.deviationTitle = "Top " + vm.possibleData.length + " possible discrepancles and probability";
      vm.draw(vm.detailChartData(vm.possibleData));
      vm.barChart.xAxis.packetAxis(packetAxis);
      vm.barChart.xAxis.scale().padding(0.15);
      vm.barChart.yAxis.axis().ticks(5);
       vm.barChart.tooltip.setContent(function(args){
        let strr='<div>'+'<div class="deviationContentLable">'+'DETAIL'+
                 '</div>'+args.x+'</div>'+
                 '<div>'+'<div class="deviationContentLable">'+'VALUE'+
                 '</div>'+args.yValues[0].data.y.toFixed(2)+'%'+'</div>';
        return strr;
      });
      var textArray = [];
      if (vm.possibleData != null) {
        vm.possibleData.forEach(function(d) {
          var array = [d.label];
          textArray.push(array);

        });
      }

      function packetAxis(hAxis) {
        hAxis.selectAll('.tick').each(function(d, index) {
          vm.barChart.xAxis
            .wrapper
            .fromToWrapper(d3.select(this), textArray[index], { maxTextLength: 10 });
        });
      };
    },
    barChartHeight() {
      let chart = this.barContainer.node();
      return chart.offsetParent.clientHeight - chart.offsetTop + 'px'
    },
    transformDomain(domain) {
      // expand max
      domain[1] = 1.3 * domain[1];
      // set min to zero
      if (domain[0] > 0) domain[0] = 0;
      return domain;
    },
    backDraw: function() {
      let vm = this;
      var aa = document.getElementById('deviation-bar-chart');
      vm.deviationChartShow = true;
      aa.innerHTML = '';
      vm.init();
      vm.draw(vm.chartData());
      vm.buttonshow = false;
      vm.deviationTitle = "Top " + vm.top5CaseFrequncyDeviations.length + " Deviation";
    },
    redraw: function() {
      let vm = this;
      var aa = document.getElementById('deviation-bar-chart');
      aa.innerHTML = '';
      vm.init();
      if (this.buttonshow) {
        vm.draw(vm.detailChartData());
        vm.barChart.tooltipDispatch.on('click', null);
        // vm.barChart.tooltip.setContent(function(args){
          
        // });
        vm.deviationTitle = "Top " + +" possible discrepancles and probability";
        vm.deviationChartShow = false;
      } else {
        vm.draw(vm.chartData());
        vm.deviationTitle = "Top" + this.top5CaseFrequncyDeviations.length + "Deviation";
      }
    },
    chartData(data) {
      var i = 0;
      return [{
        label: {
          x: 'Detail',
          y: 'value',
        },
        name: 'Spot',
        color: '#ffed00',
        values: this.deviationCasedata,
      }];
    },
    detailChartData() {
      return [{
        label: {
          x: 'Detail',
          y: 'value',
        },
        // title: 'PO line item',
        color: '#ffed00',
        values: this.possibleData,
      }]

    },
    getDeviationCaseData: function() {
      var tempdata = [];
      for (var i = 0; i < this.top5CaseFrequncyDeviations.length; i++) {
        var aa = {
          'label': i,
          'value': this.top5CaseFrequncyDeviations[i].overallPercentage*100,
        }

        tempdata.push(aa);
      }
      return tempdata;
    },
    getDeviationAbsoData: function() {
      var tempdata = [];
      for (var i = 0; i < this.top5ActivityFrequncyDeviations.length; i++) {
        var aa = {
          'label': i,
          'value': this.top5ActivityFrequncyDeviations[i].overallPercentage*100,
        }
        tempdata.push(aa);
      }
      return tempdata;
    },
    buttonChanged(button) {
      if (button.index === this.$data.activeButton.index) return;
      this.$data.activeButton = button;
      if (this.$data.activeButton.index == 0) {
        this.deviationCasedata = this.getDeviationCaseData();
      } else {
        this.deviationCasedata = this.getDeviationAbsoData();
      }
      this.draw(this.chartData(this.deviationCasedata));
    },
    windowResized: function(args) {
      if (args.id == this.$props.tileId) {
        this.redraw();
      }
    },
  },

  beforeDestroy: function() {
    eventHub.$off("tile-window-resized", this.windowResized);
  }

}
