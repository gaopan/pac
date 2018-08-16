import * as d3 from 'd3'
import SVG from 'svg.js'
import Chart from '@/components/chart/Chart.vue'
import shared from "@/shared.js"
import HMChart from "./heatmapChart.js"
import TypeChecker from '@/utils/type-checker.js'
import filterUtils from '../dynamic-filter/filters-utils.js'
import CommonGenerators from '@/utils/common-generators.js'


let UUIDGenerator = CommonGenerators.UUIDGenerator

var eventHub = shared.eventHub;
export default {
  name: 'heat-map-chart',
  props: ['config'],
  data() {
    return {
      data: {},
      container: null,
      loadId: UUIDGenerator.purchase(),
      chartID: UUIDGenerator.shortPurchase()

    }
  },
  created: function() {
    this.data=this.$props.config.data;
    console.log(this.$props.config.data);
    // eventHub.$on("trans-actfrequency-change", this.redraw);
   

  },
  watch: {
    config: {
      handler: function(){
        this.data=this.$props.config.data;
        this.redraw();
      },
      deep: true
    }
  },

  mounted: function() {
    this.draw();
    // console.log(this.$props);

  },

  methods: {
    // parseConf: function(){
    //   if(TypeChecker.isArray(this.$props.conf.data)) {
    //     this.data.rankInfo = this.$props.conf.data.slice(0);
    //   }
    //   this.data.mode = this.$props.conf.mode;
    //   this.data.selectedBar = this.$props.conf.selectedBar;
    // },
    // draw in the container
    draw: function() {
      var vm = this;
      var container = document.getElementById(this.chartID);
      // if (this.$props.config.mode == "transaction") {
        vm.data.id=vm.chartID;
        if (!this.chart) {
          this.chart = new HMChart(container).data(vm.data).onChange().setFilter().draw();
        } else {
          setTimeout(function() {
            vm.chart.data(vm.data).draw();
          }, 500);
        }
      // } else if(this.$props.config.mode == "duration"){
      //   vm.data.id=vm.chartID;
      //   if (!this.chart) {
      //     this.chart = new HMChart(container).data(vm.data).onChange().setFilter().draw();
      //   } else {
      //     setTimeout(function() {
      //       vm.chart.data(vm.data).draw();
      //     }, 500);
      //   }
      // }

    },

    redraw:function(){
      this.chart.data(this.data).draw();
    }
  },
  beforeDestroy: function() {


  },
  components: {
    Chart
  }
}
