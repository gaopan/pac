import * as d3 from 'd3'
import SVG from 'svg.js'
import shared from '@/shared.js'
import commonUtils from '@/utils/common-utils.js'
import TabbedChart from '@/components/chart/tabbed-chart/TabbedChart.vue'
import Paginator from '@/components/Paginator/Paginator.vue';
import Internationalization from '@/utils/internationalization.js'


import TypeChecker from '@/utils/type-checker.js'

import Common from '../common.js'

var eventHub = shared.eventHub;

export default {
  template: `<tabbed-chart :tabList="tabs" :pagging="pagging" @change="onChangedTab">
    <div slot="tabbed-header"></div>
    <div slot="tabbed-body">
      <div ref="container" class="ovd-chart">
        <div class="ovd-char-nodata-show" v-show='isNoDataToShow' style='height:100%;width:100%;text-align:center;
          position:relative;font-size:12px'><span style=' height:100%;
           display: inline-block;
           vertical-align: middle;'></span>{{'No data to display' | internationalize}}</div>
        <div class="list-container" v-show='!isNoDataToShow'>
          <ul>
           <li  v-for="amount in amountList" @click='clickTofilter(amount)'>
              <div class="list-left" :class = "{'amount-clickable':amountClickable}">{{amount.key}}</div>
              <div class="list-right">{{amount.value}}</div>
            </li>
          </ul>
           
        </div>
        
      </div>
    </div>
  </tabbed-chart>`,
  props: {
    tileId: {
      type: String,
      required: true
    },
    conf: {
      validator: function(_conf) {
        if (!TypeChecker.isObject(_conf)) return false;
        if (!TypeChecker.isArray(_conf.groups)) return false;
        return true;
      }
    }
  },
  components: {
    TabbedChart,
    Paginator
  },

  data() {
    return {
      amountClickable:false,
      isNoDataToShow: true,
      currentLabel: 0,
      originData: null,
      amountList: [],
      tabs: null,
      amountListOrigin: [],
      currentIndex: 1,
      pNum: 2,
      newCurrentTabLabel: null,
      pagging: null,
      selectedTab: null,
      pageSize: 10,
      pageIndex: 1,
      createCompo: true
    }
  },
  created: function() {
    let vm = this;
    this.tabs = Common.parseTabsFromOnlyGroups(this.$props.conf.groups, 4);
    this.pagging = {
      pageSize: this.pageSize,
      pageIndex: this.pageIndex,
      total: 0,
      onPageChange: function(pageIndex) {
        vm.pageIndex = pageIndex;
        vm.pagging.pageIndex = pageIndex;
        vm.$props.conf.notifyInjectData.call(vm, {
          type: 'fetch',
          data: {
            pageIndex: vm.pageIndex,
            pageSize: vm.pageSize,
            groupBy: vm.selectedTab.groupBy.value,
            type: vm.selectedTab.type.value,
            dataField: vm.selectedTab.dataField.value
          }
        });
      }
    };

    this.amountClickable = this.$props.conf.opts&&TypeChecker.isFunction(this.$props.conf.opts.onClickItem);
  },
  watch: {
    "conf.data": {
      handler(val) {
        var vm = this;
        if (val) {
          this.originData = commonUtils.deepClone(val);
          this.pagging.total = this.originData.total;
          this.fnDraw(this.originData)
        } else {
          this.isNoDataToShow = true;
        }
      },
      deep: true
    },
    "conf.groups": {
      handler(val){
        this.tabs = Common.parseTabsFromOnlyGroups(val, 4);
      }
    }
  },
  mounted: function() {},
  methods: {
    fnDraw(data) {
      let methodMap = {
        'SUM': "sum",
        'AVERAGE': "average",
        'MAXIMUM': "max",
        'MINIMUM': "min",
        'COUNT': "count",
        'MEDIAN': "median"
      };
      data.list.sort((a, b) => {
        return a.name.localeCompare(b.name);
      });
      data.list.forEach(item => {
        // console.log(item);
        item.key = item.name;
        item.value = this.regix(item[methodMap[this.selectedTab.type.value]]);
        item.originValue=item[methodMap[this.selectedTab.type.value]];
      });
      this.amountList = data.list;
      // this.pageHandler(this.currentIndex);
      this.isNoDataToShow = this.amountList.length > 0 ? false : true;
    },
    regix(str) {
      var num = parseFloat(str).toFixed(3);
      var s = num.substring(0, (num.length - 1));

      return s && s.toString().replace(/(\d)(?=(\d{3})+\.)/g, function($0, $1) {
        return $1 + ",";
      });;
    },
    clickTofilter(amount){
      if(this.amountClickable){
        this.$props.conf.opts.onClickItem(amount.name,this.selectedTab.groupBy.value)
      }         
    },
    pageHandler: function(index) {
      // console.log(index);
      // if(index==this.currentIndex) return ;
      this.currentIndex = index;
      let arr = commonUtils.deepClone(this.amountListOrigin);
      this.amountList = arr.splice(this.pNum * (index - 1), index * this.pNum);
    },
    onChangedTab(args) {
      if (TypeChecker.isFunction(this.$props.conf.notifyInjectData)) {
        this.selectedTab = args.selected;
        this.$props.conf.notifyInjectData.call(this, {
          // 'shunt': result of four charts in one request, 
          //'fetch': only refresh one charts data
          //use "fetch" when user toogle different view(createCompo)
          type: args.default && this.createCompo ? 'shunt' : 'fetch',
          data: {
            pageIndex: this.pageIndex,
            pageSize: this.pageSize,
            groupBy: args.selected.groupBy.value,
            type: args.selected.type.value,
            dataField: args.selected.dataField.value
          }
        });

        this.createCompo = false;
      }
      //update stored label
      // if(TypeChecker.isFunction(this.$props.conf.tabSwitch)) {
      //   this.$props.conf.tabSwitch.call(this, {
      //     label:{
      //       groupBy:args.selected.groupBy,
      //       type:args.selected.type,
      //       dataField:args.selected.dataField,
      //     },
      //     default:args.default
      //   });
      // }       
    }
  },
  beforeDestroy: function() {}
}
