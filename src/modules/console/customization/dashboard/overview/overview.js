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
      moduleCreating: false
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
              m.pastRS = [];
              if (oM) {
                m['monthData'] = oM['monthData'];
                if (TypeChecker.isObject(m["monthData"])) {
                  if (TypeChecker.isString(m['monthData'][curMonth])) {
                    m['curMonthData'] = JSON.parse(m['monthData'][curMonth]);
                  } else if (TypeChecker.isObject(m['monthData'][curMonth])) {
                    m['curMonthData'] = m["monthData"][curMonth];
                  }

                  for(let month in m['monthData']) {
                    if(m['monthData'].hasOwnProperty(month) && parseInt(month) < parseInt(curMonth)) {
                      let _monthData = m['monthData'][month];
                      if(TypeChecker.isString(_monthData)) {
                        _monthData = JSON.parse(_monthData);
                      }
                      m.pastRS.push({
                        month: month,
                        remind: _monthData.remind,
                        support: _monthData.support
                      });
                    }
                  }
                  m.pastRS.sort((a, b) => parseInt(a.month) > parseInt(b.month));
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
    toEditRemind(m){
      this.$set(m, 'isEditRemind', true);
    },
    submitRemind(m){
      DashboardApi.saveReport({
        name: m.key,
        month: m.curMonthData.month,
        value: m.curMonthData
      }).then(res => {
        // Noty.notifySuccess({text: '提交提醒成功！'});
        this.$set(m, 'isEditRemind', false);
      }, err => {
        Noty.notifyError({text: '提交提醒失败！'});
      });
    },
    cancelEditRemind(m){
      this.$set(m, 'isEditRemind', false);
    },
    toEditSupport(m){
      this.$set(m, 'isEditSupport', true);
    },
    submitSupport(m){
      DashboardApi.saveReport({
        name: m.key,
        month: m.curMonthData.month,
        value: m.curMonthData
      }).then(res => {
        // Noty.notifySuccess({text: '提交决策成功！'});
        this.$set(m, 'isEditSupport', false);
      }, err => {
        Noty.notifyError({text: '提交决策失败！'});
      });
    },
    cancelEditSupport(m){
      this.$set(m, 'isEditSupport', false);
    },
    toViewPastRemindAndSupport (m){
      this.$set(m, 'isViewPastRS', true);
    },
    cancelViewPastRS(m){
      this.$set(m, 'isViewPastRS', false);
    }
  }
}
