import TypeChecker from '@/utils/type-checker.js'
import TilePanelMixins from '@/components/tile/tile-panel-mixins.js'
import TileConfigurer from '@/components/tile/tile-configurer.js'
import Modules from '../dashboard-modules.js'
import DashboardApi from '@/api/customization/dashboard.js'
import DashboardData from '../dashboard.data.js'
import CommonUtils from '@/utils/common-utils.js'

import QualityMixins from '../template/quality/quality.mixins.js'
import CostMixins from '../template/cost/cost.mixins.js'
import HrMixins from '../template/hr/hr.mixins.js'
import TableMixins from '../../template/table/table.mixins.js'

let QualityChart = { mixins: [QualityMixins] },
  CostChart = { mixins: [CostMixins] },
  HrChart = { mixins: [HrMixins] },
  TableChart = { mixins: [TableMixins] };

let TilePanel = {
  mixins: [TilePanelMixins],
  components: {
    QualityChart,
    CostChart,
    HrChart,
    TableChart
  }
}

export default {
  name: 'cust-report',
  components: { TilePanel },
  data() {
    return {
      tiles: [],
      qualityConf: null,
      costConf: null,
      hrConf: null,
      securityConf: null,
      reactionConf: null,
      operationConf: null,
      monthOptions: [{ name: "一月", value: "1" }, { name: "二月", value: "2" }, { name: "三月", value: "3" }, { name: "四月", value: "4" }]
    }
  },
  created() {
    this.refreshData(function(){
      this.initTiles();
    });
  },
  methods: {
    refreshData(cb) {
      let modules = CommonUtils.deepClone(Modules);
      let curMonth = this.curMonth = new Date().getMonth() + 1 + "";
      DashboardApi.getReportOverview().then(res => {
        let oData = {};
        if (TypeChecker.isArray(res.data) && res.data.length > 0) {
          let params = [];
          res.data.forEach(d => {
            oData[d.name] = d;
            params.push({
              name: d.name,
              months: d.months
            });
          });

          DashboardApi.getReportDetail(params).then(detailRes => {
            if (TypeChecker.isArray(detailRes.data) && detailRes.data.length > 0) {
              let _oData = {};
              detailRes.data.forEach(d => {
                _oData[d.name] = d;
              });
              res.data.forEach(d => {
                d.monthData = _oData[d.name].months;
                if (TypeChecker.isObject(d.monthData)) {
                  for (let key in d.monthData) {
                    if (d.monthData.hasOwnProperty(key)) {
                      let theMonthData = d.monthData[key];
                      if (TypeChecker.isString(theMonthData)) {
                        d.monthData[key] = JSON.parse(theMonthData);
                      }
                    }
                  }
                }
              });
            }

            modules.forEach(m => {
              let oM = oData[m.key];
              if (oM) {
                m['months'] = oM['months'];
                m['monthData'] = oM['monthData'];
                if (TypeChecker.isObject(m["monthData"])) {
                  m['curMonthData'] = m["monthData"][curMonth];
                }
              } else {
                m['curMonthData'] = {};
              }
            });
            this.modules = modules;
            cb.call(this);
          });
        } else {
          this.modules = modules;
        }
      });
    },
    initTiles() {
      var vm = this;

      this.modules.forEach(m => {
        m.tileConfig = TileConfigurer.defaultConfigurer()
        .type(m.dashboardConfig.type).title(m.dashboardConfig.title)
        .width(m.dashboardConfig.width).height(m.dashboardConfig.height)
        .transform(m.dashboardConfig.transform)
        .chart({
          data: m.dashboardConfig.adaptData(m.monthData, m.months),
          months: m.months
        }).react();
        this.tiles.push(m.tileConfig);
      });
    },
    configTiles() {
      var vm = this;

      var vm = this;

      if (!this.qualityConf) {
        this.qualityConf = TileConfigurer.defaultConfigurer()
          .type('QualityChart').title("质量")
          .width({ xs: 4 })
          .height({ xs: 6 })
          .transform({ xs: { x: 0, y: 0 } })
          .chart({
            data: DashboardData.quality
          }).react();
        this.tiles.push(this.qualityConf);
      }

      if (!this.costConf) {
        this.costConf = TileConfigurer.defaultConfigurer()
          .type('CostChart').title("成本")
          .width({ xs: 4 })
          .height({ xs: 6 })
          .transform({ xs: { x: 4, y: 0 } })
          .chart({
            data: DashboardData.cost
          }).react();
        this.tiles.push(this.costConf);
      }

      if (!this.hrConf) {
        this.hrConf = TileConfigurer.defaultConfigurer()
          .type('HrChart').title("人力资源")
          .width({ xs: 4 })
          .height({ xs: 6 })
          .transform({ xs: { x: 8, y: 0 } })
          .chart({
            data: DashboardData.hr
          }).react();
        this.tiles.push(this.hrConf);
      }

      if (!this.securityConf) {
        this.securityConf = TileConfigurer.defaultConfigurer()
          .type('TableChart').title("安全")
          .width({ xs: 4 })
          .height({ xs: 6 })
          .transform({ xs: { x: 0, y: 6 } })
          .chart({
            title: "安全状态",
            monthOptions: this.monthOptions,
            data: DashboardData.security
          }).react();
        this.tiles.push(this.securityConf);
      }

      if (!this.reactionConf) {
        this.reactionConf = TileConfigurer.defaultConfigurer()
          .type('TableChart').title("响应")
          .width({ xs: 4 })
          .height({ xs: 6 })
          .transform({ xs: { x: 4, y: 6 } })
          .chart({
            title: "响应状态",
            monthOptions: this.monthOptions,
            data: DashboardData.reaction
          }).react();
        this.tiles.push(this.reactionConf);
      }

      if (!this.operationConf) {
        this.operationConf = TileConfigurer.defaultConfigurer()
          .type('TableChart').title("运营")
          .width({ xs: 4 })
          .height({ xs: 6 })
          .transform({ xs: { x: 8, y: 6 } })
          .chart({
            title: "运营情况",
            monthOptions: this.monthOptions,
            data: DashboardData.operation
          }).react();
        this.tiles.push(this.operationConf);
      }

    }
  }
}
