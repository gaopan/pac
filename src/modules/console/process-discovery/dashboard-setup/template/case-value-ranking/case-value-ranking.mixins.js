import * as d3 from 'd3'
import * as d3BI from '@/lib/d3-bi/index.js'
import shared from '@/shared.js'
import TypeChecker from '@/utils/type-checker.js'
import commonUtils from '@/utils/common-utils.js'
import TabbedChart from '@/components/chart/tabbed-chart/TabbedChart.vue'
import Pagging from '@/components/Paginator/Paginator.vue';

import Common from '../common.js'

let eventHub = shared.eventHub;

const CHART_LABEL = {
  "CaseID": "Case Id",
  "ActivityName": "Activity Name",
  "StartTime": "Start Time",
  "EndTime": "End Time",
  "Discrepancy": "Discrepancy",
  "InvoiceType": "Invoice Type",
  "CompanyCode": "Company Code",
  "DocumentType": "Document Type",
  "Channel": "Channel",
  "VendorName": "Vendor Name",
  "Vendor": "Vendor",
  "NetAmount": "Net Amount",
  "GrossAmount": "Gross Amount",
  "CurrencyCode": "Currency Code",
  "PreviousActivityEndTime": "Previous Activity End Time",
  "PreviousActivityName": "Previous Activity Name",
  "UserName": "User Name",
}
const TAB_DATA = {
  value: null,
  name: null,
  data: {
    chart: null,
    table: null
  }
}
export default {
  name: "case-value-ranking-setup",
  template: ` <div class="vendor-discrepancies-content" ref= "valueRankingContainer" >
                <tabbed-chart :tabList="tabs" :actions="actions" @change="onChangedTab" :pagging="paginator">
                  <div slot="tabbed-header"></div>

                  <div slot="tabbed-body">
                    <div class="invoice-detail" v-show="viewType=='table'">
                      <div ref="table_Setup_js"></div>

                    </div>
                    <div class="invoice-detail" v-show="viewType == 'chart' ">
                       <p class="vendor-chart-title" v-show="tabs.length>0">Value Ranking by {{currentTab.name}}</p>
                       <div  ref="chart_Setup_js"></div>
                    </div>          
                  </div> 
                </tabbed-chart>
              </div>
            `,
  props: {
    tileId: {
      type: String,
      required: true
    },
    conf: {
      validator: function(_conf) {
        if (!TypeChecker.isObject(_conf)) return false;
        if (!TypeChecker.isArray(_conf.groups)) return false;
        return true;
      }
    }
  },

  data() {
    return {
      eChart: null,
      tableElem: null,
      tabs: [],
      dynamicFillterKey:null,
      viewType: "chart",
      tableConfig: {
        config:{
          sort: {
            able: true,
            local: false,
            rule:{
              "cycleTime":"time",
              "avgDuration":"time"
            }
          },
          scroll: { able: true },
          toolbar: {
            columnSearched: "Vendor Name",
            placeholderTxt: "Type to start search for a recipe"
          },
          clickedColumn:[]          
        },

        theadConfig: { name: "Vendor Name", cycleTime: "Cycle Time", caseCount: "Case Count", percentage: "Case Percentage"},
      },
      caseChartRule: null,
      tableData: [],
      chartData: [{
        label: { x: '', y: 'Case Count', name: 'name' },
        color: '#00C9FF', //#9644FE
        values: []
      }],
      actions: null,
      windowResizedTimer: null,
      currentTabValue: "",
      currentTabs: {},
      currentTab: {
        value: null,
        name: null,
        data: {
          chart: null,
          table: null
        }
      },
      paginator:{
        pageIndex:1,
        total:0,
        pageSize:10,
        onPageChange:null
      },
      sortBy:'DESC',
      orderBy:"COUNT",
      bUpdateHead:false,
      createCompo:true
    }
  },
  watch: {
    "conf.field":{
      handler(newVal,oldVal){
        if(newVal == "")return;
        this.bUpdateHead = true;
      }      
    },
    "conf.reinit":{
      handler(newVal,oldVal){
        if(newVal){
          if(this.$props.conf.data.chart||this.$props.conf.data.table){
            this.currentTabs[this.currentTabValue].data[this.viewType] = commonUtils.deepClone(this.$props.conf.data[this.viewType]);
            this.currentTab = this.currentTabs[this.currentTabValue];
            if (this.viewType == "table") {
              this.updataTableViewData(this.currentTab.data.table,this.bUpdateHead);
            } else if (this.viewType == "chart") {
              this.updataChartViewData(this.currentTab.data.chart);
            }
          }else{
            if (this.viewType == "table") {
              this.updataTableViewData({list:[],total:0},this.bUpdateHead);
            } else if (this.viewType == "chart") {
              this.updataChartViewData({list:[],total:0});
            }          
          }          
        }
        
      },
    deep:true
    },
    "conf.data": {
      handler: function(newVal,oldVal) {

      },
      deep: true
    },
    "conf.groups":{
      handler(newVal,oldVal){
        //tooggle process level with user level
        if (newVal && newVal.length > 0) {
          this.tabs = Common.parseTabsFromOnlyGroups(newVal, 3);
          this.currentTabs = this.generatorCurrentTabs(newVal);
        } else {
          this.currentTabValue = null;          
          this.tabs = [];
          this.updataChartViewData();
          this.updataTableViewData();
        }
      },
      deep:true
    },
    "dynamicFillterKey.sort":{
      handler(newVal,oldVal){
        if (newVal.name && newVal.type){
          let vm = this;
          this.sortBy = newVal.type;

          if(newVal.name == "caseCount" || newVal.name == "percentage"){
              this.orderBy = "COUNT";             
          }else if(newVal.name == "cycleTime"){
              this.orderBy = "AVERAGE";             
          }else{
              this.orderBy = "NAME";             
          }

          if (TypeChecker.isFunction(this.$props.conf.notifyInjectData)) {
            this.$props.conf.notifyInjectData.call(this, {
              view: vm.viewType,
              type: 'fetch',
              data: {
                sortBy:this.sortBy,
                orderBy:this.orderBy,            
                field: vm.currentTab.value,
                pageSize: vm.paginator.pageSize,
                pageIndex: 1
              }
            });
          }
          this.paginator.pageIndex = 1;         
        }
      },
      deep:true
    },
    "dynamicFillterKey.clickedText":{
      handler(newVal,oldVal){       
        if(newVal == ""||!(this.$props.conf.opts&&TypeChecker.isFunction(this.$props.conf.opts.onClickItem)))return;
        this.$props.conf.opts.onClickItem(newVal,this.currentTab.value);
      }
    }
  },  
  created() {
    let vm = this;
    eventHub.$on("tile-window-resized", this.windowResized);

    this.actions = [{
      icon: "icon-list-ul",
      onClick: vm.toggleChart
    }];

    this.paginator.onPageChange = this.pageHandler;

  },
  mounted() {
    this.eChart = d3.select(this.$refs.chart_Setup_js);
    this.updataChartViewData({list:[],total:0})
  },
  beforeDestroy() {
    this.eChart = this.tableElem = null;
    eventHub.$off("toggleInvoiceChart", this.toggleChart)
    eventHub.$off("tile-window-resized", this.windowResized)
  },
  components: {
    "tabbed-chart": TabbedChart,
    Pagging
  },
  methods: {
    onChangedTab(tab) {
      var tabValue = tab.selected.groupBy.value,
          filter = null,
          vm = this;
      this.sortBy = "DESC";
      this.paginator.pageIndex = 1;
      this.currentTabValue = tabValue;
      this.currentTab = this.currentTabs[this.currentTabValue];
      this.tableConfig.theadConfig.name = this.tableConfig.config.toolbar.columnSearched = this.currentTab.name;
      // this.tableConfig.theadConfig.name = this.tableConfig.config.toolbar.columnSearched = CHART_LABEL[this.currentTab.name]
      if(this.$props.conf.opts&&TypeChecker.isFunction(this.$props.conf.opts.onClickItem)){
        // this.tableConfig.config.clickedColumn = [ CHART_LABEL[this.currentTab.name] ];
        this.tableConfig.config.clickedColumn = [this.currentTab.name];
      }

      if (TypeChecker.isFunction(this.$props.conf.notifyInjectData)) {
        this.$props.conf.notifyInjectData.call(this, {
          view: vm.viewType, // 'table'       
          type: tab.default&&vm.createCompo ? 'shunt' : 'fetch', 
          data: { 
            field: vm.currentTab.value, 
            pageSize: vm.paginator.pageSize, 
            sortBy:'DESC',
            orderBy:this.orderBy,
            pageIndex:1 
          }
        });
        
        vm.createCompo = false;
      }

    },

    toggleChart(arg) {
      if(this.tabs.length === 0)return;
      let vm = this,
        filter = null;
      this.tableConfig.theadConfig.name = this.currentTab.name;
      // this.tableConfig.theadConfig.name = CHART_LABEL[this.currentTab.name];
      this.sortBy = "DESC";
      this.paginator.pageIndex = 1;

      if (this.viewType == "chart") {
        arg.icon = "icon-bar-chart";
        this.viewType = "table";
        this.orderBy = "NAME";
      } else {        
        arg.icon = "icon-list-ul";
        this.viewType = "chart";
        this.orderBy = "COUNT";
      }

      if (TypeChecker.isFunction(this.$props.conf.notifyInjectData)) {
        this.$props.conf.notifyInjectData.call(this, {
          view: vm.viewType,
          type: 'fetch',
          data: { 
            sortBy:'DESC',
            orderBy:this.orderBy,            
            field: vm.currentTab.value, 
            pageSize: vm.paginator.pageSize, 
            pageIndex: 1 
          }
        });
      }

    },

    pageHandler(index) {
      let vm = this;
      if (TypeChecker.isFunction(this.$props.conf.notifyInjectData)) {
        this.$props.conf.notifyInjectData.call(this, {
          view: vm.viewType,
          type: 'fetch',
          data: {
            sortBy:vm.sortBy,
            orderBy:vm.orderBy,            
            field: vm.currentTab.value,
            pageSize: vm.paginator.pageSize,
            pageIndex: this.paginator.pageIndex = index
          }
        });
      }
    },

    updateSize(size) {
      this.currentTab.data.table = [];
      this.paginator.pageSize = size;
      this.paginator.pageIndex = 1;

      let vm = this;
      if (TypeChecker.isFunction(this.$props.conf.notifyInjectData)) {
        this.$props.conf.notifyInjectData.call(this, {
          view: vm.viewType,
          type: 'fetch',
          data: {
            sortBy:vm.sortBy,
            orderBy:vm.orderBy,            
            field: vm.currentTab.value,
            pageSize: size,
            pageIndex: 1
          }
        });
      }
    },

    windowResized(arg) {
      if (arg.id === this.$props.tileId) {
        if (this.viewType == "chart") {
          this.rendingChart(this.caseChartRule, this.chartData);
        }
      }
    },

    initCaseChart(clickable,vm) {
      let chartRule = d3BI.baseChart('bar')
        .x(d => d.label)
        .y(d => d.value)
        .margin({ top: 10, right: 0, left: 0, bottom:0  });

      chartRule.xAxis.textRotate(-16);
      chartRule.xAxis.scale().padding(0.7);
      chartRule.yAxis.axis().ticks(8);
      chartRule.yAxis.domainToZero(true)
      if(clickable){
        chartRule.tooltipDispatch.on('click', args=>{
            vm.$props.conf.opts.onClickItem(args.data.label,vm.currentTab.value);
        });
      }
      return chartRule;
    },

    rendingChart(chartRule, data) {

      // if (TypeChecker.isArray(data) && data[0] && data[0].label) chartRule.xAxis.title(data[0].label.x);
      setTimeout(()=>{
        this.eChart.style('height', this.$refs.valueRankingContainer.clientHeight - 52 - 30 + "px")
          .style('width', () => this.$refs.valueRankingContainer.clientWidth - 20 + "px");

        if (this.eChart.select('svg').size()) {
          this.eChart.select('svg')
            .datum(data)
            .call(chartRule);
        } else {
          this.eChart.append('svg')
            .datum(data)
            .call(chartRule);
        }
        let xAxisTests = this.changeXAxisText( commonUtils.deepClone(data[0].values), 2);
           
        this.eChart.node().querySelectorAll(".xaxis-group .tick text").forEach((d, i) => {
          d3.select(d).text(xAxisTests[i])
        })

      },0)



    },
    changeXAxisText(data, count) {
      var result = [];
      data.forEach(d => {
        var cutedStr = _cutLableName(d['label'], count);
        for (var j = 0; j < data.length; j++) {
          if (result[j] == cutedStr) {
            count++;
            d['label'] = _cutLableName(d['label'], count);
            break;
          } else {
            d['label'] = cutedStr;
          }
        }
        result.push(d['label'])
      })

      function _cutLableName(name, num) {
        var nameArr = name.trim().split(" "),
          nameStr = "";
        if (nameArr.length > num) {
          nameArr.splice(num)
          return nameArr.join(" ") + "...";
        } else {
          return name;
        }
      }    

      return result;
    },
    updataTableViewData(data,bUpdateHead) { //type :"bUpdateHead" update both thead and tbody
      if(!TypeChecker.isObject(data)||!TypeChecker.isArray(data.list)||!TypeChecker.isNumber(data.total)){
        data = {list:[],total:0}
      }
      if(TypeChecker.isUndefined(bUpdateHead))bUpdateHead=true;

      this.paginator.total = data.total;
      this.tableData = this.makeTableData(data.list, this.$props.conf.totalCaseCount);

      changeDataFormat(this.tableData);

      let height = this.$refs.valueRankingContainer.clientHeight - 52 - 106; //10 is the margin of the table
      this.tableConfig.config.scroll.height = height;
      
      if(!this.tableElem){
        this.tableElem = d3BI.D3table(this.$refs.table_Setup_js,this.tableConfig.config).thead(this.tableConfig.theadConfig).tbody(this.tableData,"input");
        this.dynamicFillterKey = this.tableElem.model;

      }else{

        if(bUpdateHead){
          this.tableElem.thead(this.tableConfig.theadConfig,this.tableConfig.config).tbody(this.tableData,"input");
          this.bUpdateHead = false;
        }else{
          this.tableElem.tbody(this.tableData,"input");
        }
      }
      function changeDataFormat(data) {
        if (data && TypeChecker.isArray(data)) {
          data.forEach((d, i) => {
            for (var i_ in d) {
              if (d.hasOwnProperty(i_)) {
                if (i_ === "percentage") {
                  if (TypeChecker.isNumber(d[i_]) || d[i_].indexOf("%") < 0) {
                    d[i_] = (d[i_]*100).toFixed(2) + "%";
                  }
                  continue;
                } else if (i_ == "cycleTime") {
                  if (TypeChecker.isNumber(d[i_])) {
                    d[i_] = timeFormat(d[i_], 1);
                  }
                  continue;
                }
              }
            }
          })
        }
      }

      function timeFormat(data, count) {
        var str = null,
          num = null;
        if (data === 0) {
          num = 0;
          return num.toFixed(count) + " Second"
        } else if (data < 60) {
          num = data;
          str = num > 1 ? num + ' Seconds' : num + ' Second';
          return str;
        } else if (data < 60 * 60) {
          num = data / 60;
          str = num > 1 ? num.toFixed(count) + ' Minutes' : num.toFixed(count) + ' Minute';
          return str;
        } else if (data < 60 * 60 * 24) {
          num = data / (60 * 60);
          str = num > 1 ? num.toFixed(count) + ' Hours' : num.toFixed(count) + ' Hour';
          return str;
        } else {
          num = data / (60 * 60 * 24);
          str = num > 1 ? num.toFixed(count) + ' Days' : num.toFixed(count) + ' Day';
          return str;
        }
      }
    },
    updataChartViewData(data) {
      if(!TypeChecker.isObject(data)||!TypeChecker.isArray(data.list)||!TypeChecker.isNumber(data.total)){
        data = {list:[],total:0}
      }
      let bBarClickable = this.$props.conf.opts&&TypeChecker.isFunction(this.$props.conf.opts.onClickItem);
      if (!this.caseChartRule) this.caseChartRule = this.initCaseChart(bBarClickable,this);

      this.paginator.total = data.total;
      if (data.list.length == 0) {
        this.chartData[0].values = [];
        this.rendingChart(this.caseChartRule, this.chartData)
      } else {
        this.chartData[0].label.x = this.currentTab.name || "";
        // this.chartData[0].label.x = CHART_LABEL[this.currentTab.name || ""];
        var list = this.makeTableData(data.list, this.$props.conf.totalCaseCount);

        this.chartData[0].values = this.getChartData(list);
        this.rendingChart(this.caseChartRule, this.chartData)
      }
    },
    getChartData(data) {
      var result = [];
      // commonUtils.descendSort_ObjectsInArray(data,"caseCount")
      data.forEach((d, i) => {
        result[i] = {};
        for (let key in d) {
          if (d.hasOwnProperty(key) && key == "caseCount") {
            result[i]["label"] = d["name"];
            result[i]["value"] = d["caseCount"];
          }
        }
      })
      return result;
    },
    makeTableData(list, totalCaseCount) {
      var result = []
      list.forEach((l, i) => {
        result[i] = {};
        result[i].name = l.name;
        result[i].caseCount = l.count;
        result[i].percentage = (l.count) / totalCaseCount;
        result[i].cycleTime = l.average?l.average:0;

      })
      return result;
    },
    generatorCurrentTabs(groups) {
      var currentTabs = {};
      groups.forEach(group => {
        currentTabs[group.key] = commonUtils.deepClone(TAB_DATA);
        currentTabs[group.key].value = group.key;
        currentTabs[group.key].name = group.label;
      })

      return currentTabs;
    }

  }
}
