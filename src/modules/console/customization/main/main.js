import CommonUtils from '@/utils/common-utils.js'
import TypeChecker from '@/utils/type-checker.js'
import Noty from '@/utils/noty-operation.js'
import CompanyApi from '@/api/customization/company.js'
import ProjectApi from '@/api/customization/project.js'
import DashboardApi from '@/api/customization/dashboard.js'
import LeapSelect from '@/components/leap-select/LEAPSelect.vue'
import Modules from '../dashboard/dashboard-modules.js'
import CommonGenerators from '@/utils/common-generators.js'

let UUIDGenerator = CommonGenerators.UUIDGenerator

import shared from '@/shared.js'

let eventHub = shared.eventHub

export default {
  data() {
    return {
      companySelectOptions: null,
      companies: null,
      currentComp: null,
      curMonth: null
    };
  },
  components: { LeapSelect },
  created() {
    this.loadId = UUIDGenerator.purchase();
    this.loadId2 = UUIDGenerator.purchase();
    this.user = this.$store.getters.userProfile;
    eventHub.$on("global-date", this.onGlobalDateChange);
    let globalDate = new Date(localStorage.getItem("global-date")) || new Date();
    this.curMonth = globalDate.getFullYear() + "-" + (globalDate.getMonth() + 1);
    this.init();
  },
  filters: {
    moduleName(key) {
      let moduleName = '';
      Modules.every(m => {
        if (m.key == key) {
          moduleName = m.name;
          return false;
        }
        return true;
      });
      return moduleName;
    }
  },
  computed: {
    curReportModules() {
      if (this.currentComp && this.currentComp.reports.length > 0) {
        let curMonthReport = null;
        this.currentComp.reports.every(r => {
          if (r.month == this.curMonth) {
            curMonthReport = r;
            if(r.reportModules) {
              r.reportModules.forEach(m => {
                if(TypeChecker.isString(m.value)){
                  try{
                    m.value = JSON.parse(m.value);
                  } catch(err){ console.error(err); }
                }
              });
            }
            return false;
          }
          return true;
        });
        return curMonthReport ? curMonthReport.reportModules : [];
      }
      return [];
    }
  },
  watch: {
    currentComp(val) {
      eventHub.$emit("global-params-change-companyId", this.currentComp.id);
      eventHub.$emit("global-params-change-companyName", this.currentComp.name);
      eventHub.$emit("start-mini-loader", { id: this.loadId2, roughTime: 1000 * 10 });
      localStorage.setItem("current-company-id", this.currentComp.id);
      let projects = [],
        reports = [];
      let projectPromise = ProjectApi.getProjectsByCompanyId(this.currentComp.id);
      projectPromise.then(res => {
        projects = res.data;
        projects.forEach(proj => {
          let curMonthTask = null;
          if(proj.monthlyTask && proj.monthlyTask.length > 0) {
            proj.monthlyTask.every(task => {
              if(task.month == this.curMonth) {
                curMonthTask = task;
                return false;
              }
              return true;
            });
          }
          if(curMonthTask) {
            proj.monthlyStatus = curMonthTask.status;
          }
        });
      });
      let reportPromise = DashboardApi.getReportByCompanyId(this.currentComp.id);
      reportPromise.then(res => {
        reports = res.data;
      });

      Promise.all([projectPromise, reportPromise]).then(() => {
        projects.forEach(p => {
          if (p.description) {
            p.shortDesc = p.description.length > 80 ? p.description.substr(0, 80) : p.description;
          }
        });

        this.currentComp.reports = reports;
        this.currentComp.projects = projects;
        eventHub.$emit("finish-mini-loader", { id: this.loadId2 });
      });
    }
  },
  methods: {
    switchCompany(args) {
      this.companies.every(comp => {
        if (comp.id == args.value) {
          this.currentComp = comp;
          return false;
        }
        return true;
      });
    },
    init() {
      let companies = [];
      let companyPromise = this.user.isAdmin ? CompanyApi.companies() : CompanyApi.userCompanies(this.user.id);
      eventHub.$emit("start-mini-loader", { id: this.loadId, roughTime: 1000 * 10 });
      let localCompanyId = localStorage.getItem("current-company-id");
      companyPromise.then(res => {
        companies = res.data.map(comp => {
          return {
            id: `${comp.id}`,
            name: comp.name,
            description: comp.description,
            projects: [],
            reports: []
          }
        });

        this.companies = companies;
        if(localCompanyId) {
          this.companies.every(comp => {
            if(comp.id == localCompanyId) {
              this.currentComp = comp;
              return false;
            }
            return true;
          });
        } 

        if(!this.currentComp && this.companies.length > 0) {
          this.currentComp = this.companies[0];
        }

        this.companySelectOptions = this.companies.map(comp => {
          return {
            name: `${comp.name}`,
            value: comp.id
          };
        });

        eventHub.$emit("finish-mini-loader", { id: this.loadId, roughTime: 1000 * 10 });
      });
    },
    onGlobalDateChange(newDate) {
      let theDate = new Date(newDate);
      this.curMonth = theDate.getFullYear() + '-' + (theDate.getMonth() + 1);
    },
    toViewReport(m) {
      this.$router.push(`/console/cust/monthly/${this.currentComp.id}/review`);
    },
    toViewProject(p) {
      this.$router.push(`/console/cust/project/${this.currentComp.id}/review`);
    }
  },
  beforeDestroy() {
    eventHub.$off("global-date", this.onGlobalDateChange);
  }
}
