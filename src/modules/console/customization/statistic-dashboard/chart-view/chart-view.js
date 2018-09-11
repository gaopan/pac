import * as d3 from 'd3'
import * as d3BI from '@/lib/d3-bi/index.js'
import TypeChecker from '@/utils/type-checker.js'
import CommonUtils from '@/utils/common-utils.js'
import CommonGenerators from '@/utils/common-generators.js'

const ColorGenerator = CommonGenerators.ColorGenerator;

export default {
  props: {
    data: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
    	chartData: null
    };
  },
  mounted() {
    this.init();
    this.parseData(this.$props.data);
  },
  methods: {
    init() {
      let vm = this;
      vm.container = d3.select(vm.$refs.container);
      vm.chart = d3BI.baseChart()
        .x(function(d) { return d.label })
        .y(function(d) { return d.value })
        .y2(function(d) { return d.y2 })
        .margin({ top: 15, right: 20, left: 15, bottom: 10 });
      vm.chart.axisLines.showAll({ x: false, y: false });
      vm.chart.xAxis.title("月").textRotate(-50).maxTextLength(10);
      vm.chart.yAxis.title("人数").domainToZero(true).axis().ticks(5);
      vm.chart.y2Axis.title("小时").axis().ticks(5);
    },
    draw(){
    	let vm = this,
        chartHeight = vm.$refs.container.parentNode.clientHeight + 'px';
      vm.container.style('height', chartHeight);
      if (vm.container.select('svg').size()) {
        vm.container
          .select('svg')
          .datum(function(d) { return vm.chartData ? vm.chartData : d })
          .call(vm.chart);
      } else {
        vm.container
          .append('svg')
          .datum(vm.chartData)
          .call(vm.chart);
      }
    },
    parseData(data) {
      if (!data || !data.months || data.months.length < 1 || !data.months[0].data) return;
      let barProps = ["企业员工人数", "研发人员人数"];

      let chartConfigs = [];

      Object.keys(data.months[0].data).sort((a, b) => a.localeCompare(b)).forEach(key => {
        if (barProps.indexOf(key) > -1) {
          let barConfig = {
            type: 'bar',
            name: key,
            label: {
              x: '月',
              y: key,
              name: ''
            },
            color: ColorGenerator.purchase(key).value,
            values: data.months.map(monthData => {
              return {
                label: monthData.month,
                value: monthData.data[key]
              }
            })
          };
          chartConfigs.push(barConfig);
        } else {
          let lineConfig = {
            type: 'line',
            name: key,
            axis: 'y2',
            label: {
              x: '月',
              y: key,
              name: ''
            },
            color: ColorGenerator.purchase(key).value,
            values: data.months.map(monthData => {
              return {
                label: monthData.month,
                value: monthData.data[key],
                y2: monthData.data[key]
              }
            })
          }
          chartConfigs.push(lineConfig);
        }
      });

      this.chartData = chartConfigs;
      console.log(chartConfigs);

      this.draw();
    }
  }

}
