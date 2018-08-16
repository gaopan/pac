import Vue from 'vue'

import TilePanelMixins from '@/components/tile/tile-panel-mixins.js'
import TileConfigurer from '@/components/tile/tile-configurer.js'
import TypeChecker from '@/utils/type-checker.js'
import StringUtils from '@/utils/string-utils.js'
import shared from '@/shared.js'

import ComparisonPanel from '@/modules/console/process-discovery/process-explorer/process-comparison/comparison-panel/ComparisonPanel.vue'
import ProcessVariantChart from "@/modules/console/process-discovery/process-explorer/pv-chart/ProcessVariantChart.vue"
import TopTenCalChart from '@/modules/console/process-discovery/process-explorer/pvc-chart/TopTenCalChart.vue'

let eventHub = shared.eventHub

let TilePanel = {
  mixins: [TilePanelMixins],
  components: {
    ProcessVariantChart, TopTenCalChart, ComparisonPanel
  }
}
export default {
  name: 'process-comparison',
  data() {
    return {
      tiles: [],
      pvChartConf: null,
      pvcChartConf: null,
      comparsionPanelConf: null
    }
  },
  methods: {
    configTiles: function() {
      if (!this.pvChartConf) {
        this.pvChartConf = TileConfigurer.defaultConfigurer()
          .type('ProcessVariantChart').title('分支路径排行')
          .width({ xs: 1.2 })
          .height({ xs: 10 })
          .transform({ xs: { x: 10.8, y: 2 } })
          .disableFullScreen(true)
          .chart({
            mode: 'small',
            selectedBar:null
          }).react();
        this.$data.tiles.push(this.pvChartConf);
      } 

      if (!this.pvcChartConf) {
        this.pvcChartConf = TileConfigurer.defaultConfigurer()
          .type('TopTenCalChart').title(' ')
          .width({ xs: 1.2 })
          .height({ xs: 2 })
          .transform({ xs: { x: 10.8, y: 0 } })
          .disableFullScreen(true)
          .hideHeader(true)
          .chart({ data: null, mode: 'small' }).react();
        this.$data.tiles.push(this.pvcChartConf);
      }

      if (!this.comparsionPanelConf) {
        this.comparsionPanelConf = TileConfigurer.defaultConfigurer()
          .type('ComparisonPanel').title(' ')
          .width({ xs: 10.8 })
          .height({ xs: 12 })
          .transform({ xs: { x: 0, y: 0 } })
          .chart({ data: null })
          .hideHeader(true)
          .react();
        this.$data.tiles.push(this.comparsionPanelConf);
      }
    },
    init: function() {
      this.configTiles();
    }
  },
  mounted: function() {
    this.init();
  },
  components: {
    TilePanel
  }
}
