import TilePanelMixins from '@/components/tile/tile-panel-mixins.js'
import TileConfigurer from '@/components/tile/tile-configurer.js'
import TableMixins from '../template/table/table.mixins.js'

import DashboardData from './dashboard.data.js'

let TableChart = {mixins: [TableMixins]};

let TilePanel = {
  mixins: [TilePanelMixins],
  components: {
    TableChart
  }
}

export default {
  name: 'statistic-dashboard',
  components: { TilePanel },
  data(){
  	return {
  		tiles: [],
      statisticConf: null,
      monthOptions: [{name: "三月", value: "3"},{name: "四月", value: "4"},{name: "五月", value: "5"}]
  	}
  },
  created(){
  	this.configTiles();
  },
  methods: {
    configTiles() {
      var vm = this;

      if (!this.statisticConf) {
        this.statisticConf = TileConfigurer.defaultConfigurer()
          .type('TableChart').title("工时")
          .width({ xs: 12 })
          .height({ xs: 12 })
          .transform({ xs: { x: 0, y: 0 } })
          .chart({
            monthOptions: this.monthOptions,
            data: DashboardData.gs
          }).react();
        this.tiles.push(this.statisticConf);
      }
    }
  }
}
