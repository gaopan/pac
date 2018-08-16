import * as d3 from 'd3'
import * as d3BI from '@/lib/d3-bi/index.js'
import SVG from 'svg.js'
import shared from "@/shared.js"
import TabbedChart from '@/components/chart/tabbed-chart/TabbedChart.vue'
import TypeChecker from '@/utils/type-checker.js'
import Common from '../common.js'
import Internationalization from '@/utils/internationalization.js'

var eventHub = shared.eventHub;

export default {
  template: `<tabbed-chart :tabList="tabs" :pagging="pagging" @change="onChangedTab" >
    <div slot="tabbed-header"></div>
    <div class="case-trend" slot="tabbed-body">
      <div ref="container"></div>
    </div>
  </tabbed-chart>`,
  props: {
    conf: {
      validator: function(_conf){
        if(!TypeChecker.isObject(_conf)) return false;
        if(!TypeChecker.isArray(_conf.groups)) return false;
        return true;
      }
    },
    tileId: {
      type: String,
      required: true
    }
  },
  components: { TabbedChart },
  data() {
    return {
      tabs: null,
      data: null,
      newCurrentTabLabel:null,
      pagging: null,
      selectedTab: null,
      createCompo:true
    }
  },
  created: function() {
    this.chart = null;
    this.container = null;
    eventHub.$on("tile-window-resized", this.windowResized);
    this.tabs = Common.parseTabsFromOnlyGroups(this.$props.conf.groups, 1);
    let vm = this;
    this.pagging = {
      pageSize: 10,
      pageIndex: 1,
      total: 0,
      onPageChange: function(pageIndex) {
        vm.$props.conf.notifyInjectData.call(vm, {
          type: 'fetch',
          data: {
            pageIndex: vm.pagging.pageIndex = pageIndex,
            pageSize: vm.pagging.pageSize,
            field: vm.selectedTab.groupBy.value
          }
        });
      }
    };
  },
  watch: {
    "conf.data": {
      handler(val) {
        if(val){
          let tempData = this.data = this.parseData(val.list);
          this.pagging.total = val.total;
          this.draw(tempData);
        }else{
          //fix bug #4956 hong-yu.chen@hpe
          this.pagging.total = 0;
          let tempData = this.data = this.parseData([]);
          this.draw(this.parseData([]));
        }
      },
      deep: true
    },
    "conf.groups": {
      handler(val){
        this.tabs = Common.parseTabsFromOnlyGroups(val, 1);
      },
      deep: true
    }
  },
  mounted: function() {
    this.init();
    this.draw();
  },
  methods: {
    init() {
      let vm = this;
      vm.container = d3.select(vm.$refs.container);
      vm.chart = d3BI.baseChart('bar')
        .x(function(d) { return d.label })
        .y(function(d) { return d.value })
        .margin({ top: 15, right: 20, left: 15, bottom: 10 });
      vm.chart.axisLines.showAll({ x: false, y: true });
      vm.chart.xAxis.textRotate(-50).maxTextLength(10);
      vm.chart.xAxis.axis().ticks(5);
      vm.chart.yAxis.domainToZero(true)
      vm.chart.tooltipDispatch.on('click', function(args, ele, config) {
        let getDate = vm.countFilterDate(args);
        //18th April 2018 - muhammad-azhaziq.bin-mohd-azlan-goh@dxc.com - US1901 Task 5044 - The way for date always started (Can check with Tian again if this is an issue)
        // getDate.way = vm.selectedTab.groupBy.name;
        // getDate.way = (vm.selectedTab.groupBy.name == "EndTime")?"started":"started";
        getDate.way = "started";
        getDate.field = vm.selectedTab.groupBy.value;
        (vm.$props.conf.opts && vm.$props.conf.opts.onClickItem) && vm.$props.conf.opts.onClickItem(getDate);
      });
    },
    countFilterDate(data) {
      return {
        startDate: data.data.startTime,
        endDate: data.data.endTime
      }
    },
    parseData(data) {
      let chartData = function(_data) {
        return [{
          name: 'Spot',
          label: {
            x: 'date',
            y: 'case count',
            name: 'name'
          },
          color: 'rgb(0, 201, 255)',
          values: _data
        }];
      };

      if (!TypeChecker.isArray(data)) {
        return chartData([]);
      };

      let massagedData = data.map(d => {
        let monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],dArr = d.name.split("-"),
        obj = {
          day:Number(dArr[2]),
          month:Number(dArr[1]),
          year:Number(dArr[0]),
          key:d.name,
          value: d.count
        };
        if(dArr[2] === '0' && dArr[1] === '0'){
          obj.label = dArr[0];
          obj.startTime = dArr[0] + "-01-01T00:00:00.000Z";
          obj.endTime =(obj.year + 1).toString() + "-01-01T00:00:00.000Z";
        }else if(dArr[2] === '0'&& dArr[1] !== '0'){
          obj.label = monthNames[obj.month - 1] + "-" + dArr[0].substr(2, 2);
          let t = dArr[0]+ "-" + dArr[1] + "-01", mon = new Date(t); 
          mon.setMonth(mon.getMonth()+1);
          obj.startTime = t + "T00:00:00.000Z";
          obj.endTime = mon.toISOString();
        }else if(dArr[2] !== '0'&& dArr[1] !== '0'){
          obj.label = obj.day + "-" + monthNames[obj.month - 1];
          let mon = new Date(obj.key); 
          mon.setDate(mon.getDate()+1);
          obj.startTime = obj.key + "T00:00:00.000Z";
          obj.endTime = mon.toISOString();
        }
        return obj
      });

      massagedData.sort((a, b) => {
        return a.year - b.year || a.month - b.month || a.day - b.day;
      });
      
      return chartData(massagedData);
    },
    draw(data) {
      let vm = this;
      let containerElem = this.container.node();
      let chartHeight = containerElem.offsetParent.clientHeight - containerElem.offsetTop + 'px'
      vm.container.style('height', chartHeight);
      if (vm.container.select('svg').size()) {
        vm.container
          .select('svg')
          .datum(function(d) { return data ? data : d })
          .call(vm.chart);
      } else {
        vm.container
          .append('svg')
          .datum(data)
          .call(vm.chart);
      }
    },
    windowResized: function(args) {
      if (args.id == this.$props.tileId) {
        this.draw(this.data);
      };
    },
    onChangedTab(args) {
      if(TypeChecker.isFunction(this.$props.conf.notifyInjectData)) {
        this.selectedTab = args.selected;
        this.$props.conf.notifyInjectData.call(this, {
          // 'shunt': result of four charts in one request, 
          //'fetch': only refresh one charts data
          //use "fetch" when user toogle different view(createCompo)
          //edited by Hong-Yu hong-yu.chen@hpe
          type: args.default && this.createCompo ? 'shunt' : 'fetch', 
          data: {
            pageIndex: this.pagging.pageIndex = 1,
            pageSize: this.pagging.pageSize,
            field: args.selected.groupBy.value
          }
        });
        this.createCompo = false;
      }
      //update stored label
      // if(TypeChecker.isFunction(this.$props.conf.tabSwitch)) {
      //   this.$props.conf.tabSwitch.call(this, {
      //     label:args.selected.groupBy,
      //     default:args.default
      //   });
      // }      
    }
  },
  beforeDestroy: function() {
    eventHub.$off("tile-window-resized", this.windowResized);
  }
}
