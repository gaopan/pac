import shared from '@/shared.js'
import * as d3 from 'd3'
import commonConverters from '@/utils/common-converter.js'

let eventHub = shared.eventHub
export default {
  name: 'boxchart',
  props: {
    tileId: {
      type: String,
      required: true
    },
    conf: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      data: {},
      caseCount: 0,
      totalCaseCount:0,
      averageDuration:null,
      startTime: null,
      endTime: null
    }
  },
  created: function() {
    eventHub.$on("tile-window-resized", this.windowResized);
  },
  computed: {},
  watch: {
    conf: {
      handler(val) {
        this.data = val.data;
        if(val.data.startDate==null||val.data.endDate==null){
          this.caseCount=0;
          this.totalCaseCount = 0;
          this.startTime = null;
          this.endTime = null;
        }else{
          this.caseCount = this.data.caseCount;
          this.totalCaseCount = this.data.totalCaseCount;
          this.averageDuration = commonConverters.convertSecondToStr(this.data.averageDuration,1);
          this.startTime = this.transformData(new Date(this.data.startDate));
          this.endTime = this.transformData(new Date(this.data.endDate));
        }
        
      },
      deep: true
    }
  },
  methods: {
    transformData: function(date) {
      var mth = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      var year = date.getUTCFullYear();
      var month = date.getUTCMonth() + 1;
      var day = date.getUTCDate();
      return mth[month - 1] + " " + day + " , " + year;
    },
    windowResized: function(args) {
      if (args.id == this.$props.tileId) {
        var containerHeight = document.getElementsByClassName("box-area")[0].clientHeight;
        var wrapperheight = 0.8 * containerHeight;
        var titleHeight = 0.3 * wrapperheight;
        var displayTextHeight = 0.7 * wrapperheight;

        var wrappers = d3.selectAll(".wrapper")._groups[0];
        for (var i = 0; i < wrappers.length; i++) {
          wrappers[i].style.height = wrapperheight > 100 ? wrapperheight + "px" : 75 + "px";
          wrappers[i].style.marginTop = wrapperheight > 100 ? (-wrapperheight / 2) + "px" : -37.5 + "px";
        }

        var boxTittle = d3.selectAll(".box-title p")._groups[0];
        for (var i = 0; i < boxTittle.length; i++) {
          boxTittle[i].style.lineHeight = wrapperheight > 100 ? titleHeight + "px" : 20 + "px";
          boxTittle[i].style.fontSize = titleHeight / 5 > 25 ? titleHeight / 5 + "px" : 20 + "px";
        }

        var displayText = d3.selectAll(".count-display p")._groups[0];
        for (var i = 0; i < displayText.length; i++) {
          displayText[i].style.lineHeight = wrapperheight > 100 ? displayTextHeight + "px" : 20 + "px";
          displayText[i].style.fontSize = displayTextHeight / 10 > 30 ? displayTextHeight / 10 + "px" : 20 + "px";
        }


        var displayIcon = d3.selectAll(".count-display i")._groups[0];
        for (var i = 0; i < displayIcon.length; i++) {
          displayIcon[i].style.lineHeight = wrapperheight > 100 ? displayTextHeight / 2 + "px" : 10 + "px";
          displayIcon[i].style.fontSize = displayTextHeight / 10 > 30 ? displayTextHeight / 20 + "px" : 10 + "px";
        }
      }
    }
  },

  beforeDestroy() {
    eventHub.$off("tile-window-resized", this.windowResized);
  }
}
