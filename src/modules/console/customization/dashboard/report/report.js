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
      companyId: null,
      qualityConf: null,
      costConf: null,
      hrConf: null,
      securityConf: null,
      reactionConf: null,
      operationConf: null,
    }
  },
  created() {
    this.companyId = this.$router.currentRoute.params.company.substr(this.$router.currentRoute.params.company.lastIndexOf('_') + 1);
    this.refreshData(function(){
      this.initTiles();
    });
  },
  methods: {
    refreshData(cb) {
      let modules = CommonUtils.deepClone(Modules);
      let curMonth = this.curMonth = new Date().getFullYear() + '-' + (new Date().getMonth() + 1);
      DashboardApi.getReportByCompanyId(this.companyId).then(res => {
        let months = [];
        if (TypeChecker.isArray(res.data) && res.data.length > 0) {
          res.data.forEach(d => {
            months.push(d.month);
          });

          DashboardApi.companyModulesByMonths(this.companyId, months).then(detailRes => {
            let _oData = {};
            if (TypeChecker.isArray(detailRes.data) && detailRes.data.length > 0) {
              detailRes.data.forEach(d => {
                let month = d.report.month;

                if(d.reportModules) {
                  d.reportModules.forEach(rm => {
                    let obj = _oData[rm.moduleName];
                    if(!obj) obj = _oData[rm.moduleName] = {};
                    if(!obj.months) obj.months = [];
                    if(!obj.monthData) obj.monthData = {};
                    let rmValue = rm.value;
                    let rmValueObj = null;
                    try {
                      rmValueObj = JSON.parse(rmValue);
                    } catch(err){}
                    if(rmValueObj && rmValueObj.isApproved) {
                      if(obj.months.indexOf(month)) {
                        obj.months.push(month);
                      }
                      obj.monthData[month] = rmValueObj;
                    }
                  });
                }
              });
            }

            modules.forEach(m => {
              let oM = _oData[m.key];
              if (oM) {
                m['months'] = oM["months"];
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
          cb.call(this);
        }
      });
    },
    initTiles() {
      var vm = this;

      this.modules.forEach(m => {
        m.tileConfig = TileConfigurer.defaultConfigurer()
        .type(m.dashboardConfig.type).title(m.dashboardConfig.title)
        .width(m.dashboardConfig.width).height(m.dashboardConfig.height)
        .allowScroll(!!m.dashboardConfig.allowScroll)
        .transform(m.dashboardConfig.transform)
        .chart({
          data: m.dashboardConfig.adaptData(m.monthData, m.months),
          // module: m,
          months: m.months
        }).react();
        this.tiles.push(m.tileConfig);
      });
    }
  }
}
