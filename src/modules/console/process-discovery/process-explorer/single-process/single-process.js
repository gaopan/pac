import processMiningApi from '@/api/process-mining.js'

import TypeChecker from '@/utils/type-checker.js'
import StringUtils from '@/utils/string-utils.js'
import PNChart from "../../pn-chart/PNChart.vue"
import shared from '@/shared.js'
import DFUtils from '../dynamic-filter/dynamic-filter-utils.js'
import commonUtils from '@/utils/common-utils.js'
import CommonGenerators from '@/utils/common-generators.js'

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
      loadId: UUIDGenerator.purchase()
    }
  },
  components: {
    'pn-chart': PNChart
  },
  watch: {
    conf: {
      handler: function(val) {
        this.pnChartConf.data = this.$props.conf.data;
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

      var id = vm.loadId,
      isTest = !!vm.$route.query.test_api;
      eventHub.$emit("start-mini-loader", { id: id, roughTime: 1000 * 10 });
      eventHub.$emit("loading-data-in-tile", { id: this.$props.tileId, loadId: id });

      //Azhaziq - 08-12-2017: To cater C2
      DFUtils.formatDataFiltersForRequest(this.dataFilters).then(data => {
        let filtersToRequest = data;

        processMiningApi.filterProcessDefinition(this.$store.getters.processSelection.customerId, this.dataFilters.processAnalyticsId, filtersToRequest, this.innerDataFilters.variant.order == 10 ? null : this.innerDataFilters.variant.order, function(c) {
          vm.fnCancelFunc = c;
        }, isTest).then(function(res) {
          if (TypeChecker.isFunction(cb)) {
            cb.call(vm, res.data);
          }
          setTimeout(function(){
            vm.fnCancelFunc = null;
            eventHub.$emit("finish-mini-loader", { id: id });
            eventHub.$emit("loaded-data-in-tile", { id: vm.$props.tileId, loadId: id });
            eventHub.$emit("global-filters-status", true);
          }, 1000);
        }, function(err) {
          vm.fnCancelFunc = null;
          eventHub.$emit("finish-mini-loader", { id: id });
          eventHub.$emit("loaded-data-in-tile", { id: vm.$props.tileId, loadId: id });
          eventHub.$emit("global-filters-status", false);
        })

      });
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
    }
  },
  created() {
    eventHub.$on("changed-global-filters", this.onChangedGlobalFilters);
    eventHub.$on("changed-process-variant", this.onChangedVariant);
    eventHub.$on("cancel-load-data-in-tile", this.cancelLoadData);
    eventHub.$on("cancel-loaing-from-mini-loader", this.cancelLoadFromMiniLoader);
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
  }
}
