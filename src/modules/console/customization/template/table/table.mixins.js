import TypeChecker from '@/utils/type-checker.js'
import CommonUtils from '@/utils/common-utils.js'
import LeapSelect from '@/components/leap-select/LEAPSelect.vue'
import PeriodSelector from '../../period-selector/PeriodSelector.vue'
import PeriodUtils from '../../period-utils.js'
import DataUtils from '@/utils/data-utils.js'

export default {
	template: `<div class="table-wrapper">
  <div class="table-header">
    <period-selector :periods="periods" @change="changedPeriod"></period-selector>
  </div>
  <div v-for="d in data">
  <div class="chart-title">
  <span>{{d.month}}</span>
  </div>
  <table class="leap-table">
	<thead>
	<th v-for="th in headers" :width="th.width"><div>{{th.name}}</div></th>
	</thead>
	<tbody>
	<tr v-for="row in d.data">
	<td v-for="th in headers"><div>{{row[th.key]}}</div></td>
	</tr>
	</tbody>
	</table></div>
  <div v-if="data.length < 1" class="no-data">没有数据显示</div>
  </div>`,
	props: {
    tileId: {
      type: String,
      required: true
    },
    conf: {
      validator: function(_conf){
        if(!TypeChecker.isObject(_conf)) return false;
        return true;
      }
    }
  },
  components: { PeriodSelector },
  data(){
  	return {
      periods: {years: null, quarters: null, months: null},
  		headers: null,
      title: null,
  		data: []
  	};
  },
  created(){
    this.title = this.conf.title;
  	this.headers = CommonUtils.deepClone(this.conf.data.headers);
  	this.parseMonths(this.conf.months);
  },
  methods: {
  	parseData(data){
  		if(!TypeChecker.isArray(data[this.selectedOption]))  return;

  		let _data = [], headers = this.headers;
  		data[this.selectedOption].forEach(d => {
  			let row = {};
  			headers.forEach(h => {
  				row[h.key] = {
  					value: d[h.key]
  				};
  			});
  			_data.push(row);
  		});

      this.data = _data;
  	},
    parseMonths(months) {
      let periods = PeriodUtils.parsePeriodsFromMonths(months);

      this.periods.months = periods.months;
      this.periods.quarters = periods.quarters;
      this.periods.years = periods.years;
    },
    changedPeriod(args){
      let selectedMonths = args.map(m => m.year + '-' + m.month);

      if(TypeChecker.isArray(this.$props.conf.data.list)) {
        this.data = this.$props.conf.data.list.filter(item => selectedMonths.indexOf(item.month) > -1);
      }
    }
  }
}