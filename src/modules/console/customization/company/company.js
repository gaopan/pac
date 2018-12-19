import CommonUtils from '@/utils/common-utils.js'
import TypeChecker from '@/utils/type-checker.js'
import CompanyApi from '@/api/customization/company.js'
import Noty from '@/utils/noty-operation.js'
import DashboardApi from '@/api/customization/dashboard.js'

export default {
  data() {
    return {
      companies: null
    };
  },
  created() {
    this.user = this.$store.getters.userProfile;
    this.getCompanies(this.refresh);
  },
  methods: {
    getCompanies(cb) {
      CompanyApi.userCompanies(this.user.id).then(res => {
        this.companies = res.data.map(comp => {
          return {
            id: comp.id,
            name: comp.name,
            description: comp.description,
            key: comp.id,
            isEditSupport: false,
            isViewPastRS: false,
            rs: {
              curMonthData: { remind: null, support: null },
              pastData: null,
              data: null
            }
          }
        });
        if(TypeChecker.isFunction(cb)) {
          cb.call(this);
        }
      });
    },
    toDashboard(company) {
      this.$router.push('/console/cust/monthly/' + company.name + "_" + company.key + '/report');
    },
    toEditDashboard(company){
      this.$router.push('/console/cust/monthly/' + company.name + "_" + company.key + '/overview');
    },
    toViewPastRemindAndSupport(company) {
      company.isViewPastRS = true;
    },
    toEditSupport(company) {
      company.isEditSupport = true;
    },
    cancelViewPastRS(company) {
      company.isViewPastRS = false;
    },
    submitSupport(company) {
      DashboardApi.saveReport({
        name: company.rs.key,
        month: this.curMonth,
        value: company.rs.curMonthData
      }).then(res => {
        Noty.notifySuccess({ text: '提交决策成功！' });
        company.isEditSupport = false;
      }, err => {
        Noty.notifyError({ text: '提交决策失败！' });
      });
    },
    cancelEditSupport(company) {
      company.isEditSupport = false;
    },
    refresh() {
      let nCurMonth = new Date().getMonth() + 1,
        nCurYear = new Date().getFullYear();
      let curMonth = this.curMonth = nCurYear + "-" + nCurMonth;
      DashboardApi.getAllReports().then(res => {
        let oData = {},
          aResData = [];
        if (TypeChecker.isArray(res.data) && res.data.length > 0) {
          this.companies.forEach(comp => {
            comp.rs.pastData = [];
          });
          res.data.forEach(d => {
            this.companies.every(comp => {
              if (comp.id == d.companyId) {
                let month = comp.month,
                  monthData = null;
                let arr = month.split('-'),
                  nMonth = parseInt(arr[1]),
                  nYear = parseInt(arr[0]);
                if (TypeChecker.isString(d.responsensupport)) {
                  monthData = JSON.parse(d.responsensupport);
                } else if (TypeChecker.isObject(d.responsensupport)) {
                  monthData = d.responsensupport;
                }
                if (TypeChecker.isObject(monthData)) {
                  if (nYear == nCurYear && nMonth == nCurMonth) {
                    comp.rs.curMonthData.remind = monthData.remind;
                    comp.rs.curMonthData.support = monthData.support;
                  } else if (nYear < nCurYear || (nYear == nCurYear && nMonth < nCurMonth)) {
                    comp.rs.pastData.push({
                      month: month,
                      remind: monthData.remind,
                      support: monthData.support
                    });
                  }
                }

                return false;
              }
              return true;
            });
          });
        }
      });
    }
  }
}
