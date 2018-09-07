import TypeChecker from '@/utils/type-checker.js'
import LeapSelect from '@/components/leap-select/LEAPSelect.vue'
import PeriodUtils from '../period-utils.js'

export default {
  name: 'period-selector',
  components: { LeapSelect },
  props: {
    periods: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      periodOptions: null,
      selectedPeriodOption: null,
      periodList: null,
      selectedPeriodItem: null
    };
  },
  watch: {
  	selectedPeriodOption(val){
  		this.periodList = this[val + 's'];
  		if(val == 'year') {
  			this.selectedPeriodItem = this.current.year + '';
  		} else if(val == 'quarter') {
  			this.selectedPeriodItem = this.current.year + '-' + this.current.quarter;
  		} else if(val == 'month') {
  			this.selectedPeriodItem = this.current.year + '-' + this.current.month;
  		}
  		this.$emit("change", PeriodUtils.convertPeriodToMonths(this.selectedPeriodItem, this.selectedPeriodOption));
  	}
  },
  created() {
    let periodOptions = [];
    if (TypeChecker.isArray(this.$props.periods.years)) {
      periodOptions.push({
        name: "年",
        value: 'year'
      });
      this.years = this.$props.periods.years.map(year => {
      	return {
      		name: year + "",
      		value: year + ''
      	};
      });
    }
    if (TypeChecker.isArray(this.$props.periods.quarters)) {
      periodOptions.push({
        name: '季度',
        value: 'quarter'
      });
      this.quarters = this.$props.periods.quarters.map(quarter => {
      	return {
      		name: quarter.year + '年第' + quarter.quarter + '季度',
      		value: quarter.year + '-' + quarter.quarter
      	};
      });
    }
    if (TypeChecker.isArray(this.$props.periods.months)) {
      periodOptions.push({
        name: '月',
        value: 'month'
      });
      this.months = this.$props.periods.months.map(month => {
      	return {
      		name: month.year + '年' + month.month + '月',
      		value: month.year + '-' + month.month
      	};
      });
    }
    this.periodOptions = periodOptions;
    this.selectedPeriodOption = 'quarter';

    let now = new Date();
    this.current = {
    	year: now.getFullYear(),
    	quarter: Math.floor(now.getMonth() / 3) + 1,
    	month: now.getMonth() + 1
    };
  },
  methods: {
  	changedPeriodOption(args){
  		this.selectedPeriodOption = args.value;
  	},
  	changedPeriodItem(args){
  		this.selectedPeriodItem = args.value;
  		this.$emit("change", PeriodUtils.convertPeriodToMonths(this.selectedPeriodItem, this.selectedPeriodOption));
  	}
  }
}
