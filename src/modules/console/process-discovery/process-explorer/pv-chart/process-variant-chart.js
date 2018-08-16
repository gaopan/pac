import * as d3 from 'd3'
import SVG from 'svg.js'
import Chart from '@/components/chart/Chart.vue'
import shared from "@/shared.js"
import PVChart from "./pvchart.js"
import SliderChart from "./sliderchart.js"
import TypeChecker from '@/utils/type-checker.js'
import DFUtils from '../dynamic-filter/dynamic-filter-utils.js'
import CommonGenerators from '@/utils/common-generators.js'
import CommonUtils from '@/utils/common-utils.js'
import processMiningApi from '@/api/process-mining.js'
import ErrorHandler from '@/utils/error-handler.js'
import Internationalization from '@/utils/internationalization.js'

let UUIDGenerator = CommonGenerators.UUIDGenerator

var eventHub = shared.eventHub;
export default {
  name: 'process-variant-chart',
  props: {
    tileId: {
      type: String
    },
    conf: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      data: {
        config: {
          top: 10,
          margin: null,
          progressMargin: null,
          maxPercent: 1,
          title: ["1", "2", "3", "4", "5", "6", "7", "8", "9", Internationalization.translate("ALL")]
        },
        rankInfo: [],
        sliderData: {
          currentPercentage: 0,
          percentageList: []
        },
        selectedBar: 5,
        mode: null,
        clickable: false,
        tab: false,
        clickingBar:{
          barCount:null,
          clicked:false
        },
        hoverable: true //Azhaziq - 27/11/2017: Defect 2544
      },
      container: null,
      dataFilters: null,
      filter: null,
      chart: null,
      fnCancelFunc: null,
      loadId: UUIDGenerator.purchase(),
      filtersForRequest: null,
      showVariantCasePanel: false
    }
  },
  created: function() {
    eventHub.$on("changed-global-filters", this.changedGlobalFilters);
    eventHub.$on("cancel-load-data-in-tile", this.cancelLoadData);
    eventHub.$on("tile-window-resized", this.windowResized);
    eventHub.$on("cancel-loaing-from-mini-loader", this.cancelLoadFromMiniLoader);
    eventHub.$on("toggle-variantCase-panel", this.closePanel);
    eventHub.$on("showDFPanel", () => {
      this.showVariantCasePanel = false;
    });
  },
  watch: {
    dataFilters: {
      handler: function() {
        this.changedDataFilters();
      },
      deep: true
    },
    conf: {
      handler: function() {
        this.parseConf();
      },
      deep: true
    }
  },

  mounted: function() {
    var container = this.container = this.$refs.container;
    this.parseConf();
  },

  methods: {
    rankedVariantClickFn: function(selectedBarCount) {
      this.showVariantCasePanel = true;
      var obj = {
        selectedBarCount: selectedBarCount,
        variantId: this.data.rankInfo[selectedBarCount - 1].trace,
        processName: this.dataFilters.processName,
        processAnalyticsId: this.dataFilters.processAnalyticsId,
        globalFilter: CommonUtils.deepClone(this.filtersForRequest),
        // totalCaseCount: this.totalCaseCount
      };
      eventHub.$emit("toggle-variantCase-panel", { showPanel: true, data: obj })
    },
    variantBarClickFn: function(cnt,isClicked,variantData) {
      if(this.data.clickingBar.barCount==cnt){
        if(this.data.clickingBar.clicked){
          // emit unhover
           eventHub.$emit("unhover-process-variant", {
            variant: variantData[cnt - 1]
          });
          // reset 
          this.data.clickingBar.barCount=null;
          this.data.clickingBar.clicked=false;
        }
      }else{
          // emit unhover
          eventHub.$emit("unhover-process-variant", {
            variant: variantData[this.data.clickingBar.barCount - 1]
          });
          // emit hover
           eventHub.$emit("hover-process-variant", {
            variant: variantData[cnt - 1]
          });
          // record status
          this.data.clickingBar.barCount=cnt;
          this.data.clickingBar.clicked=true;
        }
    },
    parseConf: function() {
      if (TypeChecker.isArray(this.$props.conf.data)) {
        this.data.rankInfo = this.$props.conf.data.slice(0);
      }
      this.data.mode = this.$props.conf.mode;
      this.data.clickable = this.$props.conf.clickable;
      this.data.tab = this.$props.conf.tab;
      this.data.selectedBar = this.$props.conf.selectedBar;
    },
    filtered: function(id, selectedBarCount, variantData, isHover, onHover) {

      //13th June 2017: muhammad-azhaziq.bin-mohd-azlan-goh@hpe.com
      //Temp solution to sent more data to component that listen to this change
      var idToSend = id;
      var selectedBarCountToSend = selectedBarCount;
      var variantDataToSend = variantData;
      this.data.selectedBar = selectedBarCount;
      // var totalCaseCount = 0;
      // variantData.forEach(d => {
      //   if(TypeChecker.isNumber(d.numOfCases)) {
      //     totalCaseCount += d.numOfCases;
      //   }
      // });
      // this.totalCaseCount = variantData[9].numOfCases;

      if (!isHover) {
        // eventHub.$emit("changed-process-flow-filters", {
        //   variant: variantDataToSend[selectedBarCountToSend - 1]
        // });
        eventHub.$emit("changed-process-variant", {
          selectedBarCount: selectedBarCountToSend,
          variantData: variantDataToSend
        });
      } else {
        if (onHover) {
          eventHub.$emit("hover-process-variant", {
            variant: variantDataToSend[selectedBarCountToSend - 1]
          });
        } else {
          eventHub.$emit("unhover-process-variant", {
            variant: variantDataToSend[selectedBarCountToSend - 1]
          });
        }
      }

    },
    // draw in the container
    draw: function() {
      var vm = this;

      var container = this.container;
      if (this.data.rankInfo) {
        if (!this.chart) {
          this.chart = new PVChart(container).data(this.data).onChange(this.filtered).setFilter(this.filter).iconOnClick(this.rankedVariantClickFn).barOnClick(this.variantBarClickFn).draw();
        } else {
          setTimeout(function() {
            vm.chart.data(vm.data).draw();
          }, 500);
        }
      }
    },
    changedDataFilters: function() {
      var vm = this;
      vm.fetchTopTenVariants(function(data) {
        data = data || [];
        data.sort(function(a, b) { return a.order > b.order; });
        vm.data.rankInfo = data;
        vm.draw();
      });
    },
    fetchTopTenVariants: function(cb) {
      var vm = this;
      let processAnalyticsId = this.dataFilters.processAnalyticsId;
      
      var id = vm.loadId;
      eventHub.$emit("start-mini-loader", { id: id, roughTime: 1000 * 10 });
      eventHub.$emit("loading-data-in-tile", { id: vm.$props.tileId, loadId: id });

      //Azhaziq - 08-12-2017: To cater C2
      DFUtils.formatDataFiltersForRequest(this.dataFilters).then(data => {
        this.filtersForRequest = data;
        
        processMiningApi.filterTopTenVariants(this.$store.getters.processSelection.customerId, processAnalyticsId, this.filtersForRequest, function(c) {
          vm.fnCancelFunc = c;
        }).then(function(res) {
          if (TypeChecker.isFunction(cb)) {
            cb.call(vm, res.data);
          }
          vm.fnCancelFunc = null;
          setTimeout(function() {
            eventHub.$emit("finish-mini-loader", { id: id });
            eventHub.$emit("loaded-data-in-tile", { id: vm.$props.tileId, loadId: id });
            eventHub.$emit("global-filters-status", true);
          }, 2000);
          vm.fnShowDataUpload(res.data);
        }, function(err) {
          ErrorHandler.handleApiRequestError(err);
          vm.fnCancelFunc = null;
          eventHub.$emit("finish-mini-loader", { id: id });
          eventHub.$emit("loaded-data-in-tile", { id: vm.$props.tileId, loadId: id });
          eventHub.$emit("global-filters-status", false);
        });
        
      })
    },
    fnShowDataUpload:function(data){
      let vm = this;
      let obj = vm.filtersForRequest.filter, isFiltersEmpty = true;
      for(var key in obj){
        if(obj.hasOwnProperty(key)) {
          if(TypeChecker.isArray(obj[key]) && obj[key].length > 0) {
            isFiltersEmpty = false;
          }
        }
      };
      if (((TypeChecker.isString(data) && data == "") || data == null || (TypeChecker.isArray(data) && data.length < 1)) && isFiltersEmpty) {
        eventHub.$emit("show-data-upload",true);
      };
    },
    changedGlobalFilters: function(args) {
      //console.log(args);
      var filters = DFUtils.formatGlobalFilters(args);
      var changedRes = DFUtils.checkIfChanged(filters, {
        dataFilters: this.dataFilters
      });

      if (changedRes.data) {
        this.dataFilters = filters.dataFilters;

        //Azhaziq - Defect 2117
        this.data.selectedBar = 5;
      }
    },
    cancelLoadData: function(args) {
      var vm = this
      if (args.id == this.$props.tileId) {
        if (TypeChecker.isFunction(vm.fnCancelFunc)) {
          vm.fnCancelFunc.call(vm);
        }
        event.$emit("finish-mini-loader", { id: vm.loadId });
      }
    },
    windowResized: function(args) {
      if (args.id == this.$props.tileId) {
        if (this.chart) {
          this.chart.draw({
            disabledEmit: true
          });
        }
      }
    },
    cancelLoadFromMiniLoader: function(args) {
      var vm = this;
      if (args.id == this.loadId) {
        if (TypeChecker.isFunction(vm.fnCancelFunc)) {
          vm.fnCancelFunc.call(vm);
        }
      }
    },
    closePanel: function(args) {
      if (!args.showPanel) {
        this.showVariantCasePanel = args.showPanel;

        if (this.chart) {
          this.chart.updateStyle();
          
          //Azhaziq - 27/11/2017: Defect 2544
          this.chart.enableHover();
        }
      }
    }
  },
  beforeDestroy: function() {
    eventHub.$off("changed-global-filters", this.changedGlobalFilters);
    eventHub.$off("cancel-load-data-in-tile", this.cancelLoadData);
    eventHub.$off("tile-window-resized", this.windowResized);
    eventHub.$off("cancel-loaing-from-mini-loader", this.cancelLoadFromMiniLoader);
    eventHub.$off("toggle-variantCase-panel", this.closePanel);
    eventHub.$off("showDFPanel");

  },
  components: {
    Chart
  }
}
