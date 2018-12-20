import Modules from '../dashboard-modules.js'
import CommonUtils from '@/utils/common-utils.js'
import TypeChecker from '@/utils/type-checker.js'
import Noty from '@/utils/noty-operation.js'
import DashboardApi from '@/api/customization/dashboard.js'

import ReportInput from './input/Input.vue'

export default {
  name: 'cust-dashboard-overview',
  data() {
    return {
      modules: null,
      configuredModules: Modules,
      editingModule: null,
      moduleCreating: false,
      isEditRemind: false,
      isEditSupport: false,
      isViewPastRS: false,
      companyId: null,
      rs: {
        curMonthData: { remind: null, support: null },
        pastData: null,
        data: null
      }
    }
  },
  components: { ReportInput },
  created() {
    this.user = this.$store.getters.userProfile;
    this.companyId = this.$router.currentRoute.params.company.substr(this.$router.currentRoute.params.company.lastIndexOf('_') + 1);
    this.refresh();
  },
  computed: {
    remoteModules() {
      if (!this.modules) {
        return 0;
      }
      return this.modules.filter(m => !!m.curMonthData && !!m.curMonthData.monthData && !!m.curMonthData.monthData.month);
    },
    unConfiguredModules() {
      if (!this.modules) {
        return [];
      }
      return this.modules.filter(m => !m.curMonthData || !m.curMonthData.monthData || !m.curMonthData.monthData.month);
    }
  },
  methods: {
    refresh() {
      let modules = CommonUtils.deepClone(Modules);
      let nCurMonth = new Date().getMonth() + 1,
        nCurYear = new Date().getFullYear();
      let curMonth = this.curMonth = nCurYear + "-" + nCurMonth;
      DashboardApi.getReportByCompanyId(this.companyId).then(res => {
        if (TypeChecker.isArray(res.data) && res.data.length > 0) {
          this.rs.pastData = [];
          res.data.forEach(d => {
            let month = d.month,
              monthData = null;
            let arr = month.split('-'),
              nMonth = parseInt(arr[1]),
              nYear = parseInt(arr[0]);
            if (TypeChecker.isString(d.responsensupport)) {
              try {
                monthData = JSON.parse(d.responsensupport);
              } catch(err){
                monthData = {};
              }
            } else if (TypeChecker.isObject(d.responsensupport)) {
              monthData = d.responsensupport;
            }
            if (TypeChecker.isObject(monthData)) {
              if (nYear == nCurYear && nMonth == nCurMonth) {
                this.rs.curMonthData.remind = monthData.remind;
                this.rs.curMonthData.support = monthData.support;
              } else if (nYear < nCurYear || (nYear == nCurYear && nMonth < nCurMonth)) {
                this.rs.pastData.push({
                  month: month,
                  remind: monthData.remind,
                  support: monthData.support
                });
              }
            }
          });
        }
      });
      DashboardApi.companyModulesByMonths(this.companyId, [curMonth]).then(res => {
        let oData = {};
        res.data.forEach(report => {
          if (report.reportModules) {
            report.reportModules.forEach(m => {
              let obj = oData[m.moduleName] = {};
              try {
                obj.monthData = JSON.parse(m.value);
              } catch(err){
                obj.monthData = {};
              }
              
              obj.id = m.id;
              obj.reportId = m.reportId;
            });
          }
        });

        modules.forEach(m => {
          let oM = oData[m.key];
          m['monthData'] = {};
          if (oM) {
            m['curMonthData'] = oM;
            m['monthData'][curMonth] = oM;
          } else {
            m['curMonthData'] = {};
          }
        });

        this.modules = modules;
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
    },
    toEditRemind() {
      this.isEditRemind = true;
    },
    submitRemind(m) {
      DashboardApi.saveReport({
        name: this.rs.key,
        month: this.curMonth,
        value: this.rs.curMonthData
      }).then(res => {
        Noty.notifySuccess({ text: '提交提醒成功！' });
        this.isEditRemind = false;
      }, err => {
        Noty.notifyError({ text: '提交提醒失败！' });
      });
    },
    cancelEditRemind() {
      this.isEditRemind = false;
    },
    toEditSupport() {
      this.isEditSupport = true;
    },
    submitSupport(m) {
      DashboardApi.saveReport({
        name: this.rs.key,
        month: this.curMonth,
        value: this.rs.curMonthData
      }).then(res => {
        Noty.notifySuccess({ text: '提交决策成功！' });
        this.isEditSupport = false;
      }, err => {
        Noty.notifyError({ text: '提交决策失败！' });
      });
    },
    cancelEditSupport(m) {
      this.isEditSupport = false;
    },
    toViewPastRemindAndSupport(m) {
      this.isViewPastRS = true;
    },
    cancelViewPastRS(m) {
      this.isViewPastRS = false;
    }
  }
}
