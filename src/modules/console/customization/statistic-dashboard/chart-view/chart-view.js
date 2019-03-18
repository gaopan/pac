import * as d3 from 'd3'
import * as d3BI from '@/lib/d3-bi/index.js'
import TypeChecker from '@/utils/type-checker.js'
import CommonUtils from '@/utils/common-utils.js'
import CommonGenerators from '@/utils/common-generators.js'
import DataUtils from '@/utils/data-utils.js'

const ColorGenerator = CommonGenerators.ColorGenerator;

export default {
  props: {
    data: {
      type: Array,
      required: true
    },
    selectedYear: String
  },
  data() {
    return {
      chartData: null
    };
  },
  mounted() {
    this.init();
    this.parseData(CommonUtils.deepClone(this.$props.data));
  },
  watch: {
    data() {
      this.parseData(CommonUtils.deepClone(this.$props.data));
    }
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
      vm.chart.yAxis.title("小时").domainToZero(true).axis().ticks(5);
      vm.chart.y2Axis.title("人数").domainToZero(true).axis().ticks(5);
    },
    draw() {
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
      if (!data || data.length < 1) return;
      let barProps = ["实际工作时长", "研发人员实际工作时长"],
        lineProps = ["企业员工人数", "研发人员人数"],
        barColor = {
          "实际工作时长": 'rgb(142,121,242)',
          "研发人员实际工作时长": 'rgb(77,54,187)'
        },
        vm = this;

      let chartConfigs = [];      

      data.sort((a, b) => a.key.localeCompare(b.key)).forEach(item => {
        // console.log();

        if (barProps.indexOf(item.name) > -1) {
          let barConfig = {
            type: 'bar',
            name: item.name,
            label: {
              x: '月',
              y: item.name,
              name: ''
            },
            color: barColor[item.name],
            values: fillMonth(item.months, vm.selectedYear).map(monthData => {
              return {
                label: monthData.month,
                value: +(monthData.value).toFixed(1)
              }
            }).sort((a, b) => {
              return DataUtils.monthComparison(a.label, b.label)
            })
          };
          chartConfigs.push(barConfig);
        }
        if (lineProps.indexOf(item.name) > -1) {
          let lineConfig = {
            type: 'line',
            name: item.name,
            axis: 'y2',
            label: {
              x: '月',
              y: item.name,
              name: ''
            },
            color: ColorGenerator.purchase(item.name).value,
            values: item.months.map(monthData => {
              return {
                label: monthData.month,
                value: monthData.value,
                y2: monthData.value
              }
            }).sort((a, b) => {
              return DataUtils.monthComparison(a.label, b.label)
            })
          }
          chartConfigs.push(lineConfig);
        }
      });

      function fillMonth(months, year) {
        let fullMonth = [];
        months = TypeChecker.isArray(months) ? months : [];

        for (let i = 1; i <= 12; i++) {
          let monthData = null;

          months.every(month => {
            if (month.month === `${year}-${i}`) {
              monthData = month;
              return false;
            }
            return true;
          })

          if (!!monthData) {
            fullMonth.push(monthData);
          } else {
            fullMonth.push({
              month: `${year}-${i}`,
              value: 0              
            });
          }
        }

        return fullMonth;
      }
      
      this.chartData = chartConfigs;

      this.draw();
    }
  }

}
