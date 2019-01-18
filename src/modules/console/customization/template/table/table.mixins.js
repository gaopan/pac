import TypeChecker from '@/utils/type-checker.js'
import CommonUtils from '@/utils/common-utils.js'
import LeapSelect from '@/components/leap-select/LEAPSelect.vue'
import PeriodSelector from '../../period-selector/PeriodSelector.vue'
import PeriodUtils from '../../period-utils.js'
import DataUtils from '@/utils/data-utils.js'
import DashboardComment from '../../dashboard-comment/DashboardComment.vue'
import shared from '@/shared.js'
let eventHub = shared.eventHub;
export default {
  template: `<div class="table-wrapper" :class="{'no-selector': conf.noPeriodSelector}">
  <div class="table-header" v-if="!conf.noPeriodSelector">
    <period-selector :periods="periods" @change="changedPeriod"></period-selector>
  </div>
  <div v-for="d in data">
  <div class="chart-title" v-if="!conf.noPeriodSelector">
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
  <dashboard-comment v-if="ifFullScreen&&comments" :module="conf.data.module" :comments="comments"></dashboard-comment>
  </div>`,
  props: {
    tileId: {
      type: String
    },
    conf: {
      validator: function(_conf) {
        if (!TypeChecker.isObject(_conf)) return false;
        return true;
      }
    }
  },
  components: { PeriodSelector, DashboardComment },
  data() {
    return {
      periods: { years: null, quarters: null, months: null },
      headers: null,
      title: null,
      data: [],
      comments: null,
      ifFullScreen: false
    };
  },
  created() {
    this.title = this.conf.title;
    this.headers = CommonUtils.deepClone(this.conf.data.headers);
    this.parseMonths(this.conf.months);

    if (this.$props.conf.noPeriodSelector) {
      let months = this.periods.months;
      this.changedPeriod(months);
    }

    if (this.$props.tileId) {
      eventHub.$on("tile-full-screen-inner", this.toggleFullScreen);
    }
  },
  methods: {
    parseData(data) {
      if (!TypeChecker.isArray(data[this.selectedOption])) return;

      let _data = [],
        headers = this.headers;
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
    changedPeriod(args) {
      let selectedMonths = args.map(m => m.year + '-' + m.month),
        comments = this.comments = [];

      if (TypeChecker.isArray(this.$props.conf.data.comments)) {
        this.$props.conf.data.comments.filter(item => selectedMonths.indexOf(item.month) > -1).forEach(item => {
          comments.push({
            month: item.month,
            content: item.data
          });
        });
      }

      if (TypeChecker.isArray(this.$props.conf.data.list)) {
        this.data = this.$props.conf.data.list.filter(item => selectedMonths.indexOf(item.month) > -1).sort((a, b) => {
          let arrA = a.month.split('-'),
            arrB = b.month.split('-');
          let yearA = Number(arrA[0]),
            monthA = Number(arrA[1]),
            yearB = Number(arrB[0]),
            monthB = Number(arrB[1]);
          if (yearA < yearB) {
            return true;
          } else if (yearA > yearB) {
            return false;
          } else {
            return monthA < monthB;
          }
        });
      }
    },
    toggleFullScreen(args) {
      if (args.id == this.$props.tileId) {
        this.ifFullScreen = args.ifFullScreen;
      };
    }
  },
  beforeDestroy() {
    if (this.$props.tileId) {
      eventHub.$off("tile-full-screen-inner", this.toggleFullScreen);
    }
  }
}
