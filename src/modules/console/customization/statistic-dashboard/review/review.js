import TypeChecker from '@/utils/type-checker.js'
import CommonUtils from '@/utils/common-utils.js'
import PeriodUtils from '../../period-utils.js'
import DataUtils from '@/utils/data-utils.js'
import Noty from '@/utils/noty-operation.js'
import DashboardApi from '@/api/customization/dashboard.js'
import CompanyApi from '@/api/customization/company.js'
import ChartView from '../chart-view/ChartView.vue'
import LeapSelect from '@/components/leap-select/LEAPSelect.vue'

let keys = [{
  name: '企业员工人数',
  value: 'qyygrs',
  unit: "人"
}, {
  name: "研发人员人数",
  value: "yfryrs",
  unit: "人"
}, {
  name: "法定工作总时长",
  value: "fdgzzsc",
  unit: "小时"
}, {
  name: "研发人员法定工作总时长",
  value: "yfryfdgzzsc",
  unit: "小时"
}, {
  name: "实际工作时长",
  value: "sjgzsc",
  unit: "小时"
}, {
  name: "研发人员实际工作时长",
  value: "yfrysjgzsc",
  unit: "小时"
}, {
  name: "加班总时长",
  value: "jbzsc",
  unit: "小时"
}, {
  name: "研发人员加班总时长",
  value: "yfryjbzsc",
  unit: "小时"
}, {
  name: "法定工作时长（人均）",
  value: "fdgzscrj",
  unit: "小时"
}, {
  name: "研发人员法定工作时长（人均）",
  value: "yfryfdgzscrj",
  unit: "小时"
}, {
  name: "实际工作时长（人均）",
  value: "sjgzscrj",
  unit: "小时"
}, {
  name: "研发人员实际工作时长（人均）",
  value: "yfrysjgzscrj",
  unit: "小时"
}, {
  name: "加班时长（人均）",
  value: "jbscrj",
  unit: "小时"
}, {
  name: "研发人员加班时长（人均）",
  value: "yfryjbscrj",
  unit: "小时"
}]

export default {
  components: { ChartView, LeapSelect },
  data() {
    return {
      company: {},
      data: null,
      years: [],
      selectedYear: null,
      chartData: null,
      headers: [],
      months: [],
      isNoData: true
    }
  },
  created() {
    this.companyId = this.$route.params.companyId;
    this.user = this.$store.getters.userProfile;
    this.curYear = new Date().getFullYear() + "";
    this.curMonth = new Date().getFullYear() + "-" + (new Date().getMonth() + 1);
    this.refresh();
  },
  methods: {
    changedYear(args) {
      this.selectedYear = args.value;
      this.refreshChartData();
    },
    refreshChartData() {
      let vm = this;
      let curMonth = this.curMonth,
        company = this.company,
        stats = this.stats,
        data = {},
        headers = [],
        chartData = [],
        months = []
      stats.forEach(oneMonthData => {
        let monthDataValue = null,
          _data = [],
          monthData = {},
          excludedKeys = ["isSubmitted", "isApproved"];
        data[oneMonthData.month] = monthData;
        try {
          monthDataValue = JSON.parse(oneMonthData.value);
        } catch (err) {}
        if (monthDataValue) {
          if (monthDataValue.isApproved || this.user.isAdmin) {
            let theYear = oneMonthData.month.split('-')[0];
            if (theYear == this.selectedYear) {
              months.push(oneMonthData.month);
              Object.keys(monthDataValue).forEach(_key => {
                if (excludedKeys.indexOf(_key) < 0) {
                  let theKey = keys.filter(k => k.value == _key)[0];
                  if (headers.filter(h => h.key == _key).length < 1) {
                    headers.push({
                      name: theKey.name,
                      key: _key,
                      unit: theKey.unit
                    });
                  }
                  monthData[_key] = monthDataValue[_key];
                  let filteredChartData = chartData.filter(d => d.key == _key);
                  if (filteredChartData.length > 0) {
                    let compChartData = filteredChartData[0];
                    compChartData.months.push({
                      month: oneMonthData.month,
                      value: monthDataValue[_key]
                    });
                  } else {
                    chartData.push({
                      name: theKey.name,
                      key: _key,
                      months: [{
                        month: oneMonthData.month,
                        value: monthDataValue[_key]
                      }]
                    });
                  }
                }
              });
            }
          }
        }
      });
      months.sort((a, b) => {
        return DataUtils.monthComparison(a, b);
      });
      this.isNoData = headers.length < 1;
      this.headers = headers;
      this.months = months;
      this.data = data;
      this.chartData = chartData;
    },
    refresh() {
      let vm = this;
      let curMonth = this.curMonth,
        company = null,
        stats = null;
      let compPromise = CompanyApi.company(this.companyId);
      compPromise.then(res => {
        company = this.company = res.data;
      });
      let statPromise = DashboardApi.getStatisticsByCompanyId(this.companyId);
      statPromise.then(res => {
        stats = res.data;
      });
      Promise.all([compPromise, statPromise]).then(() => {
        let years = [],
          selectedYear = null;
        stats.forEach(oneMonthData => {
          let monthDataValue = null,
            _data = [],
            excludedKeys = ["isSubmitted", "isApproved"];
          try {
            monthDataValue = JSON.parse(oneMonthData.value);
          } catch (err) {}
          if (monthDataValue && (monthDataValue.isApproved || this.user.isAdmin)) {
            let theYear = oneMonthData.month.split('-')[0];
            if (years.filter(y => y.value == theYear).length < 1) {
              years.push({
                name: `${theYear} 年`,
                value: theYear
              });

              if (this.curYear == theYear) {
                selectedYear = theYear;
              }
            }
          }
        });
        if (!selectedYear && years.length > 0) {
          selectedYear = years[0].value;
        }

        this.years = years;
        this.selectedYear = selectedYear;
        this.stats = stats;

        this.refreshChartData();

      });
    }
  }
}
