import * as d3 from 'd3'
import * as d3BI from '@/lib/d3-bi/index.js'
import TypeChecker from '@/utils/type-checker.js'
import CommonUtils from '@/utils/common-utils.js'
import LeapSelect from '@/components/leap-select/LEAPSelect.vue'
import PeriodSelector from '../../../period-selector/PeriodSelector.vue'
import DashboardComment from '../../../dashboard-comment/DashboardComment.vue'
import PeriodUtils from '../../../period-utils.js'
import DataUtils from '@/utils/data-utils.js'
import shared from '@/shared.js'
let eventHub = shared.eventHub;
export default {
  template: `<div class="container-fluid" ref="container">
      <div class="row" v-if="!conf.noPeriodSelector">
        <div class="col-xs-12">
          <period-selector :periods="periods" @change="changedPeriod"></period-selector>
        </div>
      </div>
      <div class="row">
        <div class="col-xs-12">
          <div class="chart-title"><span>学历构成</span></div>
          <div class="chart-container" ref="hUContainer"></div>
        </div>
      </div>
      <div class="row">
        <div class="col-xs-12">
          <div class="chart-title">
            <span>招聘情况</span>
          </div>
          <div class="chart-container" ref="hDContainer"></div>
        </div>
      </div>
      <div class="row" v-if="comments">
        <div class="col-xs-12">
        <dashboard-comment :module="conf.data.module" :comments="comments"></dashboard-comment>
        </div>
      </div>
  </div>`,
  props: {
    tileId: {
      type: String
    },
    conf: {
      validator: function(_conf) {
        if (!TypeChecker.isObject(_conf)) return false;
        return true;
      }
    }
  },
  data() {
    return {
      periods: { years: null, quarters: null, months: null },
      data: null,
      hUData: null,
      hDData: null,
      comments: null,
      ifFullScreen: false
    };
  },
  created() {
    if (this.$props.tileId) {
      eventHub.$on("tile-window-resized", this.windowResized);
      eventHub.$on("tile-full-screen-inner", this.toggleFullScreen);
    }
    this.parseMonths(this.conf.months);
  },
  components: { LeapSelect, PeriodSelector, DashboardComment },
  mounted() {
    this.container = this.$refs.container;
    this.init();

    if (this.$props.conf.noPeriodSelector) {
      let months = this.periods.months;
      this.changedPeriod(months);
    }
  },
  methods: {
    init() {
      let vm = this;
      vm.hUContainer = d3.select(vm.$refs.hUContainer);
      this.hUChart = d3BI.pieChart();
      this.hUChart.legend.visibility(true);
      this.hUChart.margin({ bottom: 40 });
      this.hUChart.donutRadius(0);
      this.hUChart.tooltip.setContent(function(args) {
        var str =
          '<div style="margin-bottom: 5px;">' + args.x + '</div>' +
          '<table>' +
          '<tr >' + '<td class = "content">' + '人数:' + '</td>' + '<td >' + args.yValues[0].data.value + '</td>' + '</tr>' +
          '<tr >' + '<td class = "content">' + '比例: ' + '</td>' + '<td >' + args.yValues[0].config.percentage + '%' + '</td>' + '</tr>'

        return '<div class="cycle-time-kpi-pop">' + str + '</div>';
      });

      vm.hDContainer = d3.select(vm.$refs.hDContainer);

      // vm.hDChart = d3BI.baseChart()
      //   .x(function(d) { return d.label })
      //   .y(function(d) { return d.value })
      //   .margin({ top: 15, right: 20, left: 15, bottom: 10 });
      // vm.hDChart.axisLines.showAll({ x: false, y: false });
      // vm.hDChart.xAxis.title("月").maxTextLength(10);
      // vm.hDChart.yAxis.title("人数").domainToZero(true).axis().ticks(5);

      vm.hDChart = d3BI.baseChart()
        .x(function(d) { return d.label })
        .y(function(d) { return d.value })
        .y2(function(d) { return d.y2 })
        .margin({ top: 15, right: 20, left: 15, bottom: 10 });

      vm.hDChart.axisLines.showAll({ x: false, y: true });
      vm.hDChart.xAxis.title("月").textRotate(-50).maxTextLength(10);

      vm.hDChart.yAxis.title("人数").domainToZero(true).axis().ticks(5);
      vm.hDChart.y2Axis.title("人数").domainToZero(true).axis().ticks(5);

    },
    draw() {
      let vm = this,
        chartHeight = (vm.container.parentNode.clientHeight - (this.$props.conf.noPeriodSelector ? 0 : 38) - 38 - 52 - 4) / 2 + 'px';
      vm.hUContainer.style('height', chartHeight);
      if (vm.hUContainer.select('svg').size()) {
        vm.hUContainer
          .select('svg')
          .datum(function(d) { return vm.hUData ? vm.hUData : d })
          .call(vm.hUChart);
      } else {
        vm.hUContainer
          .append('svg')
          .datum(vm.hUData)
          .call(vm.hUChart);
      }

      vm.hDContainer.style('height', chartHeight);
      if (vm.hDContainer.select('svg').size()) {
        vm.hDContainer
          .select('svg')
          .datum(function(d) { return vm.hDData ? vm.hDData : d })
          .call(vm.hDChart);
      } else {
        vm.hDContainer
          .append('svg')
          .datum(vm.hDData)
          .call(vm.hDChart);
      }
    },
    parseUData(data) {
      let vm = this;
      if (!TypeChecker.isObject(data) || TypeChecker.isObject(data.degree)) {
        vm.hUData = [];
      }
      let d = [],
        total = 0;
      Object.keys(data.degree).forEach(key => {
        total += data.degree[key];
      });
      Object.keys(data.degree).forEach(key => {
        d.push({
          label: key,
          value: data.degree[key],
          // percentage: Math.round(data.degree[key] / total * 100)
          percentage: (data.degree[key] / total * 100).toFixed(1)
        });
      });
      vm.hUData = d;
    },
    parseDData(data) {
      let vm = this;
      if (!TypeChecker.isObject(data) || TypeChecker.isArray(data.recruit)) {
        vm.hDData = [];
      }
      let chartData = function(_yjdgData, _sjdgData, _qnjhData, _zzData) {         
        return [
          {
            type: 'bar',
            name: '实际到岗人数',
            label: {
              x: '月',
              y: '实际到岗人数',
              name: ''
            },
            color: 'rgb(43, 162, 41)',
            values: _sjdgData
          }, {
            type: 'bar',
            name: '预计到岗人数',
            label: {
              x: '月',
              y: '预计到岗人数',
              name: ''
            },
            color: 'rgb(0, 201, 255)',
            values: _yjdgData
          }, {
            type: 'line',
            name: '全年计划人数',
            axis: "y2",
            label: {
              x: '月',
              y: '全年计划人数',
              name: ''
            },
            color: 'rgb(178, 18, 176)',
            values: _qnjhData
          }, {
            type: 'line',
            name: '在职人数',
            axis: "y2",
            label: {
              x: '月',
              y: '在职人数',
              name: ''
            },
            color: 'rgb(255, 176, 58)',
            values: _zzData
          }
        ]

        /*[
          {
            type: "line",
            name: '预计到岗人数',
            label: {
              x: '月',
              y: '预计到岗人数',
              name: ''
            },
            color: 'rgb(0, 201, 255)',
            values: _yjdgData
          }, {
            type: 'line',
            name: '实际到岗人数',
            label: {
              x: '月',
              y: '实际到岗人数',
              name: ''
            },
            color: 'rgb(43, 162, 41)',
            values: _sjdgData
          }, {
            type: 'line',
            name: '全年计划人数',
            label: {
              x: '月',
              y: '全年计划人数',
              name: ''
            },
            color: 'rgb(178, 18, 176)',
            values: _qnjhData
          }, {
            type: 'line',
            name: '在职人数',
            label: {
              x: '月',
              y: '在职人数',
              name: ''
            },
            color: 'rgb(255, 176, 58)',
            values: _zzData
          }
        ];*/
      };

      let yjdgData = data.recruit.map(d => {
          return {
            label: d['月'],
            value: d['本月预计到岗人数']
          }
        }),
        sjdgData = data.recruit.map(d => {
          return {
            label: d['月'],
            value: d['本月实际到岗人数']
          }
        }),
        qnjhData = data.recruit.map(d => {
          return {
            label: d['月'],
            y2: d['全年计划人数'],
            // value: d['全年计划人数']
          }
        }),
        zzData = data.recruit.map(d => {
          return {
            label: d['月'],
            y2: d['在职人数'],
            // value: d['在职人数']
          }
        });

      vm.hDData = chartData(yjdgData, sjdgData, qnjhData, zzData);
    },
    windowResized: function(args) {
      if (args.id == this.$props.tileId) {
        this.draw();
      };
    },
    toggleFullScreen(args) {
      if (args.id == this.$props.tileId) {
        this.ifFullScreen = args.ifFullScreen;
        this.draw();
      };
    },
    parseData(data) {
      if (!TypeChecker.isObject(data)) return;
      this.parseUData(data);
      this.parseDData(data);
    },
    parseMonths(months) {
      let periods = PeriodUtils.parsePeriodsFromMonths(months);
      this.periods.months = periods.months;
      this.periods.quarters = periods.quarters;
      this.periods.years = periods.years;
    },
    changedPeriod(args) {
      let selectedMonths = args.map(m => m.year + '-' + m.month);
      let data = this.massagedData = { degree: {}, recruit: [] }, comments = this.comments = [];

      if(TypeChecker.isArray(this.$props.conf.data.comments)) {
        this.$props.conf.data.comments.filter(item => selectedMonths.indexOf(item.month) > -1).forEach(item => {
          comments.push({
            month: item.month,
            content: item.data
          });
        });
      }

      if (TypeChecker.isArray(this.$props.conf.data.degree)) {
        // this.$props.conf.data.degree.filter(item => selectedMonths.indexOf(item.month) > -1).forEach(item => {
        this.$props.conf.data.degree.filter(item => item.month === this.$props.conf.curMonth).forEach(item => {
          Object.keys(item.data).forEach(key => {
            if (TypeChecker.isNumber(item.data[key])) {
              if (!TypeChecker.isNumber(data.degree[key])) {
                data.degree[key] = item.data[key];
              } else {
                data.degree[key] += item.data[key];
              }
            }
          });
        });
      }

      if (TypeChecker.isArray(this.$props.conf.data.recruit)) {
        this.$props.conf.data.recruit.filter(item => selectedMonths.indexOf(item.month) > -1).forEach(item => {
          item.data['月'] = item.month;
          data.recruit = data.recruit.concat(item.data);
        });
      }
      this.parseData(data);
      this.draw();
    }
  },
  beforeDestroy: function() {
    if (this.$props.tileId) {
      eventHub.$off("tile-window-resized", this.windowResized);
      eventHub.$off("tile-full-screen-inner", this.toggleFullScreen);
    }
  }
}
