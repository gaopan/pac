import * as d3 from 'd3'
import * as d3BI from '@/lib/d3-bi/index.js'
import TypeChecker from '@/utils/type-checker.js'
import CommonUtils from '@/utils/common-utils.js'
import LeapSelect from '@/components/leap-select/LEAPSelect.vue'
import shared from '@/shared.js'
let eventHub = shared.eventHub;
export default {
  template: `<div class="container-fluid" ref="container">
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
          <div class="chart-container" ref="qDContainer"></div>
        </div>
      </div>
  </div>`,
  props: {
    tileId: {
      type: String,
      required: true
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
      qUData: null,
      qDData: null,
      selectedQDOption: "路网",
      qDOptions: [{
        name: "路网",
        value: "路网"
      }, {
        name: "地物",
        value: "地物"
      }]
    };
  },
  created() {
    eventHub.$on("tile-window-resized", this.windowResized);
    eventHub.$on("tile-full-screen-inner", this.toggleFullScreen);
    this.parseData(this.conf.data);
  },
  components: { LeapSelect },
  mounted() {
    this.container = this.$refs.container;
    this.init();
    this.draw();
  },
  methods: {
    init() {
      let vm = this;
      vm.qUContainer = d3.select(vm.$refs.qUContainer);
      vm.qUChart = d3BI.baseChart()
        .x(function(d) { return d.label })
        .y(function(d) { return d.value })
        .y2(function(d) { return d.y2 })
        .margin({ top: 15, right: 20, left: 15, bottom: 10 });
      vm.qUChart.axisLines.showAll({ x: false, y: false });
      vm.qUChart.xAxis.title("批次").textRotate(-50).maxTextLength(10);
      vm.qUChart.yAxis.title("率").domainToZero(true).axis().ticks(5);
      vm.qUChart.y2Axis.title("里程").axis().ticks(5);

      vm.qDContainer = d3.select(vm.$refs.qDContainer);
      vm.qDChart = d3BI.baseChart()
        .x(function(d) { return d.label })
        .y(function(d) { return d.value })
        .margin({ top: 15, right: 20, left: 15, bottom: 10 });
      vm.qDChart.axisLines.showAll({ x: false, y: false });
      vm.qDChart.xAxis.title("月").maxTextLength(10);
      vm.qDChart.yAxis.title("率").domainToZero(true).axis().ticks(5);
    },
    selectQDOption(args) {
      this.selectedQDOption = args.value;
      this.parseData(this.conf.data);
      this.drawQDChart();
    },
    drawQUChart(){
      let vm = this,
        chartHeight = (vm.container.parentNode.clientHeight - 53 - 34) / 2 + 'px';
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
    drawQDChart(){
      let vm = this,
        chartHeight = (vm.container.parentNode.clientHeight - 53 - 34) / 2 + 'px';
      vm.qDContainer.style('height', chartHeight);
      if (vm.qDContainer.select('svg').size()) {
        vm.qDContainer
          .select('svg')
          .datum(function(d) { return vm.qDData ? vm.qDData : d })
          .call(vm.qDChart);
      } else {
        vm.qDContainer
          .append('svg')
          .datum(vm.qDData)
          .call(vm.qDChart);
      }
    },
    draw() {
      this.drawQUChart();
      this.drawQDChart();
    },
    parseUData(data) {
      let chartData = function(_hgData, _hgbzData, _zlcData, _hglcData) {
        return [{
          type: 'bar',
          name: '合格率',
          label: {
            x: '批次',
            y: '合格率',
            name: ''
          },
          color: 'rgb(0, 201, 255)',
          values: _hgData
        }, {
          type: 'bar',
          name: '合格标准',
          label: {
            x: '批次',
            y: '合格标准',
            name: ''
          },
          color: 'rgb(43, 162, 41)',
          values: _hgbzData
        }, {
          type: 'line',
          name: '总里程',
          axis: 'y2',
          label: {
            x: '批次',
            y: '总里程',
            name: ''
          },
          color: 'rgb(178, 18, 176)',
          values: _zlcData
        }, {
          type: 'line',
          name: '合格里程',
          axis: 'y2',
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
            label: _d['外业批次'],
            value: _d['合格率']
          };
        }),
        hgbzData = data.up.map(_d => {
          return {
            label: _d['外业批次'],
            value: _d['合格标准']
          }
        }),
        zlcData = data.up.map(_d => {
          return {
            label: _d['外业批次'],
            value: _d['合格率'],
            y2: _d['总里程']
          }
        }),
        hglcData = data.up.map(_d => {
          return {
            label: _d['外业批次'],
            value: _d['合格率'],
            y2: _d['合格里程']
          }
        });
      this.qUData = chartData(hglData, hgbzData, zlcData, hglcData);
    },
    windowResized: function(args) {
      if (args.id == this.$props.tileId) {
        this.draw();
      };
    },
    toggleFullScreen(args){
      if (args.id == this.$props.tileId) {
        this.draw();
      };
    },
    parseDData(data) {
      let chartData = function(_cwlData, _cwlbzData, _cwlclData, _cwlclbzData) {
        return [{
          type: 'line',
          name: '错误率',
          label: {
            x: '月',
            y: '错误发生率',
            name: ''
          },
          color: 'rgb(0, 201, 255)',
          values: _cwlData
        }, {
          type: 'line',
          name: '错误发生率标准',
          dashed: "3, 3",
          label: {
            x: '月',
            y: '错误发生率标准',
            name: ''
          },
          color: 'rgb(0, 201, 255)',
          values: _cwlbzData
        }, {
          type: 'line',
          name: '错误流出率',
          label: {
            x: '月',
            y: '错误流出率',
            name: ''
          },
          color: 'rgb(178, 18, 176)',
          values: _cwlclData
        }, {
          type: 'line',
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
            value: _d['错误发生率']
          };
        }),
        cwlbzData = data.down[this.selectedQDOption].map(_d => {
          return {
            label: _d['月'],
            value: _d['错误发生率标准']
          }
        }),
        cwlclData = data.down[this.selectedQDOption].map(_d => {
          return {
            label: _d['月'],
            value: _d['错误流出率']
          }
        }),
        cwlclbzData = data.down[this.selectedQDOption].map(_d => {
          return {
            label: _d['月'],
            value: _d['错误流出率标准']
          }
        });
      this.qDData = chartData(cwlData, cwlbzData, cwlclData, cwlclbzData);
    },
    parseData(data) {
      if (!TypeChecker.isObject(data)) return;
      this.parseUData(data);
      this.parseDData(data);
    }
  },
  beforeDestroy: function() {
    eventHub.$off("tile-window-resized", this.windowResized);
    eventHub.$off("tile-full-screen-inner", this.toggleFullScreen);
  }
}
