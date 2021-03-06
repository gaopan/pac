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
          <div class="chart-title"><span>合格</span></div>
          <div class="chart-container" ref="qUContainer"></div>
        </div>
      </div>
      <div class="row">
        <div class="col-xs-12">
          <div class="chart-title">
            <span>错误</span>
            <div class="selector">
              <leap-select :options="qDOptions" :initSelectedValue="selectedQDOption" v-on:onSelectedValues="selectQDOption"></leap-select>
            </div>
          </div>
          <div class="chart-container">
            <div class = "qD-container-1" ref="qDContainer"></div>
            <div class = "qD-container-2" ref="qDContainer2"></div>
          </div>
        </div>
      </div>
      <div class="row" v-if="ifFullScreen&&table">
        <div class="table-wrapper" style="padding: 10px 15px;">
        <table class="leap-table">
            <thead>
              <th v-for="header in table.headers">{{header.name}}</th>
            </thead>
            <tbody v-if="table.list.length > 0">
              <tr v-for="d in table.list">
                <td v-for="header in table.headers">
                  <div>{{d[header.key]}}</div>
                </td>
              </tr>
            </tbody>
            <tbody v-else><tr><td :colspan="table.headers.length">没有数据显示</td></tr></tbody>
          </table>
          </div>
      </div>
      <div class="row" v-if="comments">
        <dashboard-comment :module="conf.data.module" :comments="comments"></dashboard-comment>
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
      data: null,
      periods: { years: null, quarters: null, months: null },
      qUData: null,
      qDData: null,
      selectedQDOption: null,
      qDOptions: [],
      table: null,
      comments: null,
      ifFullScreen: false,

      qDContainer: null,
      qDContainer2: null,
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
      vm.qUContainer = d3.select(vm.$refs.qUContainer);
      vm.qUChart = d3BI.baseChart()
        .x(function(d) { return `${d.label}(${d.field})` })
        .y(function(d) { return d.value })
        .y2(function(d) { return d.y2 })
        .margin({ top: 15, right: 20, left: 15, bottom: 10 });

      vm.qUChart.axisLines.showAll({ x: false, y: true });
      vm.qUChart.xAxis.title("外业批次(区域)").textRotate(-40).maxTextLength(10);
      vm.qUChart.yAxis.title("里程(公里)").domainToZero(true).axis().ticks(5);
      vm.qUChart.y2Axis.title("率(%)").domainToZero(true).axis().ticks(5);

      vm.qDContainer = d3.select(vm.$refs.qDContainer);
      vm.qDContainer2 = d3.select(vm.$refs.qDContainer2);

      vm.qDChart = d3BI.baseChart()
        .x(function(d) { return d.label })
        .y(function(d) { return d.value })
        .margin({ top: 15, right: 20, left: 15, bottom: 10 });

      vm.qDChart.axisLines.showAll({ x: false, y: true });
      vm.qDChart.xAxis.title("月").maxTextLength(10);
      vm.qDChart.yAxis.title("率(%)").domainToZero(true).axis().ticks(5);

      vm.qDChart2 = d3BI.baseChart()
        .x(function(d) { return d.label })
        .y(function(d) { return d.value })
        .margin({ top: 15, right: 20, left: 15, bottom: 10 });

      vm.qDChart2.axisLines.showAll({ x: false, y: true });
      vm.qDChart2.xAxis.title("月").maxTextLength(10);
      vm.qDChart2.yAxis.title("率(%)").domainToZero(true).axis().ticks(5);


    },
    selectQDOption(args) {
      this.selectedQDOption = args.value;
      this.parseData(this.massagedData);
      this.drawQDChart();
    },
    drawQUChart() {
      let vm = this,
        chartHeight = this.chartHeight;
      vm.qUContainer.style('height', chartHeight);
      if (vm.qUContainer.select('svg').size()) {
        vm.qUContainer
          .select('svg')
          .datum(function(d) { return vm.qUData ? vm.qUData : d })
          .call(vm.qUChart);
      } else {
        vm.qUContainer
          .append('svg')
          .datum(vm.qUData)
          .call(vm.qUChart);
      }
    },
    drawQDChart() {
      let vm = this,
          chartHeight = this.chartHeight,
          chartData = divideData(vm.qDData);

      vm.qDContainer.style('height', chartHeight);
      vm.qDContainer2.style('height', chartHeight);

      if (vm.qDContainer.select('svg').size()) {
        vm.qDContainer
          .select('svg')
          .datum(function(d) { return chartData.chart1 ? chartData.chart1 : d })
          .call(vm.qDChart);
      } else {
        vm.qDContainer
          .append('svg')
          .datum(chartData.chart1)
          .call(vm.qDChart);
      }


      if (vm.qDContainer2.select('svg').size()) {
        vm.qDContainer2
          .select('svg')
          .datum(function(d) { return chartData.chart2 ? chartData.chart2 : d })
          .call(vm.qDChart2);
      } else {
        vm.qDContainer2
          .append('svg')
          .datum(chartData.chart2)
          .call(vm.qDChart2);
      }

      function divideData(data){
        let chart1 = [], chart2 = [];
        if(Array.isArray(data)){
          data.forEach(d=>{
            if(d.name === "错误率" || d.name === "错误发生率标准"){
              chart1.push(d);
            }else if(d.name === "错误流出率" || d.name === "错误流出率标准"){
              chart2.push(d);
            }
          })
        }

        return { chart1, chart2 }
      }

    },
    draw() {
      this.chartHeight = Math.floor((this.container.parentNode.clientHeight - 52 - (this.$props.conf.noPeriodSelector ? 0 : 38) - 52 - 4) / 2) + 'px';
      this.drawQUChart();
      this.drawQDChart();
    },
    parseUData(data) {
      let chartData = function(_hgData, _hgbzData, _zlcData, _ljzlcData, _hglcData) {
        return [{
          type: 'line',
          name: '合格率',
          axis: "y2",
          label: {
            x: '批次',
            y: '合格率',
            name: ''
          },
          color: 'rgb(0, 201, 255)',
          values: _hgData
        }, {
          type: 'line',
          name: '合格标准',
          axis: "y2",
          label: {
            x: '批次',
            y: '合格标准',
            name: ''
          },
          color: 'rgb(43, 162, 41)',
          values: _hgbzData
        }, {
          type: 'bar',
          name: '总里程',
          label: {
            x: '批次',
            y: '总里程',
            name: ''
          },
          color: 'rgb(178, 18, 176)',
          values: _zlcData
        },
        //commented by hong-yu
        /* {
          type: 'bar',
          name: '累计总里程',
          label: {
            x: '批次',
            y: '累计总里程',
            name: ''
          },
          color: 'rgb(150, 10, 148)',
          values: _ljzlcData
        }, */
        {
          type: 'bar',
          name: '合格里程',
          label: {
            x: '批次',
            y: '合格里程',
            name: ''
          },
          color: 'rgb(255, 176, 58)',
          values: _hglcData
        }];
      };
      if (!TypeChecker.isArray(data.up)) {
        this.qUData = chartData([]);
        return;
      }

      let hglData = data.up.map(_d => {
          return {
            field:_d['区域'],
            label: _d['外业批次'],
            y2: +(_d['合格率']*100).toFixed(1),
            value: +(_d['合格里程']).toFixed(1)
          };
        }),
        hgbzData = data.up.map(_d => {
          return {
            field:_d['区域'],
            label: _d['外业批次'],
            y2: +(_d['合格标准']*100).toFixed(1),
            value: +(_d['总里程']).toFixed(1)
          }
        }),
        zlcData = data.up.map(_d => {
          return {
            field:_d['区域'],
            label: _d['外业批次'],
            value: +(_d['总里程']).toFixed(1)
          }
        }),
        ljzlcData = data.up.map(_d => {
          return {
            field:_d['区域'],
            label: _d['外业批次'],
            value: +(_d['累计总里程']).toFixed(1)
          };
        }),
        hglcData = data.up.map(_d => {
          return {
            field:_d['区域'],
            label: _d['外业批次'],
            value: +(_d['合格里程']).toFixed(1)
          }
        });

      this.qUData = chartData(hglData, hgbzData, zlcData, ljzlcData, hglcData);
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
    parseDData(data) {
      let chartData = function(_cwlData, _cwlbzData, _cwlclData, _cwlclbzData) {
        return [{
          type: 'bar',
          name: '错误率',
          label: {
            x: '月',
            y: '错误发生率',
            name: ''
          },
          color: 'rgb(0, 201, 255)',
          values: _cwlData
        }, {
          type: 'bar',
          name: '错误发生率标准',
          dashed: "3, 3",
          label: {
            x: '月',
            y: '错误发生率标准',
            name: ''
          },
          color: 'rgb(15,113,139)',
          values: _cwlbzData
        }, {
          type: 'bar',
          name: '错误流出率',
          label: {
            x: '月',
            y: '错误流出率',
            name: ''
          },
          color: 'rgb(255,90,252)',
          values: _cwlclData
        }, {
          type: 'bar',
          name: '错误流出率标准',
          dashed: "3, 3",
          label: {
            x: '月',
            y: '错误流出率标准',
            name: ''
          },
          color: 'rgb(178, 18, 176)',
          values: _cwlclbzData
        }];
      };
      if (!TypeChecker.isObject(data.down) || !TypeChecker.isArray(data.down[this.selectedQDOption])) {
        this.qDData = chartData([]);
        return;
      }
      let cwlData = data.down[this.selectedQDOption].map(_d => {
          return {
            label: _d['月'],
            // value: _d['错误发生率']
            value: +(_d['错误发生率']*100).toFixed(1)
          };
        }),
        cwlbzData = data.down[this.selectedQDOption].map(_d => {
          return {
            label: _d['月'],
            // value: _d['错误发生率标准']
            value: +(_d['错误发生率标准']*100).toFixed(1)
          }
        }),
        cwlclData = data.down[this.selectedQDOption].map(_d => {
          return {
            label: _d['月'],
            // value: _d['错误流出率']
            value: +(_d['错误流出率']*100).toFixed(1)
          }
        }),
        cwlclbzData = data.down[this.selectedQDOption].map(_d => {
          return {
            label: _d['月'],
            // value: _d['错误流出率标准']
            value: +(_d['错误流出率标准']*100).toFixed(1)
          }
        });
      this.qDData = chartData(cwlData, cwlbzData, cwlclData, cwlclbzData);
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
      let data = this.massagedData = { up: [], down: {} },
        comments = this.comments = [],
        table = this.table = {};

      if (TypeChecker.isArray(this.$props.conf.data.comments)) {
        this.$props.conf.data.comments.filter(item => selectedMonths.indexOf(item.month) > -1).forEach(item => {
          comments.push({
            month: item.month,
            content: item.data
          });
        });
      }

      if (TypeChecker.isObject(this.$props.conf.data.table)) {
        table.headers = this.$props.conf.data.table.headers;
        table.list = [];
        this.$props.conf.data.table.list.filter(item => selectedMonths.indexOf(item.month) > -1).forEach(item => {
          table.list = table.list.concat(item.data);
          item.data.forEach(_item => {
            _item['合格率'] = (Number(_item['合格里程']) / Number(_item['总里程'])).toFixed(3);
          });
        });
      }

      if (TypeChecker.isArray(this.$props.conf.data.up)) {
        let totalLC = 0;
        this.$props.conf.data.up.filter(item => selectedMonths.indexOf(item.month) > -1).forEach(item => {
          data.up = data.up.concat(item.data);
          item.data.forEach(_item => {
            totalLC += Number(_item['总里程']);
            _item['合格率'] = (Number(_item['合格里程']) / Number(_item['总里程'])).toFixed(3);
          });
        });
        data.up.forEach(item => {
          item['累计总里程'] = totalLC;
        });
      }

      if (TypeChecker.isArray(this.$props.conf.data.down)) {
        let filteredDownData = [];
        this.$props.conf.data.down.filter(item => selectedMonths.indexOf(item.month) > -1).forEach(item => {
          item.data.forEach(_item => {
            _item['月'] = item.month;
          });
          filteredDownData = filteredDownData.concat(item.data);
        });
        data.down = DataUtils.groupBy(filteredDownData, '类型');

        this.qDOptions = Object.keys(data.down).map(k => {
          return {
            name: k,
            value: k
          };
        });
        if (this.qDOptions.length > 0) {
          this.selectedQDOption = this.qDOptions[0].value;
        }
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
