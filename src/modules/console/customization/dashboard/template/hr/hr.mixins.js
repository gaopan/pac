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
      hUData: null,
      hDData: null
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
      vm.hUContainer = d3.select(vm.$refs.hUContainer);
      this.hUChart = d3BI.pieChart();
      this.hUChart.legend.visibility(true);
      this.hUChart.margin({bottom:40});
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
      vm.hDChart = d3BI.baseChart()
        .x(function(d) { return d.label })
        .y(function(d) { return d.value })
        .margin({ top: 15, right: 20, left: 15, bottom: 10 });
      vm.hDChart.axisLines.showAll({ x: false, y: false });
      vm.hDChart.xAxis.title("月").maxTextLength(10);
      vm.hDChart.yAxis.title("人数").domainToZero(true).axis().ticks(5);
    },
    draw() {
      let vm = this,
        chartHeight = (vm.container.parentNode.clientHeight - 34 - 34) / 2 + 'px';
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
      if(!TypeChecker.isObject(data) || TypeChecker.isArray(data.degree)) {
        vm.hUData = [];
      }
      let d = [], total = 0;
      data.degree.forEach(_d => {
        _d.total = _d['1月人数'] + _d['2月人数'] + _d['3月人数'] + _d['4月人数'];
        total += _d.total;
      });
      data.degree.forEach(_d => {
        d.push({
          label: _d['学历'],
          value: _d.total,
          percentage: Math.round(_d.total / total * 100)
        });
      });
      vm.hUData = d;
    },
    parseDData(data) {
      let vm = this;
      if(!TypeChecker.isObject(data) || TypeChecker.isArray(data.recruit)) {
        vm.hDData = [];
      }
      let chartData = function(_yjdgData, _sjdgData) {
        return [{
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
        }];
      };

      let yjdgData = data.recruit.map(d => {
        return {
          label: d['月份'],
          value: d['本月预计到岗人数']
        }
      }), sjdgData = data.recruit.map(d => {
        return {
          label: d['月份'],
          value: d['本月实际到岗人数']
        }
      });

      vm.hDData = chartData(yjdgData, sjdgData);
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
