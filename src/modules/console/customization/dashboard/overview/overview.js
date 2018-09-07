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
      rs: {
        key: 'rs',
        curMonthData: { remind: null, support: null },
        pastData: null,
        data: null
      }
    }
  },
  components: { ReportInput },
  created() {
    this.user = this.$store.getters.userProfile;
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
      let curMonth = this.curMonth = new Date().getFullYear() + "-" + (new Date().getMonth() + 1);
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

            if (oData[this.rs.key]) {
              this.rs.data = oData[this.rs.key];
              if (TypeChecker.isObject(this.rs.data.monthData)) {
                if (TypeChecker.isObject(this.rs.data.monthData[curMonth])) {
                  this.rs.curMonthData.remind = this.rs.data.monthData[curMonth].remind;
                  this.rs.curMonthData.support = this.rs.data.monthData[curMonth].support;
                }

                this.rs.pastData = [];
                for (let month in this.rs.data.monthData) {
                  if (parseInt(month) < parseInt(curMonth)) {
                    let _monthData = this.rs.data.monthData[month];
                    if (TypeChecker.isObject(_monthData)) {
                      this.rs.pastData.push({
                        month: month,
                        remind: _monthData.remind,
                        support: _monthData.support
                      });
                    }
                  }
                }
              }
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
