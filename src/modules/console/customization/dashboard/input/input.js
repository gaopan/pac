import Modules from '../dashboard-modules.js'
import CommonUtils from '@/utils/common-utils.js'
import TypeChecker from '@/utils/type-checker.js'
import Noty from '@/utils/noty-operation.js'
import DashboardApi from '@/api/customization/dashboard.js'
import BScroll from "better-scroll"
import ReportInput from './input-form/Input.vue'

import shared from '@/shared.js'

let eventHub = shared.eventHub

export default {
  data() {
    return {
      modules: null,
      editingModule: null,
      companyId: null,
      curMonth: null
    };
  },
  components: { ReportInput },
  created() {
    eventHub.$on("global-date", this.onGlobalDateChange);
    this.companyId = this.$router.currentRoute.params.companyId;
    let globalDate = new Date(localStorage.getItem("global-date")) || new Date();
    this.curMonth = globalDate.getFullYear() + "-" + (globalDate.getMonth() + 1);
    this.init();
  },
  mounted() {},
  methods: {
    init() {
      this.prepareModules(function() {
        this.editingModule = this.modules[0];
        this.tabScroll = new BScroll(this.$refs.tabs, {
          probeType: 3,
          scrollX: true,
          scrollY: false,
          click: true
        });
      });
    },
    prepareModules(cb) {
      let modules = CommonUtils.deepClone(Modules);

      let curMonth = this.curMonth;
      DashboardApi.companyModulesByMonths(this.companyId, [curMonth]).then(res => {
        let oData = {};
        res.data.forEach(report => {
          if (report.reportModules) {
            report.reportModules.forEach(m => {
              let obj = oData[m.moduleName] = {};
              try {
                obj.monthData = JSON.parse(m.value);
              } catch (err) {
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

        if (cb) {
          cb.call(this);
        }
      });
    },
    activeModule(m) {
      this.editingModule = null;
      setTimeout(() => {
        this.editingModule = m;
      }, 0);
    },
    cancelledEdit() {
      this.editingModule = null;
    },
    submittedEdit() {
      this.refresh();
      this.editingModule = null;
    },
    refresh(){
      let editingModuleName = null;
      if (this.editingModule) {
        editingModuleName = this.editingModule.name;
      }
      this.editingModule = null;
      this.prepareModules(function() {
        if (editingModuleName) {
          this.modules.every(m => {
            if (m.name == editingModuleName) {
              this.editingModule = m;
              return false;
            }
            return true;
          });
        } else {
          this.editingModule = this.modules[0];
        }
        this.tabScroll.refresh();
      });
    },
    onGlobalDateChange(newDate) {
      let theDate = new Date(newDate);
      this.curMonth = theDate.getFullYear() + '-' + (theDate.getMonth() + 1);
      this.refresh();
    }
  },
  beforeDestroy(){
    eventHub.$off("global-date", this.onGlobalDateChange);
  }
}
