import * as d3 from 'd3'
import SVG from 'svg.js'
import Chart from '@/components/chart/Chart.vue'
import shared from "@/shared.js"
import PVCChart from "./pvc-chart.js"
import TypeChecker from '@/utils/type-checker.js'

var eventHub = shared.eventHub;

/* Defect 2435 : 19-6-2017: Azhaziq
 * Add Integration with variant filters 
 *
 */
export default {
  name: 'top-ten-cal-chart',
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
        mode: null,
        fontsize: "12px",
        pvData: {
          selectedBarCount: 0,
          variantData: null
        },
        statsData: {
          percentage: 0,
          variant: 0,
          totalVariant: 0,
          cases: 0,
          casesCovered: 0,
          totalCases: 0
        }
      },
      container: null,
      chart: null,

    }
  },
  created: function() {
    eventHub.$on("tile-window-resized", this.windowResized);

    //Defect 2435
    eventHub.$on("changed-process-variant", this.onChangedProcess);

  },
  // watch: {
  //   pvData: {
  //     handler(val, oldVal) {
  //       this.draw();
  //     },
  //     deep: true
  //   },
  //   statsData: {
  //     handler(val, oldVal) {
  //       this.draw();
  //     },
  //     deep: true
  //   }

  // },

  mounted: function() {
    var container = this.container = this.$refs.container;
  },
  methods: {
    draw: function() {
      var vm = this;
      var container = this.container;
      this.data.mode = this.$props.conf.mode;
      if (this.data.pvData && this.data.statsData) {
        if (!this.chart) {
          this.chart = new PVCChart(container).data(this.data).onChange(this.filtered).setFilter(this.filter).draw();

        } else {
          // this.chart.data(this.data).draw();
          setTimeout(function() {
            vm.chart.data(vm.data).draw();
          }, 500);
        }
      }
    },
    windowResized: function(args) {
      if (args.id == this.$props.tileId) {
        this.draw();
      }
    },

    onChangedProcess(args) {
      if (this.container) {
        for (var key in args) {

          if (key == 'selectedBarCount') {
            this.data.pvData.selectedBarCount = args.selectedBarCount;
          }

          if (key == 'variantData') {
            this.data.pvData.variantData = args.variantData;
          }
        }
        if (TypeChecker.isArray(this.data.pvData.variantData) && this.data.pvData.variantData.length >= this.data.pvData.selectedBarCount && this.data.pvData.selectedBarCount > 0) {
          this.calculateStats();
        }
      }
    },
    calculateStats() {

      let totalSelectedCases = 0,
        totalSelectedVariant = 0,
        totalCases = 0,
        totalVariant = 0;

      for (var j = 0; j < this.data.pvData.variantData.length; j++) {
        if (j < 9) {
          totalCases += !TypeChecker.isUndefined(this.data.pvData.variantData[j].numOfCases) ? this.data.pvData.variantData[j].numOfCases : 0;
          if (!TypeChecker.isUndefined(this.data.pvData.variantData[j].numOfVariant)) {
            totalVariant += this.data.pvData.variantData[j].numOfVariant;
          }
        } else if(j == 9){
          if(!TypeChecker.isUndefined(this.data.pvData.variantData[j].numOfCases)) {
            totalCases = this.data.pvData.variantData[j].numOfCases;
          }
          if(!TypeChecker.isUndefined(this.data.pvData.variantData[j].numOfVariant)) {
            totalVariant = this.data.pvData.variantData[j].numOfVariant;
          }
        }
      }

      for (var i = 0; i < this.data.pvData.selectedBarCount; i++) {
        if(i < 9) {
          totalSelectedCases += !TypeChecker.isUndefined(this.data.pvData.variantData[i].numOfCases) ? this.data.pvData.variantData[i].numOfCases : 0;
          totalSelectedVariant += !TypeChecker.isUndefined(this.data.pvData.variantData[i].numOfVariant) ? this.data.pvData.variantData[i].numOfVariant : 0;
        } else if(i == 9) {
          if(!TypeChecker.isUndefined(this.data.pvData.variantData[i].numOfCases)) {
            totalSelectedCases = this.data.pvData.variantData[i].numOfCases;
          }
          if(!TypeChecker.isUndefined(this.data.pvData.variantData[i].numOfVariant)) {
            totalSelectedVariant = this.data.pvData.variantData[i].numOfVariant;
          }
        }
      }

      let casesCovered = (totalSelectedCases / totalCases);

      this.data.statsData.variant = totalSelectedVariant;
      this.data.statsData.totalVariant = totalVariant;
      this.data.statsData.cases = totalSelectedCases;
      this.data.statsData.totalCases = totalCases;
      this.data.statsData.casesCovered = casesCovered;
      this.data.statsData.percentage = this.$options.filters.toPercent(casesCovered, 2);

      this.draw();
    }
  },
  filters: {
    toPercent: function(val, decimalPoint) {

      TypeChecker.isUndefined(decimalPoint) ? 2 : decimalPoint;

      val ? val = val : val = 0;

      let percent = val * 100;

      val = percent.toFixed(decimalPoint);

      if (val.indexOf('.') < 0 && decimalPoint > 0) {
        val += '.';
        for (var i = 0; i < decimalPoint; i++) {
          val += "0"
        }
      }

      return parseFloat(val);
    }
  },
  components: {
    Chart
  },
  beforeDestroy: function() {
    eventHub.$off("tile-window-resized", this.windowResized);

    //Defect 2435
    eventHub.$off("changed-process-variant", this.onChangedProcess);
  }
}
