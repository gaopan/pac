import processMiningApi from '@/api/process-mining.js'

import TypeChecker from '@/utils/type-checker.js'
import StringUtils from '@/utils/string-utils.js'
import PNChart from "../../pn-chart/PNChart.vue"
import shared from '@/shared.js'
// import filterUtils from '@/utils/filters-utils.js'
import DFUtils from '../dynamic-filter/dynamic-filter-utils.js'
import commonUtils from '@/utils/common-utils.js'
import CommonGenerators from '@/utils/common-generators.js'
import ErrorHandler from '@/utils/error-handler.js'
import VariantCasePanel from '../variant-case-panel/VariantCasePanel.vue'
import * as d3 from "d3"
let eventHub = shared.eventHub

let UUIDGenerator = CommonGenerators.UUIDGenerator

export default {
  name: 'single-process',
  props: {
    tileId: {
      type: String,
      required: true
    },
    conf: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      pnChartConf: { data: null, opts: { viewType: 1, viewOpts: { kpi: 'abs', weightedBy: null } } },
      dataFilters: null,
      viewFilters: null,
      innerDataFilters: {},
      fnCancelFunc: null,
      showVariantCasePanel: false,
      showCaseDetailShadow: false,
      vcPanelConf: null,
      loadId: UUIDGenerator.purchase()
    }
  },
  components: {
    'pn-chart': PNChart,
    'variant-case-panel': VariantCasePanel
  },
  watch: {
    conf: {
      handler: function(val) {
        this.pnChartConf.opts = commonUtils.deepClone(this.$props.conf.opts);
        this.pnChartConf.awareChartInstance = this.$props.conf.awareChartInstance;
        this.pnChartConf.awareProcessStaticData = this.$props.conf.awareProcessStaticData;
      },
      deep: true
    },
    dataFilters: {
      handler: function() {
        this.changedDataFilters();
      }
    },
    viewFilters: {
      handler: function() {
        this.changedViewFilters();
      }
    },
    innerDataFilters: {
      handler: function() {
        this.changedInnerDataFilters();
      }
    }
  },
  methods: {
    onChangedGlobalFilters: function(args) {
      var filters = DFUtils.formatGlobalFilters(args);

      var changedRes = DFUtils.checkIfChanged(filters, {
        dataFilters: this.dataFilters
      });
      if (changedRes.data) {
        this.dataFilters = filters.dataFilters;
      }
    },
    onChangedVariant: function(args) {
      if (TypeChecker.isArray(args.variantData) && TypeChecker.isNumber(args.selectedBarCount) && args.variantData.length >= args.selectedBarCount) {
        this.showCaseDetailShadow = false;
        var theVariant = args.variantData[args.selectedBarCount - 1];
        this.innerDataFilters = {
          variant: Object.assign({}, theVariant)
        };
      }
    },
    changedDataFilters: function() {
      // this.refreshPNChartData();
    },
    changedViewFilters: function() {
      if (TypeChecker.isNumber(this.viewFilters.viewType)) {
        this.pnChartConf.opts.viewType = this.viewFilters.viewType;
      }
    },
    changedInnerDataFilters: function() {
      this.refreshPNChartData();
    },
    refreshPNChartData: function() {
      var vm = this;
      this.fetchProcessDefinition(function(data) {
        vm.pnChartConf.data = data;
      });
    },
    fetchProcessDefinition: function(cb) {
      let vm = this
      
      if (!this.dataFilters.processAnalyticsId || !this.innerDataFilters.variant || !TypeChecker.isNumber(this.innerDataFilters.variant.order)) {
        if (this.dataFilters.processAnalyticsId && this.innerDataFilters.variant && TypeChecker.isFunction(cb)) {
          cb.call(vm, null);
        }
        return;
      }

      var id = vm.loadId;
      eventHub.$emit("start-mini-loader", { id: id, roughTime: 1000 * 10 });
      eventHub.$emit("loading-data-in-tile", { id: this.$props.tileId, loadId: id });

      //Azhaziq - 08-12-2017: To cater C2
      DFUtils.formatDataFiltersForRequest(this.dataFilters).then(data => {
        let filtersToRequest = data;

        processMiningApi.filterProcessDefinition(this.$store.getters.processSelection.customerId, this.dataFilters.processAnalyticsId, filtersToRequest, this.innerDataFilters.variant.order == 10 ? null : this.innerDataFilters.variant.order, function(c) {
          vm.fnCancelFunc = c;
        }).then(function(res) {
          if (TypeChecker.isFunction(cb)) {
            cb.call(vm, res.data);
          }
          setTimeout(function() {
            vm.fnCancelFunc = null;
            eventHub.$emit("finish-mini-loader", { id: id });
            eventHub.$emit("loaded-data-in-tile", { id: vm.$props.tileId, loadId: id });
          }, 1000);
        }, function(err) {
          ErrorHandler.handleApiRequestError(err);
          vm.fnCancelFunc = null;
          eventHub.$emit("finish-mini-loader", { id: id });
          eventHub.$emit("loaded-data-in-tile", { id: vm.$props.tileId, loadId: id });
        });

      })
    },
    cancelLoadData: function(args) {
      var vm = this
      if (args.id == this.$props.tileId) {
        if (TypeChecker.isFunction(vm.fnCancelFunc)) {
          vm.fnCancelFunc.call(vm);
        }
        eventHub.$emit("finish-mini-loader", { id: vm.loadId });
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
    toggleShadow(args) {
      this.showCaseDetailShadow = args.showPanel;
      this.vcPanelConf = args.data;
    }
  },
  created() {
    eventHub.$on("changed-global-filters", this.onChangedGlobalFilters);
    eventHub.$on("changed-process-variant", this.onChangedVariant);
    eventHub.$on("cancel-load-data-in-tile", this.cancelLoadData);
    eventHub.$on("cancel-loaing-from-mini-loader", this.cancelLoadFromMiniLoader);
    eventHub.$on("toggle-variantCase-panel", this.toggleShadow);
    eventHub.$on("showDFPanel", () => {
      this.showCaseDetailShadow = false;
      var chartEle = d3.select(".top-ranked-variants").select(".bar-area");
      console.log(chartEle)
      chartEle.selectAll(".bar")
        .attr("fill", "#eee")
        .attr("stroke", "#eee")
      chartEle.selectAll(".stepNo")
        .attr("fill", "#fff")
        .style("font-weight", "bold")
      chartEle.selectAll("icon")
        .style("color", "#eee");
      setTimeout(() => {}, 0)
    });
  },
  mounted: function() {
    var vm = this
    this.pnChartConf.data = this.$props.conf.data;
    this.pnChartConf.opts = commonUtils.deepClone(this.$props.conf.opts);
    this.pnChartConf.awareChartInstance = this.$props.conf.awareChartInstance;
    this.pnChartConf.awareProcessStaticData = this.$props.conf.awareProcessStaticData;

  },
  beforeDestroy() {
    eventHub.$off("changed-global-filters", this.onChangedGlobalFilters);
    eventHub.$off("changed-process-variant", this.onChangedVariant);
    eventHub.$off("cancel-load-data-in-tile", this.cancelLoadData);
    eventHub.$off("cancel-loaing-from-mini-loader", this.cancelLoadFromMiniLoader);
    eventHub.$off("toggle-variantCase-panel", this.toggleShadow)
    eventHub.$off("showDFPanel");
  }
}
