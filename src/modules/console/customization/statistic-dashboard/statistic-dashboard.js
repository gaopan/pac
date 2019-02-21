import TypeChecker from '@/utils/type-checker.js'
import CommonUtils from '@/utils/common-utils.js'
import PeriodSelector from '../period-selector/PeriodSelector.vue'
import EditForm from './input/Input.vue'
import PeriodUtils from '../period-utils.js'
import DataUtils from '@/utils/data-utils.js'
import Noty from '@/utils/noty-operation.js'
import DashboardApi from '@/api/customization/dashboard.js'
import CompanyApi from '@/api/customization/company.js'
import DashboardData from './dashboard.data.js'
import LeapSelect from '@/components/leap-select/LEAPSelect.vue'
import ChartView from './chart-view/ChartView.vue'

const REQUEST_KEY = 'statistic'

export default {
  name: 'statistic-dashboard',
  components: { PeriodSelector, EditForm, LeapSelect, ChartView },
  data() {
    return {
      periods: null,
      data: null,
      chartData: null,
      module: null,
      months: null,
      headers: [],
      editCompanies: null,
      viewOptions: [{
        name: "表格",
        value: "table"
      }, {
        name: "图",
        value: "chart"
      }],
      selectedViewOption: "table",
      companies: [{
        name: '中海庭',
        key: 'zht',
        data: {}
      }]
    }
  },
  created() {
    this.user = this.$store.getters.userProfile;
    // this.refresh();
  },
  methods: {
    refresh() {
      let vm = this;
      let curMonth = this.curMonth = new Date().getFullYear() + "-" + (new Date().getMonth() + 1);
      CompanyApi.userCompanies(this.user.id).then(res => {
        this.companies = [];
        res.data.forEach(comp => {
          this.companies.push({
            name: comp.name,
            key: comp.id,
            data: {}
          });
        });

        DashboardApi.getAllStatistics().then(statRes => {
          let months = [], oData = {monthData: {}};
          statRes.data.forEach(stat => {
            months.push(stat.month);
            let oVal = null;
            try{
              oVal = JSON.parse(stat.value);
            } catch(err){}
            if(oVal) {
              oData.curMonthDataId = stat.id;
              oData.monthData[stat.month] = oVal;
            }
          });

          oData.curMonthData = oData.monthData[curMonth];

          this.months = months;
          this.module = oData;

          parseByCompanies(oData.curMonthData);
        });
      })

      function parseByCompanies(oneMonthData) {
        vm.headers = [];
        vm.companies.forEach(comp => {
          let theCompMonthData = oneMonthData[comp.key];
          if (TypeChecker.isObject(theCompMonthData)) {

            Object.keys(theCompMonthData).forEach(key => {
              if (vm.headers.filter(h => h.name == key).length < 1) {
                vm.headers.push({
                  name: key,
                  key: key
                });
              }
              comp.data[key] = theCompMonthData[key];
            });
          }
        });
      }
    },
    toEdit() {
      this.editCompanies = CommonUtils.deepClone(this.companies);
    },
    submit() {
      this.periods = null;
      this.refresh();
      this.editCompanies = null;
    },
    cancel() {
      this.editCompanies = null;
    },
    parseMonths(months) {
      this.periods = { years: null, quarters: null, months: null };
      let periods = PeriodUtils.parsePeriodsFromMonths(months);

      this.periods.months = periods.months;
      this.periods.quarters = periods.quarters;
      this.periods.years = periods.years;
    },
    changedPeriod(args) {
      let selectedMonths = args.map(m => m.year + '-' + m.month);
      let data = [], chartData = [];
      Object.keys(this.module.monthData).filter(key => selectedMonths.indexOf(key) > -1).forEach(key => {
        let _data = [],
          companiesData = [];
        let oneMonthData = this.module.monthData[key],
          excludedKeys = ["isSubmitted"];
        Object.keys(oneMonthData).forEach(_key => {
          if (excludedKeys.indexOf(_key) < 0) {
            companiesData.push({
              name: _key,
              data: oneMonthData[_key]
            });
            let filteredChartData = chartData.filter(d => d.name == _key);
            if(filteredChartData.length > 0) {
              let compChartData = filteredChartData[0];
              compChartData.months.push({
                month: key,
                data: oneMonthData[_key]
              });
            } else {
              chartData.push({
                name: this.companies.filter(comp => comp.key == _key)[0].name,
                key: _key,
                months: [{
                  month: key,
                  data: oneMonthData[_key]
                }]
              });
            }
          }
        });
        companiesData.forEach(comp => {
          let row = { companyName: comp.name };
          this.headers.forEach(header => {
            row[header.key] = comp.data[header.key];
          });
          _data.push(row);
        });
        data.push({
          month: key,
          data: _data
        });
      });
      this.data = data;
      this.chartData = chartData;
    },
    changedViewOption(args) {
      this.selectedViewOption = args.value;
    }
  }
}
