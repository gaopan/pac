import Modules from '../dashboard-modules.js'
import CommonUtils from '@/utils/common-utils.js'
import TypeChecker from '@/utils/type-checker.js'

import DashboardApi from '@/api/customization/dashboard.js'

import ReportInput from './input/Input.vue'
export default {
  name: 'cust-dashboard-overview',
  data() {
    return {
      modules: null,
      configuredModules: Modules,
      editingModule: null,
      moduleCreating: false
    }
  },
  components: { ReportInput },
  created() {
    this.refresh();
  },
  computed: {
    remoteModules() {
      if (!this.modules) {
        return 0;
      }
      return this.modules.filter(m => !!m.curMonthData && !!m.curMonthData.month);
    },
    unConfiguredModules() {
      if (!this.modules) {
        return [];
      }
      return this.modules.filter(m => !m.curMonthData || !m.curMonthData.month);
    }
  },
  methods: {
    refresh() {
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
              });
            }

            modules.forEach(m => {
              let oM = oData[m.key];
              if (oM) {
                m['monthData'] = oM['monthData'];
                if (TypeChecker.isObject(m["monthData"])) {
                  if (TypeChecker.isString(m['monthData'][curMonth])) {
                    m['curMonthData'] = JSON.parse(m['monthData'][curMonth]);
                  } else if (TypeChecker.isObject(m['monthData'][curMonth])) {
                    m['curMonthData'] = m["monthData"][curMonth];
                  }
                }
              } else {
                m['curMonthData'] = {};
              }
            });
            this.modules = modules;
          });
        } else {
          this.modules = modules;
        }
      });
    },
    selectModule(m) {
      this.$router.push(`/console/cust/monthly/${this.$router.currentRoute.params.company}/report`);
    },
    toEditData(m) {
      this.editingModule = m;
    },
    toAddData() {
      this.moduleCreating = true;
    },
    cancelModuleCreating() {
      this.moduleCreating = false;
    },
    cancelledEdit() {
      this.editingModule = null;
    },
    submittedEdit() {
      this.refresh();
      this.editingModule = null;
    }
  }
}
