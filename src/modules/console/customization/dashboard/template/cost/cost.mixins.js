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
            <!-- <span>成本目标</span> -->
            <span>成本</span>
          </div>
          <div class="chart-container" v-show = "selectedType == '外业'">
            <div class = "hD-container-1" ref="hDContainer"></div>
            <div class = "hD-container-2" ref="hDContainer2"></div>            
          </div>
          <div class="chart-container" v-show = "selectedType == '内业'">
            <div class = "hD-container-3" ref="hDContainer3"></div>
          </div>

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
      hDChart3: null,
      selectedType: '内业',
      typeOptions: [{ name: '内业', value: '内业' }, { name: '外业', value: '外业' }],
      comments: null,
      ifFullScreen: false,

      chartHeight:null
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

      vm.hUChart.axisLines.showAll({ x: false, y: true });
      vm.hUChart.xAxis.title("月").maxTextLength(10);
      vm.hUChart.yAxis.title("总成本(元)").domainToZero(true).axis().ticks(5);
      vm.hUChart.y2Axis.title("总公里数(公里)").axis().ticks(5);

      // vm.hDContainer = d3.select(vm.$refs.hDContainer);

      vm.hDChart = d3BI.baseChart()
        .x(function(d) { return d.label })
        .y(function(d) { return d.value })
        // .y2(function(d) { return d.y2 })
        .margin({ top: 15, right: 20, left: 15, bottom: 10 });

      vm.hDChart.axisLines.showAll({ x: false, y: true });
      vm.hDChart.xAxis.title("月").textRotate(-40).maxTextLength(10);
      vm.hDChart.yAxis.title("成本(元/公里)").domainToZero(true).axis().ticks(5);
 
      vm.hDChart2 = d3BI.baseChart()
        .x(function(d) { return d.label })
        .y(function(d) { return d.value })
        // .y2(function(d) { return d.y2 })
        .margin({ top: 15, right: 20, left: 15, bottom: 10 });

      vm.hDChart2.axisLines.showAll({ x: false, y: true });
      vm.hDChart2.xAxis.title("月").textRotate(-40).maxTextLength(10);
      vm.hDChart2.yAxis.title("成本(元/公里)").domainToZero(true).axis().ticks(5);
      
      vm.hDChart3 = d3BI.baseChart()
        .x(function(d) { return d.label })
        .y(function(d) { return d.value })
        .margin({ top: 15, right: 20, left: 15, bottom: 10 });

      vm.hDChart3.axisLines.showAll({ x: false, y: true });
      vm.hDChart3.xAxis.title("月").maxTextLength(10);
      vm.hDChart3.yAxis.title("成本(元/公里)").domainToZero(true).axis().ticks(5);

      
    },
    selectType(args) {
      this.selectedType = args.value;
    },
    draw() {
      let vm = this,
          chartHeight = !!this.chartHeight ? this.chartHeight : this.chartHeight = (vm.container.parentNode.clientHeight - 38 - 38 - 52 - 4) / 2 + 'px';      

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

      d3.select(vm.$refs.hDContainer3).style('height', chartHeight);      

      if(vm.selectedType == '内业'){
        setTimeout(function(){
          console.log(vm.hDData);
          if (d3.select(vm.$refs.hDContainer3).select('svg').size()) {
            d3.select(vm.$refs.hDContainer3)
              .select('svg')
              .datum(function(d) { return vm.hDData ? vm.hDData : d })
              .call(vm.hDChart3);
          } else {
            d3.select(vm.$refs.hDContainer3)
              .append('svg')
              .datum(vm.hDData)
              .call(vm.hDChart3);
          }

        },0)   

      }else{
        setTimeout(function(){
          let hDData = divideData(vm.hDData);

          d3.select(vm.$refs.hDContainer).style('height', chartHeight);
          d3.select(vm.$refs.hDContainer2).style('height', chartHeight);

          if (d3.select(vm.$refs.hDContainer).select('svg').size()) {
            d3.select(vm.$refs.hDContainer)
              .select('svg')
              .datum(function(d) { return hDData.chart1 ? hDData.chart1 : d })
              .call(vm.hDChart);
          } else {
             d3.select(vm.$refs.hDContainer)
              .append('svg')
              .datum(hDData.chart1)
              .call(vm.hDChart);
          }

          if (d3.select(vm.$refs.hDContainer2).select('svg').size()) {
             d3.select(vm.$refs.hDContainer2)
              .select('svg')
              .datum(function(d) { return hDData.chart2 ? hDData.chart2 : d })
              .call(vm.hDChart2);
          } else {
             d3.select(vm.$refs.hDContainer2)
              .append('svg')
              .datum(hDData.chart2)
              .call(vm.hDChart2);
          }
        },0)

      }

      function divideData(data){
        let chart1 = [], chart2 = [];
        if(Array.isArray(data)){
          data.forEach(d=>{
            if(d.name === "市区成本" || d.name === "市区成本目标"){
              chart1.push(d);
            }else if(d.name === "高速成本" || d.name === "高速成本目标"){
              chart2.push(d);
            }
          })
        }

        return { chart1, chart2 }
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
            value: (_d['总成本']).toFixed(1)
          };
        }),
        zglData = d.map(_d => {
          return {
            label: _d['月'],          
            y2: (_d['总公里数']).toFixed(1),
          };
        });

      return chartData(zcbData, zglData);
    },
    parseDData(d, chartData) {
      let vm = this;
      let cbData = null,
          cbmbData = null,
          sqcbData = null,
          sqcbmbData = null,
          gscbData = null,
          gscbmbData = null;

      if (vm.selectedType == '内业') {
        cbData = d.map(_d => {
          return {
            label: _d['月'],
            value: (_d['成本']).toFixed(1)
          };
        });
        cbmbData = d.map(_d => {
          return {
            label: _d['月'],
            value: (_d['成本目标']).toFixed(1),
          };
        });
      } else {
        sqcbData = d.map(_d => {
          return {
            label: _d['月'],
            value: (_d['市区成本']).toFixed(1)
          };
        });

        sqcbmbData = d.map(_d => {
          return {
            label: _d['月'],
            value: (_d['市区成本目标']).toFixed(1),
          };
        });

        gscbData = d.map(_d => {
          return {
            label: _d['月'],
            value: (_d['高速成本']).toFixed(1)
          };
        });

        gscbmbData = d.map(_d => {
          return {
            label: _d['月'],
            value: (_d['高速成本目标']).toFixed(1),
          };
        });
      }

      return chartData(cbData, cbmbData, sqcbData, sqcbmbData, gscbData, gscbmbData);

    },
    parseData(data) {
      let vm = this;
      let hUChartData = function(_zcbData, _zglData) {
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
        }];
      };
      let hDChartData = function(_cbData, _cbmbData, _sqcbData, _sqcbmbData, _gscbData, _gscbmbData) {
        let _data = null;
        if (vm.selectedType == '内业') {
          _data = [{
            type: "bar",
            name: '成本',
            label: {
              x: '月',
              y: '成本',
              name: ''
            },
            color: 'rgb(0, 201, 255)',
            values: _cbData
          }, {
            type: 'bar',
            name: '成本目标',
            label: {
              x: '月',
              y: '成本目标',
              name: ''
            },
            dashed: '3 3',
            color: 'rgb(43, 162, 41)',
            values: _cbmbData
          }];
        } else {
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
            type: 'bar',
            name: '市区成本目标',
            label: {
              x: '月',
              y: '市区成本目标',
              name: ''
            },
            color: 'rgb(43, 162, 41)',
            values: _sqcbmbData
          }, {
            type: "bar",
            name: '高速成本',
            label: {
              x: '月',
              y: '高速成本',
              name: ''
            },
            color: 'rgb(0, 201, 255)',
            values: _gscbData
          }, {
            type: 'bar',
            name: '高速成本目标',
            label: {
              x: '月',
              y: '高速成本目标',
              name: ''
            },
            color: 'rgb(43, 162, 41)',
            values: _gscbmbData
          }];
        }
        return _data;
      };

      let fillMonth = function (months, year, module) {
        let fullMonth = [];
        months = TypeChecker.isArray(months) ? months : [];

        for (let i = 1; i <= 12; i++) {
          let monthData = null;

          months.every(month => {
            if (month['月'] === `${year}-${i}`) {
              monthData = month;
              return false;
            }
            return true;
          })

          if (!!monthData) {
            fullMonth.push(monthData);
          } else {

            if(module === 'inner'){
              fullMonth.push({
                备注:"",
                总公里数:0,
                总成本:0,
                成本:0,
                成本目标:0,
                月:`${year}-${i}`,
                累计总公里数:0             
              });
            }else{
              fullMonth.push({
                市区成本:0,
                市区成本目标:0,
                总公里数:0,
                总成本:0,
                月:`${year}-${i}`,
                累计总公里数:0,
                高速成本:0,
                高速成本目标:0,  
              })          
            }

          }
        }

        return fullMonth;
      };

      if (!TypeChecker.isObject(data) || !TypeChecker.isArray(data[this.selectedType])) {
        this.hUData = hUChartData([]);
        this.hDData = hDChartData([]);
        return;
      }

      let d = data[this.selectedType],
          selectedYear = this.$props.conf.curMonth.split('-')[0],
          module = this.selectedType === '外业'? 'outer':'inner';

      let fullMonthData = fillMonth(d, selectedYear, module);

      // this.parseUData(d, hUChartData);
      // this.parseDData(d, hDChartData);
      this.hUData = this.parseUData(fullMonthData, hUChartData);
      this.hDData = this.parseDData(fullMonthData, hDChartData);
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
