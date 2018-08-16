import * as d3 from 'd3'
import * as d3BI from '@/lib/d3-bi/index.js'
import shared from '@/shared.js'
import TypeChecker from '@/utils/type-checker.js'
import TabbedChart from '@/components/chart/tabbed-chart/TabbedChart.vue'
import Common from '../common.js'
import Internationalization from '@/utils/internationalization.js'

let eventHub = shared.eventHub

export default {
  template: `
    <tabbed-chart :tabList="tabList" :pagging="pagging" @change="tabChanged">
      <div slot="tabbed-header"></div>
      <div class="value-comparison" slot="tabbed-body">
        <div class="buttons">
          <ul>
            <li v-for="button in buttons">
              <a :class="{active: activeButton.index === button.index}"
                @click="buttonChanged(button)"
                href="javascript: void(0);">
                {{button.name}}
              </a>
            </li>
          </ul>
        </div>
        <div class="chart" ref="container"></div>
      </div>
    </tabbed-chart>
  `,
  props: {
    tileId: {
      type: String,
      required: true
    },
    conf: {
      validator: function(_conf){
        if(!TypeChecker.isObject(_conf)) return false;
        if(!TypeChecker.isArray(_conf.groups)) return false;
        return true;
      }
    },
  },
  data() {
    return {
      tabList: [],
      buttons: [],
      activeButton: {},
      pagging: null,
      createCompo: true
    }
  },
  watch: {
    "conf.data": {
      handler(val) {
        if (val) {
          this.pagging.total = val.total;
          this.data = this.dataAdapter(val);
          this.updateChart(this.getDisplayedData());
        } else {
          this.pagging.total = 0;
          this.data = this.dataAdapter({ list: [], total: 0 });
          this.updateChart(this.getDisplayedData());
        }
      },
      deep: true
    },
    "conf.groups": {
      handler(val) {
        this.tabList = Common.parseTabsFromOnlyGroups(val, 2);
      },
      deep: true
    }
  },
  created() {
    let vm = this;

    this.getX = d => d.value;
    this.getY = d => d.label;
    this.hContainer = null;
    this.horBarChart = null;

    this.buttons = buttons();
    this.activeButton = this.buttons[0];

    this.data = this.dataAdapter(this.conf.data);
    this.tabList = Common.parseTabsFromOnlyGroups(this.conf.groups, 2);

    this.selectedTab = null;
    this.pageSize = 10;
    this.pageIndex = 1;
    this.pagging = {
      pageSize: this.pageSize,
      pageIndex: this.pageIndex,
      total: 0,
      onPageChange: function(pageIndex) {
        vm.pageIndex = pageIndex;
        vm.pagging.pageIndex = pageIndex;
        vm.conf.notifyInjectData.call(vm, {
          type: 'fetch',
          data: {
            pageIndex: vm.pageIndex,
            pageSize: vm.pageSize,
            field: vm.selectedTab.groupBy.value,
            groupBy: vm.selectedTab.groupBy.value
          }
        });
      }
    };

    eventHub.$on('tile-window-resized', this.windowResized);

    function buttons() {
      return [{
        index: 0,
        key: 'caseCount',
        name: Internationalization.translate('Case Count')
      }, {
        index: 1,
        key: 'cycleTime',
        name: Internationalization.translate('Cycle Time')
      }]
    }
  },
  mounted() {
    this.initChart();
    this.updateChart(this.getDisplayedData());
  },
  methods: {
    tabChanged(args) {
      if(TypeChecker.isFunction(this.conf.notifyInjectData)) {
        this.selectedTab = args.selected;
        this.conf.notifyInjectData.call(this, {
          type: args.default && this.createCompo ? 'shunt' : 'fetch',
          data: {
            pageIndex: this.pageIndex,
            pageSize: this.pageSize,
            field: args.selected.groupBy.value
          }
        });

        this.createCompo = false;
      }
    },
    buttonChanged(button) {
      if (button.index === this.activeButton.index) return ;
      this.activeButton = button;
      this.updateChart(this.getDisplayedData());
    },
    dataAdapter(d) {
      let data = Common.convertDataToArrayFormat(d);

      let vm = this,
        resData = {},
        label2 = Internationalization.translate('Case Count'),
        color1 = '#FFAF3A',
        color2 = '#B212B0';

      if (!TypeChecker.isArray(data)) return resData;

      let cycleTimeValues = [],
        caseCountValues = [],
        cycleTimeTimeGrade = 'N/A';

      if (data.length) {
        cycleTimeValues = transformToTargetData(data, 'cycleTime');
        caseCountValues = transformToTargetData(data, 'caseCount');

        cycleTimeTimeGrade = getRightTimeGrade(cycleTimeValues);
        cycleTimeValues = convertDataByTimeGrade(cycleTimeValues, cycleTimeTimeGrade);

        cycleTimeValues.sort((a, b) => b.label.localeCompare(a.label));
        caseCountValues.sort((a, b) => b.label.localeCompare(a.label));
      }

      resData = {};
      resData.cycleTime = {
        label: {
          x: cycleTimeTimeGrade,
          y: getRightName()
        },
        color: color1,
        values: cycleTimeValues
      };
      resData.caseCount = {
        label: {
          x: label2,
          y: getRightName()
        },
        color: color2,
        values: caseCountValues
      };

      return resData;

      function tempData() {
        return  {
          "invoiceType": [
            {
              "name": "PO",
              "cycleTime": 13,
              "caseCount": 8,
              "percentage": 28.57
            },
            {
              "name": "Non-PO",
              "cycleTime": 12,
              "caseCount": 20,
              "percentage": 71.43
            }
          ]
        };
      }
      function transformToTargetData(data, key) {
        return data.map(d => {
          return {
            label: d.name,
            value: d[key]
          }
        });
      }
      function getRightName(str) {
        if (!str && vm.selectedTab && vm.selectedTab.groupBy.name) {
          str = vm.selectedTab.groupBy.name;
        } else {
          if (!str) return 'N/A';
        }

        let res = '';
        str.split(/([A-Z])/).forEach(s => {
          if (s.length) {
            if (/[A-Z]/.test(s)) {
              res += ' ' + s;
            } else {
              res += s;
            }
          }
        });

        return res.trim();
      }
      function getRightTimeGrade(data) {
        let timeGrade = '', sumSecond = 0, averageSecond = 0;
        
        if (TypeChecker.isArray(data)) {
          data.forEach(function(ele){ sumSecond += +vm.getX(ele)});
          averageSecond = sumSecond / data.length;
        }

        if (averageSecond <= 60) {
          timeGrade = 'Seconds';
        }else if (averageSecond <= 60 * 60){
          timeGrade = 'Minutes';
        }else if (averageSecond <= 60 * 60 * 24) {
          timeGrade = 'Hours';
        }else {
          timeGrade = 'Days';
        }

        return timeGrade;
      }
      function convertDataByTimeGrade(data, timeGrade) {
        let key = 'value';
        switch (timeGrade.toUpperCase()) {
          case 'SECONDS':
            // data.forEach(function(ele){ ele[key] = parseFloat( ele[key].toFixed(1) ) });
          break;
          case 'MINUTES':
            data.forEach(function(ele){ ele[key] = parseFloat( (ele[key]/60).toFixed(1) ) });
          break;
          case 'HOURS':
            data.forEach(function(ele){ ele[key] = parseFloat( (ele[key]/60/60).toFixed(1) ) });
          break;
          case 'DAYS':
            data.forEach(function(ele){ ele[key] = parseFloat( (ele[key]/60/60/24).toFixed(1) ) });
          break;
        }
        return data;
      }
    },
    getDisplayedData() {
      let button = this.activeButton.key;
      return this.data[button] ? [this.data[button]] : [];
    },
    initChart() {
      let vm = this;

      this.hContainer = d3.select(vm.$refs.container);
      this.horBarChart = d3BI.baseChart('horizontalBar');

      this.horBarChart
        .x(this.getX)
        .y(this.getY)
        .margin({top: 0, right: 15, bottom: 0, left: 0});
      this.horBarChart.xAxis
        .titleDistance(10)
        .givenDomain(transformDomain);
      this.horBarChart.xAxis.axis().ticks(5);
      this.horBarChart.yAxis.maxTextLength(15);
      this.horBarChart.tooltipDispatch.on('click', barClick);

      function transformDomain(domain) {
        domain[1] = 1.5 * domain[1];
        if (domain[0] > 0) domain[0] = 0;
        return domain;
      }
      function barClick(args) {
        if (vm.$props.conf.opts && vm.$props.conf.opts.onClickItem) {
          vm.conf.opts.onClickItem(args, d3.select(this), {
            getY: vm.getY,
            field: vm.selectedTab.groupBy.value
          });
        }
      }
    },
    updateChart(data) {
      let vm = this;

      if (TypeChecker.isArray(data) && data[0] && data[0].label) {
        this.horBarChart.xAxis.title(data[0].label.x);
      }

      this.hContainer.style('height', getChartHeight());
      if( this.hContainer.select('svg').size() ) {
        this.hContainer
          .select('svg')
          .datum(function(d) {return data ? data : d})
          .call(this.horBarChart);
      }else {
        this.hContainer
          .append('svg')
          .datum(data)
          .call(this.horBarChart);
      }

      function getChartHeight() {
        let chartBox = vm.hContainer.node();
        let allHeight = chartBox.offsetParent.clientHeight,
          offsetTop = chartBox.offsetTop,
          parentPadding = parseFloat(d3.select(chartBox.parentNode).style('padding-bottom'));
        return allHeight - offsetTop - parentPadding + 'px';
      }
    },
    windowResized(args) {
      if (args.id == this.tileId) this.updateChart(null);
    }
  },
  beforeDestroy() {
    eventHub.$off('tile-window-resized', this.windowResized);
  },
  components: {TabbedChart}
}