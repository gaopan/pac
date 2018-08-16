import Vue from 'vue'

import TilePanelMixins from '@/components/tile/tile-panel-mixins.js'
import TileConfigurer from '@/components/tile/tile-configurer.js'
import processMiningApi from '@/api/process-mining.js'
import TypeChecker from '@/utils/type-checker.js'
import StringUtils from '@/utils/string-utils.js'
import CommonUtils from '@/utils/common-utils.js'
import CommonGenerators from '@/utils/common-generators.js'
import shared from '@/shared.js'

import ViewProcessPanel from "@/modules/console/process-discovery/process-explorer/process-flow/view-process-panel/ViewProcessPanel.vue"
import ProcessVariantChart from "@/modules/console/process-discovery/process-explorer/pv-chart/ProcessVariantChart.vue"
import TopTenCalChart from '@/modules/console/process-discovery/process-explorer/pvc-chart/TopTenCalChart.vue'
import ProcessFlowProcessChart from '@/modules/console/process-discovery/process-explorer/process-flow-process-chart/ProcessFlowProcessChart.vue'


let eventHub = shared.eventHub
let UUIDGenerator = CommonGenerators.UUIDGenerator

let TilePanel = {
  mixins: [TilePanelMixins],
  components: {
    ViewProcessPanel, ProcessVariantChart, TopTenCalChart, ProcessFlowProcessChart
  }
}

export default {
  name: 'process-flow',
  data() {
    return {
      loadId: UUIDGenerator.purchase(),
      tiles: [],
      innerDataFilters: {
        variant: {}
      },
      dataFilters: {
        processName: null,
        sessionId: null
      },
      viewFilters: {
        viewType: 1, // 0: both, 1: Transactions, 2: Durations
      },
      timer: null,
      pnChartConf: null,
      pvChartConf: null,
      pvcChartConf: null,
      panelChartConf: null,
      processNameList: null,
      userRole: null,
      currentFilter: null
    }
  },
  created() {
    this.userRole = 'LEAP_Admin';
  },
  watch: {
    innerDataFilters: {
      handler(val) {
        this.changedInnerDataFilters();
      },
      deep: true
    },
    dataFilters: {
      handler(val) {
        this.changedDataFilters();
      },
      deep: true
    },
    viewFilters: {
      handler() {
        this.changedViewFilters();
      },
      deep: true
    },
    currentFilter: {
      handler(val) {
        this.pnChartConf.chartConfig.opts.includeAarry = val;
      },
      deep: true
    }
  },
  methods: {
    configTiles: function() {
      var vm = this;
      
      if (!this.pnChartConf) {
        this.pnChartConf = TileConfigurer.defaultConfigurer()
          .type('ProcessFlowProcessChart').title("流程热力图")
          .width({ xs: 10.5 })
          .height({ xs: 12 })
          .transform({ xs: { x: 0, y: 0 } })
          .chart({
            data: null,
            opts: { includeAarry: vm.currentFilter, disabledTooltip: false,enabledTooltipLinkage: false,
          disabledTooltipKpi: true, enabledClickPop: true, viewType: 1, enabledHighlightPath: true, enabledWhiteboardMark: false, viewOpts: { kpi: "abs" }, enabledHeatmap: true, enabledHighlightLevel: true },
            awareProcessStaticData: function(staticData) {
              var oldStaticDataStr = CommonUtils.toString(vm.panelChartConf.chartConfig.data),
                newStaticDataStr = CommonUtils.toString(staticData);
              if (oldStaticDataStr != newStaticDataStr) {
                vm.panelChartConf.chartConfig.data = staticData;
              }
            }
          }).react();
        this.$data.tiles.push(this.pnChartConf);
      }

      if (!this.panelChartConf) {
        this.panelChartConf = TileConfigurer.defaultConfigurer()
          .type('ViewProcessPanel').title(' ')
          .width({ xs: 1.5 })
          .height({ xs: 1 })
          .transform({ xs: { x: 10.5, y: 0 } })
          .hideHeader(true)
          .disableFullScreen(true)
          .chart({
            data: null,
            cb: function(viewType, viewOpts) {
              vm.pnChartConf.chartConfig.opts.viewType = viewType; // 1 - transcation, 2 - duration
              vm.pnChartConf.chartConfig.opts.viewOpts = viewOpts;
            }
          }).react();


        this.$data.tiles.push(this.panelChartConf);
      }

      if (!this.pvChartConf) {
        if (this.userRole !== "Customer_General_Participant") {
          this.pvChartConf = TileConfigurer.defaultConfigurer()
            .type('ProcessVariantChart').title('分支路径排行')
            .width({ xs: 1.5 })
            .height({ xs: 9 })
            .transform({ xs: { x: 10.5, y: 3 } })
            .hideHeader(false)
            .disableFullScreen(true)
            .chart({
              data: null,
              mode: 'small',
              clickable: true
            }).react();

        } else {
          this.pvChartConf = TileConfigurer.defaultConfigurer()
            .type('ProcessVariantChart').title('分支路径排行')
            .width({ xs: 1.5 })
            .height({ xs: 9 })
            .transform({ xs: { x: 10.5, y: 3 } })
            .disableFullScreen(true)
            .chart({
              data: null,
              mode: 'small'
            }).react();
        }
        this.$data.tiles.push(this.pvChartConf);
      }

      if (!this.pvcChartConf) {
        this.pvcChartConf = TileConfigurer.defaultConfigurer()
          .type('TopTenCalChart').title(' ')
          .width({ xs: 1.5 })
          .height({ xs: 2 })
          .transform({ xs: { x: 10.5, y: 1 } })
          .hideHeader(true)
          .disableFullScreen(true)
          .chart({
            data: null,
            mode: 'small'
          }).react();
        this.$data.tiles.push(this.pvcChartConf);
      }
    },
    init: function() {
      if (this.$route.query.id) {
        this.setId(this.$route.query.id);
      } else {
        this.configTiles();
      }
    },
  },
  mounted: function() {
    var vm = this;
    eventHub.$on('activityStatus', function(d) {

      vm.currentFilter = d;
    })
     
    this.init();
    this.pnChartConf.chartConfig.opts.includeAarry = vm.currentFilter;
    eventHub.$emit('start-mini-loader', {id: vm.loadId, roughTime: 1000 * 10});
    setTimeout(function(){
      eventHub.$emit('finish-mini-loader', {id: vm.loadId});
    }, 3000);
  },
  components: {
    TilePanel
  },
  beforeDestroy() {
    eventHub.$off('activityStatus', null)
  }
}
