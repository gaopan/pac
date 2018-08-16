import * as d3 from 'd3'
import * as d3BI from '@/lib/d3-bi/index.js'
import SVG from 'svg.js'
import shared from "@/shared.js"
import HeatMapChart from '../../hm-chart/HeatMapChart.vue'
import commonGenerators from '@/utils/common-generators.js'
import commonConverters from '@/utils/common-converter.js'

let eventHub = shared.eventHub
export default {
  name: 'viewProcessPanel',
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
      data: {
        transaction: {
          activityFrequency: null,
          activityMax: null,
          activityMin: null
        },
        duration: {
          activityDuration: null,
          weightedBy: null,
          activityMax: null,
          activityMin: null
        }
      },
      dTrans: {
        config: {
          margin: null,
          level: 5,
          barColor: ["#00ceff", "#80e5ff", "#b7edfe", "#ccf4ff", "#e8f8ff"],
          arrowColor: ["#040404", "#414141", "#525252", "#606060", "#7e7e7e"]
        },
        displayData: {
          left: { max: 0, min: 0 },
          right: { max: 0, min: 0 }
        },
        mode: 'transaction'
      },
      dDu: {
        config: {
          margin: null,
          level: 5,
          barColor: ["#fc951f", "#FAA039", "#FAAD52", "#FCBF74", "#FAC990"],
          arrowColor: ["#fc951f", "#FAA039", "#FAAD52", "#FCBF74", "#FAC990"]
        },
        displayData: {
          left: { max: 0, min: 0, unit: 'days' },
          right: { max: 0, min: 0, unit: 'days' }
        },
        mode: 'duration'
      },
      dMockup: {
        transaction: {
          absoluteFrequency: {
            activity: { max: null, min: null },
            connection: { max: null, min: null }
          },
          caseFrequency: {
            activity: { max: null, min: null },
            connection: { max: null, min: null }
          },
          maximumRepetitions: {
            activity: { max: null, min: null },
            connection: { max: null, min: null }
          }
        },
        duration: {
          average: {
            none: {
              activity: { max: null, min: null },
              connection: { max: null, min: null }
            },
            absoluteFrequency: {
              activity: { max: null, min: null },
              connection: { max: null, min: null }
            },
            caseFrequency: {
              activity: { max: null, min: null },
              connection: { max: null, min: null }
            }
          },
          median: {
            none: {
              activity: { max: null, min: null },
              connection: { max: null, min: null }
            },
            absoluteFrequency: {
              activity: { max: null, min: null },
              connection: { max: null, min: null }
            },
            caseFrequency: {
              activity: { max: null, min: null },
              connection: { max: null, min: null }
            }
          },
          maximum: {
            none: {
              activity: { max: null, min: null },
              connection: { max: null, min: null }
            },
            absoluteFrequency: {
              activity: { max: null, min: null },
              connection: { max: null, min: null }
            },
            caseFrequency: {
              activity: { max: null, min: null },
              connection: { max: null, min: null }
            }
          },
          minimum: {
            none: {
              activity: { max: null, min: null },
              connection: { max: null, min: null }
            },
            absoluteFrequency: {
              activity: { max: null, min: null },
              connection: { max: null, min: null }
            },
            caseFrequency: {
              activity: { max: null, min: null },
              connection: { max: null, min: null }
            }
          },
          deviation: {
            none: {
              activity: { max: null, min: null },
              connection: { max: null, min: null }
            },
            absoluteFrequency: {
              activity: { max: null, min: null },
              connection: { max: null, min: null }
            },
            caseFrequency: {
              activity: { max: null, min: null },
              connection: { max: null, min: null }
            }

          }
        }
      },
      panelShow: false,
      iconShow: true,
      selectDisable: false,
      showTransaction: true,
      showDuration: false,
      activityFrequency: [{
        key: "absoluteFrequency",
        label: "绝对频率",
        abbreviation: "abs"
      }, {
        key: "caseFrequency",
        label: "实例频率",
        abbreviation: "case"
      }, {
        key: "maximumRepetitions",
        label: "最大重复度",
        abbreviation: "max"
      }],
      activityDuration: [{
        key: "average",
        label: "平均值",
        disaleWeighted: false,
        abbreviation: "avg"
      }, {
        key: "median",
        label: "中值",
        disaleWeighted: false,
        abbreviation: "med"
      }, {
        key: "maximum",
        label: "最大值",
        disaleWeighted: true,
        abbreviation: "max"
      }, {
        key: "minimum",
        label: "最小值",
        disaleWeighted: true,
        abbreviation: "min"
      }, {
        key: "deviation",
        label: "误差值",
        disaleWeighted: false,
        abbreviation: "dev"
      }],
      weightedBy: [{
        key: "none",
        label: "空",
        abbreviation: null
      }, {
        key: "absoluteFrequency",
        label: "绝对频率",
        abbreviation: "abs"
      }, {
        key: "caseFrequency",
        label: "实例频率",
        abbreviation: "case"
      }]
    }
  },
  created: function() {
    this.heatmapChart = null;
    this.heatmapContainer = null;
  
    this.dprocessmap = this.$props.conf.data;
    this.fcallback = this.$props.conf.cb;
    eventHub.$on("tile-window-resized", this.windowResized);

    eventHub.$on("toggle-variantCase-panel", this.toggleIcon);
  

    // console.log("----------------initial---------------");
    this.dMockup = this.$props.conf.data;
    this.initialTrans();
    this.initialDu();
    this.updatePanelStyle();



  },
  watch: {
    conf: {
      handler: function() {
        if (this.$props.conf.data !== null) {
          // console.log("----------------watch---------------");
          this.dMockup = this.$props.conf.data;
          this.updateCurrent();
        }
      },
      deep: true
    }
  },
  mounted: function() {

    // this.updatePanelStyle();
    // this.initialTrans();
    // this.initialDu();
  },
  methods: {
    panelSwitch: function() {
      var vm = this;
      if (this.panelShow) {
        this.panelShow = false;
        setTimeout(function() {
          vm.updatePanelStyle();
        }, 1);
      } else {
        this.panelShow = true;
        setTimeout(function() {
          vm.updatePanelStyle();
        }, 1);

      }
    },
    showTrans: function() {
      this.showTransaction = true;
      this.showDuration = false;
      this.fcallback(1, { kpi: this.getAbbreviation(this.activityFrequency, this.data.transaction.activityFrequency), weightedBy: null });
    },
    showDu: function() {
      this.showTransaction = false;
      this.showDuration = true;
      this.fcallback(2, { kpi: this.getAbbreviation(this.activityDuration, this.data.duration.activityDuration), weightedBy: this.getAbbreviation(this.weightedBy, this.data.duration.weightedBy) });
    },
    updatePanelStyle: function() {
      // var bt = document.getElementsByClassName("view-process")[0];
      var ct = document.getElementsByClassName("process-flow")[0];
      var panel = document.getElementById("panel");
      if (panel) {
        panel.style.right = "100%";
        panel.style.left = "auto";
        panel.style.height = ct.clientHeight - 25 + "px";
      }

    },
    updateCurrent: function() {
      var frequecykey = this.getKey(this.activityFrequency, this.data.transaction.activityFrequency);
      var actkey = this.getKey(this.activityDuration, this.data.duration.activityDuration);
      var weightbykey = this.getKey(this.weightedBy, this.data.duration.weightedBy);
      this.updateTrans(frequecykey);
      this.updateDu(actkey, weightbykey);
    },
    selectActivityFrequency: function() {
      var key = this.getKey(this.activityFrequency, this.data.transaction.activityFrequency);
      this.updateTrans(key);
      this.fcallback(1, { kpi: this.getAbbreviation(this.activityFrequency, this.data.transaction.activityFrequency), weightedBy: null });
    },
    selectActivityDuration: function() {
      var actkey = this.getKey(this.activityDuration, this.data.duration.activityDuration);
      this.selectDisable = this.getDisableInfo(this.activityDuration, this.data.duration.activityDuration);

      if (this.selectDisable) {
        this.data.duration.weightedBy = this.weightedBy[0].label;
        this.updateDu(actkey, this.weightedBy[0].key);
        this.fcallback(2, { kpi: this.getAbbreviation(this.activityDuration, this.data.duration.activityDuration), weightedBy: this.weightedBy[0].abbreviation });
      } else {
        // var weightbykey = this.getKey(this.weightedBy, this.data.duration.weightedBy);
        // this.updateDu(actkey, weightbykey);
        // this.fcallback(2,{kpi:this.getAbbreviation(this.activityDuration,this.data.duration.activityDuration),weightedBy:this.getAbbreviation(this.weightedBy,this.data.duration.weightedBy)});
        this.data.duration.weightedBy = this.weightedBy[1].label;
        this.updateDu(actkey, this.weightedBy[1].key);
        this.fcallback(2, { kpi: this.getAbbreviation(this.activityDuration, this.data.duration.activityDuration), weightedBy: this.weightedBy[1].abbreviation });
      }
    },
    selectWeightedBy: function() {
      var actkey = this.getKey(this.activityDuration, this.data.duration.activityDuration);
      var weightbykey = this.getKey(this.weightedBy, this.data.duration.weightedBy);
      this.updateDu(actkey, weightbykey);
      this.fcallback(2, { kpi: this.getAbbreviation(this.activityDuration, this.data.duration.activityDuration), weightedBy: this.getAbbreviation(this.weightedBy, this.data.duration.weightedBy) });
    },
    getKey: function(List, label) {
      var ret = null;
      List.forEach(function(e) {
        if (label == e.label) {
          ret = e.key;
        }
      })
      return ret;
    },
    getDisableInfo: function(List, label) {
      var ret = null;
      List.forEach(function(e) {
        if (label == e.label) {
          ret = e.disaleWeighted;
        }
      })
      return ret;
    },
    getAbbreviation: function(List, label) {
      var ret = null;
      List.forEach(function(e) {
        if (label == e.label) {
          ret = e.abbreviation;
        }
      })
      return ret;
    },
    updateTrans(key) {
      this.dTrans.displayData.left.max = this.$props.conf.data.transaction[key].activity.max;
      this.dTrans.displayData.left.min = this.$props.conf.data.transaction[key].activity.min;
      this.dTrans.displayData.right.max = this.$props.conf.data.transaction[key].connection.max;
      this.dTrans.displayData.right.min = this.$props.conf.data.transaction[key].connection.min;
    },
    initialTrans() {
      this.data.transaction.activityFrequency = this.activityFrequency[0].label;
      // this.updateTrans(this.activityFrequency[0].key);
      // initially,the panel will execute callback with transition
      this.fcallback(1, { kpi: this.getAbbreviation(this.activityFrequency, this.data.transaction.activityFrequency), weightedBy: null });
    },
    updateDu(actDuKey, weightedByKey) {
      this.dDu.displayData.left.max = this.$props.conf.data.duration[actDuKey][weightedByKey].activity.max;
      this.dDu.displayData.left.min = this.$props.conf.data.duration[actDuKey][weightedByKey].activity.min;
      this.dDu.displayData.left.unit = commonConverters.convertedUnitFromSecond(this.dMockup.duration[actDuKey][weightedByKey].activity.max, 0);
      this.dDu.displayData.right.max = this.$props.conf.data.duration[actDuKey][weightedByKey].connection.max;
      this.dDu.displayData.right.min = this.$props.conf.data.duration[actDuKey][weightedByKey].connection.min;
      this.dDu.displayData.right.unit = commonConverters.convertedUnitFromSecond(this.dMockup.duration[actDuKey][weightedByKey].connection.max, 0);
      //  console.log(this.dDu.displayData.left.max);
      // console.log(this.dDu.displayData.right.max);
      // console.log(this.dMockup);
      // console.log(this.dMockup.duration[actDuKey][weightedByKey]);
    },
    initialDu() {
      this.data.duration.activityDuration = this.activityDuration[0].label;
      this.data.duration.weightedBy = this.weightedBy[1].label;
      // this.updateDu(this.activityDuration[0].key, this.weightedBy[0].key);
    },
    windowResized: function(args) {
      this.updatePanelStyle();
    },
    hideIcon: function() {
      this.iconShow = false;
    },

    toggleIcon:function(args){

      //Azhaziq - 27/11/2017: Defect 2551
      this.iconShow=!args.showPanel;
    }
  },
  components: {
    HeatMapChart
  },
  beforeDestroy() {
    eventHub.$off("tile-window-resized", this.windowResized);
    eventHub.$off("toggle-variantCase-panel", this.toggleIcon);
  }
}
