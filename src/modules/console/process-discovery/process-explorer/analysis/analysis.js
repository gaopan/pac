'use strict'
import TilePanelMixins from '@/components/tile/tile-panel-mixins.js'
import TileConfigurer from '@/components/tile/tile-configurer.js'
import processMiningApi from '@/api/process-mining.js'
import TypeChecker from '@/utils/type-checker.js'
import StringUtils from '@/utils/string-utils.js'
import shared from '@/shared.js'
import CommonGenerators from '@/utils/common-generators.js'

import ProcessVariantChart from "@/modules/console/process-discovery/process-explorer/pv-chart/ProcessVariantChart.vue"
import TopTenCalChart from '@/modules/console/process-discovery/process-explorer/pvc-chart/TopTenCalChart.vue'
import SingleProcess from '@/modules/console/process-discovery/process-explorer/single-process/SingleProcess.vue'
import AnalysisDashboard from './analysis-dashboard/AnalysisDashboard.vue'
import DashboardSetup from '../../dashboard-setup/DashboardSetup.vue'

import Internationalization from '@/utils/internationalization.js'

let UUIDGenerator = CommonGenerators.UUIDGenerator

let eventHub = shared.eventHub

let TilePanel = {
  mixins: [TilePanelMixins],
  components: {
    ProcessVariantChart, TopTenCalChart, SingleProcess, AnalysisDashboard
  }
}

export default {
  name: 'analysis',
  data() {
    return {
      tiles: [],
      tilePanelId: UUIDGenerator.purchase(),
      timer: null,
      pnChartConf: null,
      pvChartConf: null,
      pvcChartConf: null,
      selectedAcvitities: [],
      disabledActivityFilter: false,
      currentFilter: null,
      personalizedEdited:false,
      bEditing:false
    }
  },
  created: function() {
    eventHub.$on("changed-process-variant", this.onChangedVariant);
    eventHub.$on('activityStatus', this.onCurrentFilter);
    eventHub.$on('open-dashboard-setup', this.openDashboardSetup);
  },
  methods: {
    // closeDashboardSetup(){
    //   this.bEditing = false;
    // },
    // openDashboardSetup(){
    //   this.personalizedEdited = true;
    //   this.bEditing = true;
    // },
    init: function() {
      if (this.$route.query.id) {
        this.setId(this.$route.query.id);
      } else {
        this.configTiles();
      }
    },
    configTiles: function() {
      var vm = this;
      if (!this.pvChartConf) {
        this.pvChartConf = TileConfigurer.defaultConfigurer()
          .type('ProcessVariantChart').title(Internationalization.translate('Top Ranked Variants'))
          .width({ xs: 1.3 })
          .height({ xs: 10 })
          .transform({ xs: { x: 0, y: 2 } })
          .disableFullScreen(true)
          .chart({
            data: null,
            mode: 'small',
            selectedBar: null
          }).react();
        this.$data.tiles.push(this.pvChartConf);
      }

      if (!this.pvcChartConf) {
        this.pvcChartConf = TileConfigurer.defaultConfigurer()
          .type('TopTenCalChart').title(' ')
          .width({ xs: 1.3 })
          .height({ xs: 2 })
          .transform({ xs: { x: 0, y: 0 } })
          .disableFullScreen(true)
          .hideHeader(true)
          .chart({ data: null, mode: 'small' }).react();
        this.$data.tiles.push(this.pvcChartConf);
      }

      if (!this.pnChartConf) {
        this.pnChartConf = TileConfigurer.defaultConfigurer()
          .type('SingleProcess').title("Process Flow Diagram")
          .width({ xs: 3.2 })
          .height({ xs: 12 })
          .transform({ xs: { x: 1.3, y: 0 } })
          .hideHeader(true)
          .chart({
            data: null,
            opts: {
              includeAarry: vm.currentFilter,
              disabledTooltip: false,
              enabledClickPop: true,
              enabledTooltipLinkage: false,
              disabledTooltipKpi: true,
              viewType: 1,
              viewOpts: { kpi: "abs" },
              onClickTransition: function(t) {
                if (vm.disabledActivityFilter) return;
                if (vm.selectedAcvitities.indexOf(t) < 0) {
                  vm.selectedAcvitities.push(t);
                }
                vm.selectedAcvitities.forEach(function(theAct) {
                  if (theAct != t) {
                    theAct.selected = false;
                    theAct.node.classList.remove('selected');
                  }
                });
                t.selected = !t.selected;
                var activityName = null;
                if (t.selected) {
                  t.node.classList.add('selected');
                  activityName = [t._title];
                } else {
                  t.node.classList.remove('selected');
                  activityName = [];
                }

                eventHub.$emit('changed-analysis-filter', {
                  dashboardFilters: {
                    activityName: activityName
                  }
                });
              }
            }
          }).react();
        this.$data.tiles.push(this.pnChartConf);
      }
      if (!this.analysisDashboardConf) {
        this.analysisDashboardConf = TileConfigurer.defaultConfigurer()
          .type('AnalysisDashboard').title(' ')
          .width({ xs: 7.5 })
          .height({ xs: 12 })
          .transform({ xs: { x: 4.5, y: 0 } })
          .disableFullScreen(true)
          .chart({ data: null })
          .hideHeader(true)
          .react();
        this.$data.tiles.push(this.analysisDashboardConf);
      }
    },
    onChangedVariant: function() {
      this.selectedAcvitities = [];
    },
    onCurrentFilter: function(d) {
      this.pnChartConf.chartConfig.opts.includeAarry = d;
    }
  },
  mounted: function() {
    this.init();

  },
  components: {
    TilePanel,
    DashboardSetup
  },
  beforeDestroy() {
    eventHub.$off("changed-process-variant", this.onChangedVariant);
    eventHub.$off('activityStatus', this.onCurrentFilter);
  }
}
