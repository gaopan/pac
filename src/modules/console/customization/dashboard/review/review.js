import Modules from '../dashboard-modules.js'
import CommonUtils from '@/utils/common-utils.js'
import TypeChecker from '@/utils/type-checker.js'
import DashboardApi from '@/api/customization/dashboard.js'
import BScroll from "better-scroll"
import QualityMixins from '../template/quality/quality.mixins.js'
import CostMixins from '../template/cost/cost.mixins.js'
import HrMixins from '../template/hr/hr.mixins.js'
import TableMixins from '../../template/table/table.mixins.js'

import shared from '@/shared.js'

let eventHub = shared.eventHub

let QualityChart = { mixins: [QualityMixins] },
  CostChart = { mixins: [CostMixins] },
  HrChart = { mixins: [HrMixins] },
  TableChart = { mixins: [TableMixins] };

export default {
  data() {
    return {
      modules: null,
      currentModule: null,
      curMonth: null
    };
  },
  components: { QualityChart, CostChart, HrChart, TableChart },
  created() {
    this.user = this.$store.getters.userProfile;
    eventHub.$on("global-date", this.onGlobalDateChange);
    this.companyId = this.$router.currentRoute.params.companyId;
    let globalDate = new Date(localStorage.getItem("global-date")) || new Date();
    this.curMonth = globalDate.getFullYear() + "-" + (globalDate.getMonth() + 1);
    this.init();
  },
  methods: {
    init() {
      this.refreshData(function() {
        this.currentModule = this.modules[0];
        this.tabScroll = new BScroll(this.$refs.tabs, {
          probeType: 3,
          scrollX: true,
          scrollY: false,
          click: true
        });
      });
    },
    activeModule(m) {
      this.currentModule = null;
      setTimeout(() => {
        this.currentModule = m;
      }, 0);
    },
    refreshData(cb) {
      let modules = CommonUtils.deepClone(Modules),
          curMonth = this.curMonth,
          allMonth = getAllMonthString();

      function getAllMonthString(){
        let result = [],
            year = curMonth.split('-')[0];
        for(let i = 1; i <= 12; i++){
          result.push(`${year}-${i}`);
        }
        return result;
      }
      DashboardApi.companyModulesByMonths(this.companyId, allMonth).then(detailRes=>{
        let _oData = {};
        if (TypeChecker.isArray(detailRes.data) && detailRes.data.length > 0) {
          detailRes.data.forEach(d => {
            let month = d.report.month;

            if (d.reportModules) {
              d.reportModules.forEach(rm => {
                let obj = _oData[rm.moduleName];
                if (!obj) obj = _oData[rm.moduleName] = {};
                if (!obj.months) obj.months = [];
                if (!obj.monthData) obj.monthData = {};
                let rmValue = rm.value;
                let rmValueObj = null;
                try {
                  rmValueObj = JSON.parse(rmValue);
                } catch (err) {}
                if (rmValueObj && (this.user.isAdmin || this.user.isAA || rmValueObj.isApproved)) {
                  if (obj.months.indexOf(month)) {
                    obj.months.push(month);
                  }
                  obj.monthData[month] = rmValueObj;
                }
              });
            }
          });
        }

        modules.forEach(m => {
          m.dashboardConfig.data = {
            noPeriodSelector: true,
            curMonth:curMonth
          };
          let oM = _oData[m.key];
          if (oM) {
            // m['months'] = oM["months"];
            // m['monthData'] = oM['monthData'];
            let panelMonth = null;

            if(m.name ==="成本"|| m.name==="人力资源"){
              panelMonth = oM["months"];
            }else{
              panelMonth = ~(oM["months"].indexOf(curMonth)) ? [curMonth] : undefined;
            }

            let panelMonthData = {};
            if(m.name==="成本"||m.name==="人力资源"){
              panelMonthData = oM['monthData'];
            }else{
              
              if(~(oM["months"].indexOf(curMonth))){
                panelMonthData[curMonth] = oM['monthData'][curMonth];
              }else{
                panelMonthData = undefined;
              }

            }
            m['months'] = panelMonth;
            m['monthData'] = panelMonthData;

            if (TypeChecker.isObject(m["monthData"])) {
              m['curMonthData'] = m["monthData"][curMonth];
            }
          } else {
            m['curMonthData'] = {};
          }

          m.dashboardConfig.data.months = m.months;
          m.dashboardConfig.data.data = m.dashboardConfig.adaptData(m.monthData, m.months);
        });

        this.modules = modules;
        cb.call(this);
      },err=>{

      })

      /*DashboardApi.companyModulesByMonths(this.companyId, [curMonth]).then(detailRes => {
        let _oData = {};
        if (TypeChecker.isArray(detailRes.data) && detailRes.data.length > 0) {
          detailRes.data.forEach(d => {
            let month = d.report.month;

            if (d.reportModules) {
              d.reportModules.forEach(rm => {
                let obj = _oData[rm.moduleName];
                if (!obj) obj = _oData[rm.moduleName] = {};
                if (!obj.months) obj.months = [];
                if (!obj.monthData) obj.monthData = {};
                let rmValue = rm.value;
                let rmValueObj = null;
                try {
                  rmValueObj = JSON.parse(rmValue);
                } catch (err) {}
                if (rmValueObj && (this.user.isAdmin || this.user.isAA || rmValueObj.isApproved)) {
                  if (obj.months.indexOf(month)) {
                    obj.months.push(month);
                  }
                  obj.monthData[month] = rmValueObj;
                }
              });
            }
          });
        }

        modules.forEach(m => {
          m.dashboardConfig.data = {
            noPeriodSelector: true
          };
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
          m.dashboardConfig.data.months = m.months;
          m.dashboardConfig.data.data = m.dashboardConfig.adaptData(m.monthData, m.months);
        });

        this.modules = modules;
        cb.call(this);
      });*/
    },
    refresh() {
      let currentModuleName = null;
      if (this.currentModule) {
        currentModuleName = this.currentModule.name;
      }
      this.currentModule = null;
      this.refreshData(function() {
        if (currentModuleName) {
          this.modules.every(m => {
            if (m.name == currentModuleName) {
              this.currentModule = m;
              return false;
            }
            return true;
          });
        } else {
          this.currentModule = this.modules[0];
        }
        this.tabScroll.refresh();
      });
    },
    onGlobalDateChange(newDate) {
      let theDate = new Date(newDate);
      this.curMonth = theDate.getFullYear() + '-' + (theDate.getMonth() + 1);
      this.refresh();
    }
  }
}
