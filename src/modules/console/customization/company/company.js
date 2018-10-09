import CommonUtils from '@/utils/common-utils.js'
import TypeChecker from '@/utils/type-checker.js'
import Noty from '@/utils/noty-operation.js'
import DashboardApi from '@/api/customization/dashboard.js'

export default {
  data() {
    return {
      companies: [{
        name: '中海庭',
        key: 'zht',
        isEditSupport: false,
        isViewPastRS: false,
        rs: {
          key: '中海庭-rs',
          curMonthData: { remind: null, support: null },
          pastData: null,
          data: null
        }
      }]
    };
  },
  created() {
    this.refresh();
  },
  methods: {
    toDashboard(company) {
      this.$router.push('/console/cust/monthly/' + company.key + '/report');
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
      DashboardApi.getReportOverview().then(res => {
        let oData = {},
          aResData = [];
        if (TypeChecker.isArray(res.data) && res.data.length > 0) {
          let params = [],
            rsKeyArr = [];
          this.companies.forEach(comp => {
            rsKeyArr.push(comp.rs.key);
          });
          res.data.forEach(d => {
            if (rsKeyArr.indexOf(d.name) > -1) {
              aResData.push(d);
              oData[d.name] = d;
              params.push({
                name: d.name,
                months: d.months
              });
            }
          });

          DashboardApi.getReportDetail(params).then(detailRes => {
            if (TypeChecker.isArray(detailRes.data) && detailRes.data.length > 0) {
              let _oData = {};
              detailRes.data.forEach(d => {
                _oData[d.name] = d;
              });
              aResData.forEach(d => {
                d.monthData = _oData[d.name].months;
              });
              aResData.forEach(d => {
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

            this.companies.forEach(comp => {
              if (oData[comp.rs.key]) {
                comp.rs.data = oData[comp.rs.key];
                if (TypeChecker.isObject(comp.rs.data.monthData)) {
                  if (TypeChecker.isObject(comp.rs.data.monthData[curMonth])) {
                    comp.rs.curMonthData.remind = comp.rs.data.monthData[curMonth].remind;
                    comp.rs.curMonthData.support = comp.rs.data.monthData[curMonth].support;
                  }

                  comp.rs.pastData = [];
                  for (let month in comp.rs.data.monthData) {
                    let arr = month.split('-'),
                      nMonth = parseInt(arr[1]),
                      nYear = parseInt(arr[0]);
                    if (nYear < nCurYear || (nYear == nCurYear && nMonth < nCurMonth)) {
                      let _monthData = comp.rs.data.monthData[month];
                      if (TypeChecker.isObject(_monthData)) {
                        comp.rs.pastData.push({
                          month: month,
                          remind: _monthData.remind,
                          support: _monthData.support
                        });
                      }
                    }
                  }
                }
              }
            });
          });
        }
      });
    }
  }
}
