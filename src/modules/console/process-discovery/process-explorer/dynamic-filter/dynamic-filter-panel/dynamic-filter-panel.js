import shared from "@/shared.js"
import Store from "@/store"

import Loader from "@/components/loader/loader.js";
import DFNavigateBar from "../dynamic-filter-navigate-bar/dynamic-filter-navigate-bar.vue"

var eventHub = shared.eventHub;

export default {
  name: 'dynamic-filter-panel',
  props: {
    isEnableAttributeTab: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      selectedFilters: []
    }
  },
  components: {
    'df-navigate-bar': DFNavigateBar,
    'loader': Loader
  },
  created() {

    var vm = this;

    eventHub.$on("tile-window-resized", this.windowResized);
    eventHub.$on("removeAllFilter", this.closeFilter);
    eventHub.$on("removeHighlightedItem",this.removeHighlightedItem);

    setTimeout(function() {
      vm.windowResized();
    }, 100);

  },
  computed: {
    seleFilters() {
      
      let list = [{
        name: "Date Range",
        label: '日期范围',
        highLight: false
      }, {
        name: "Variant",
        label: '分支路径',
        highLight: false
      }, {
        name: "Duration",
        label: '持续时间',
        highLight: false
      }, {
        name: "Touch Points",
        label: '接触点',
        highLight: false
      }, {
        name: "Activity",
        label: '活动',
        highLight: false
      }, {
        name: "Activity Connection",
        label: '活动连接',
        highLight: false
      }];

      if(this.$props.isEnableAttributeTab) {
        //12 Feb 2018: adib.ghazali@hpe.com - US #1980 - Show/Hide Attribute filter
        
        list.push({
          label: '字段',
          name: "Attribute",
          highLight: false
        });

      }
    
      return list;

    }
  },
  methods: {
    highLightItem: function(index) {
      this.seleFilters[index].highLight = !this.seleFilters[index].highLight
      this.updateSelectedFilter();
    },
    showAddFilterDetails() {
      //03-10-2017 - muhammad-azhaziq.bin-mohd-azlan-goh@hpe.com: Update UX, don't allowed user to add if no selection      
      eventHub.$emit("showAddFilterDetails", this.selectedFilters);

      //12.10.2017: adib.ghazali@hpe.com - enable Apply Filter btn
      eventHub.$emit("enableApplyFilterBtn", true);
    },
    updateSelectedFilter(){
      //03-10-2017 - muhammad-azhaziq.bin-mohd-azlan-goh@hpe.com: Update UX, don't allowed user to add if no selection  
      var arr = [];
      this.seleFilters.forEach(function(ele) {
        if (ele.highLight) {
          arr.push(ele.name)
        }
      });

      this.selectedFilters = arr;
    },
    closeFilter: function(data) {
      for (var i = 0; i < this.seleFilters.length; i++) {
        for (var j = 0; j < data.length; j++) {
          if (data[j].filterName === this.seleFilters[i].name) {
            this.seleFilters[i].highLight = false
          };
        }
      }
    },
    windowResized(args) {
      var k = document.getElementsByClassName("m-console")[0].parentNode.clientHeight - 70;
      $('.dynamic-filter-panel-container').css('height', k);
    },
    removeHighlightedItem() {
      //12.10.2017: adib.ghazali@hpe.com -to remove highlightedItem
      this.selectedFilters = [];

      // this.seleFilters.find(filter => {
      //     filter.highLight = false;
      // });

      _.find(this.seleFilters, function (filter) {
        filter.highLight = false;
      }); 
    }
  },
  beforeDestroy() {
      eventHub.$off("removeHighlightedItem",this.removeHighlightedItem);
  }
}