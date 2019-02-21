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
    <div class="row">
      <div class="col-xs-3">
        <div class="top-selector">
          <leap-select :options="typeOptions" :initSelectedValue="selectedType" v-on:onSelectedValues="selectType"></leap-select>
        </div>
      </div>
      <div class="col-xs-9" v-if="!conf.noPeriodSelector">
        <period-selector :periods="periods" @change="changedPeriod"></period-selector>
      </div>
    </div>
    <div class="row">
      <div class="col-xs-12">
          <div class="chart-title">
            <span>成本与里程</span>
          </div>
          <div class="chart-container" ref="hUContainer"></div>
        </div>
    </div>
    <div class="row">
        <div class="col-xs-12">
          <div class="chart-title">
            <span>成本目标</span>
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
      hUData: null,
      hDData: null,
      selectedType: '内业',
      typeOptions: [{ name: '内业', value: '内业' }, { name: '外业', value: '外业' }],
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
  watch: {
    selectedType(val) {
      this.parseData(this.massagedData);
      this.draw();
    }
  },
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
      vm.hUChart = d3BI.baseChart()
        .x(function(d) { return d.label })
        .y(function(d) { return d.value })
        .y2(function(d) { return d.y2 })
        .margin({ top: 15, right: 20, left: 15, bottom: 10 });
      vm.hUChart.axisLines.showAll({ x: false, y: false });
      vm.hUChart.xAxis.title("月").maxTextLength(10);
      vm.hUChart.yAxis.title("元").domainToZero(true).axis().ticks(5);
      vm.hUChart.y2Axis.title("公里").axis().ticks(5);

      vm.hDContainer = d3.select(vm.$refs.hDContainer);
      vm.hDChart = d3BI.baseChart()
        .x(function(d) { return d.label })
        .y(function(d) { return d.value })
        .margin({ top: 15, right: 20, left: 15, bottom: 10 });
      vm.hDChart.axisLines.showAll({ x: false, y: false });
      vm.hDChart.xAxis.title("月").maxTextLength(10);
      vm.hDChart.yAxis.title("元/公里").domainToZero(true).axis().ticks(5);
    },
    selectType(args) {
      this.selectedType = args.value;
    },
    draw() {
      let vm = this,
        chartHeight = (vm.container.parentNode.clientHeight - 38 - 38 - 52 - 4) / 2 + 'px';
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
    parseUData(d, chartData) {
      let zcbData = d.map(_d => {
          return {
            label: _d['月'],
            value: _d['总成本']
          };
        }),
        zglData = d.map(_d => {
          return {
            label: _d['月'],
            value: _d['总成本'],
            y2: _d['总公里数']
          };
        }),
        ljzglData = d.map(_d => {
          return {
            label: _d['月'],
            value: _d['总成本'],
            y2: _d['累计总公里数']
          };
        });

      this.hUData = chartData(zcbData, zglData, ljzglData);
    },
    parseDData(d, chartData) {
      let vm = this;
      let sqcbData = null,
        gscbData = null,
        sqcbmbData = null,
        gscbmbData = null;
      if (vm.selectedType == '内业') {
        sqcbData = d.map(_d => {
          return {
            label: _d['月'],
            value: _d['成本']
          };
        });
        gscbData = d.map(_d => {
          return {
            label: _d['月'],
            value: _d['成本目标']
          };
        });
      } else {
        sqcbData = d.map(_d => {
          return {
            label: _d['月'],
            value: _d['市区成本']
          };
        });
        gscbData = d.map(_d => {
          return {
            label: _d['月'],
            value: _d['高速成本']
          };
        });
        sqcbmbData = d.map(_d => {
          return {
            label: _d['月'],
            value: _d['市区成本目标']
          };
        });
        gscbmbData = d.map(_d => {
          return {
            label: _d['月'],
            value: _d['高速成本目标']
          };
        });
      }

      this.hDData = chartData(sqcbData, gscbData, sqcbmbData, gscbmbData);
    },
    parseData(data) {
      let vm = this;
      let hUChartData = function(_zcbData, _zglData, _ljzglData) {
        return [{
          type: 'bar',
          name: '总成本',
          label: {
            x: '月',
            y: '总成本',
            name: ''
          },
          color: 'rgb(43, 162, 41)',
          values: _zcbData
        }, {
          type: 'line',
          name: '总公里数',
          axis: 'y2',
          label: {
            x: '月',
            y: '总公里数',
            name: ''
          },
          color: 'rgb(0, 201, 255)',
          values: _zglData
        }, {
          type: 'line',
          name: '累计总公里数',
          axis: 'y2',
          label: {
            x: '月',
            y: '累计总公里数',
            name: ''
          },
          color: 'rgb(0, 178, 140)',
          values: _ljzglData
        }];
      };
      let hDChartData = function(_sqcbData, _gscbData, _sqcbmbData, _gscbmbData) {
        let _data = null;
        if (vm.selectedType == '外业') {
          _data = [{
            type: "bar",
            name: '市区成本',
            label: {
              x: '月',
              y: '市区成本',
              name: ''
            },
            color: 'rgb(0, 201, 255)',
            values: _sqcbData
          }, {
            type: "bar",
            name: '高速成本',
            label: {
              x: '月',
              y: '高速成本',
              name: ''
            },
            color: 'rgb(43, 162, 41)',
            values: _gscbData
          }, {
            type: 'line',
            name: '市区成本目标',
            label: {
              x: '月',
              y: '高速成本目标',
              name: ''
            },
            dashed: '3 3',
            color: 'rgb(0, 201, 255)',
            values: _sqcbmbData
          }, {
            type: 'line',
            name: '高速成本目标',
            label: {
              x: '月',
              y: '高速成本目标',
              name: ''
            },
            dashed: '3 3',
            color: 'rgb(43, 162, 41)',
            values: _gscbmbData
          }];
        } else {
          _data = [{
            type: "bar",
            name: '成本',
            label: {
              x: '月',
              y: '成本',
              name: ''
            },
            color: 'rgb(0, 201, 255)',
            values: _sqcbData
          }, {
            type: 'line',
            name: '成本目标',
            label: {
              x: '月',
              y: '成本目标',
              name: ''
            },
            dashed: '3 3',
            color: 'rgb(43, 162, 41)',
            values: _gscbData
          }];
        }
        return _data;
      };
      if (!TypeChecker.isObject(data) || !TypeChecker.isArray(data[this.selectedType])) {
        this.hUData = hUChartData([]);
        this.hDData = hDChartData([]);
        return;
      }

      let d = data[this.selectedType];

      this.parseUData(d, hUChartData);
      this.parseDData(d, hDChartData);
    },
    parseMonths(months) {
      let periods = PeriodUtils.parsePeriodsFromMonths(months);

      this.periods.months = periods.months;
      this.periods.quarters = periods.quarters;
      this.periods.years = periods.years;
    },
    changedPeriod(args) {
      let selectedMonths = args.map(m => m.year + '-' + m.month);
      let data = this.massagedData = { '内业': [], '外业': [] },
        comments = this.comments = [];

      if (TypeChecker.isArray(this.$props.conf.data.comments)) {
        this.$props.conf.data.comments.filter(item => selectedMonths.indexOf(item.month) > -1).forEach(item => {
          comments.push({
            month: item.month,
            content: item.data
          });
        });
      }
      if (TypeChecker.isArray(this.$props.conf.data['内业'])) {
        let totalZgls = 0;
        this.$props.conf.data['内业'].filter(item => selectedMonths.indexOf(item.month) > -1).forEach(item => {
          item.data['月'] = item.month;
          data['内业'] = data['内业'].concat(item.data);
          totalZgls += item.data['总公里数'];
        });
        data['内业'].forEach(item => {
          item['累计总公里数'] = totalZgls;
        });
      }
      if (TypeChecker.isArray(this.$props.conf.data['外业'])) {
        let totalZgls = 0;
        this.$props.conf.data['外业'].filter(item => selectedMonths.indexOf(item.month) > -1).forEach(item => {
          item.data['月'] = item.month;
          data['外业'].push(item.data);
          totalZgls += item.data['总公里数'];
        });
        data['外业'].forEach(item => {
          item['累计总公里数'] = totalZgls;
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
