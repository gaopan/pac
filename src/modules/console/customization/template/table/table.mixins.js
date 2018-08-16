import TypeChecker from '@/utils/type-checker.js'
import CommonUtils from '@/utils/common-utils.js'
import LeapSelect from '@/components/leap-select/LEAPSelect.vue'

export default {
	template: `<div class="table-wrapper">
  <div class="chart-title">
  <span>{{title}}</span>
  <div class="selector">
  <leap-select :options="options" :initSelectedValue="selectedOption" v-on:onSelectedValues="selectOption"></leap-select>
  </div>
  </div>
  <table class="leap-table">
	<thead>
	<th v-for="th in headers" :width="th.width"><div>{{th.name}}</div></th>
	</thead>
	<tbody>
	<tr v-for="row in data">
	<td v-for="th in headers"><div>{{row[th.key].value}}</div></td>
	</tr>
	</tbody>
	</table></div>`,
	props: {
    tileId: {
      type: String,
      required: true
    },
    conf: {
      validator: function(_conf){
        if(!TypeChecker.isObject(_conf)) return false;
        if(!TypeChecker.isArray(_conf.monthOptions)) return false;
        return true;
      }
    }
  },
  components: { LeapSelect },
  data(){
  	return {
  		headers: null,
      title: null,
  		data: null,
      options: null,
      selectedOption: null
  	};
  },
  created(){
    this.options = CommonUtils.deepClone(this.conf.monthOptions);
    this.selectedOption = this.options[0].value;
    this.title = this.conf.title;
  	this.headers = CommonUtils.deepClone(this.conf.data.headers);

  	this.parseData(this.conf.data.data);
  },
  methods: {
    selectOption(args){
      this.selectedOption = args.value;
      this.parseData(this.conf.data.data);
    },
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
  	}
  }
}