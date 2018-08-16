import * as d3 from 'd3'
import * as d3BI from '@/lib/d3-bi/index.js'
import SVG from 'svg.js'
import shared from "@/shared.js"

var eventHub = shared.eventHub;
export default {
  name: 'process-variant-kpi',
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
      apiData: [],
      tempData: []
    }
  },

  created: function() {
    this.barChart = null;
    this.barContainer = null;
    eventHub.$on("tile-window-resized", this.windowResized);
  },

  mounted: function() {
    if (this.conf.data != null) {
      if (this.conf.data.top9Variants.length > 9) {
        var vm = this;
        this.apiData = [];
        this.conf.data.top9Variants.forEach(function(v, index) {
          if (index < 9) {
            vm.apiData[index] = v;
          }
        })
      } else {
        this.apiData = this.conf.data.top9Variants;
      }
    }
    this.tempData = this.changeDataformat(this.apiData);
    this.initChart();
    this.redrawed(this.chartData());
  },

  watch: {
    conf: {
      handler(data, oldData) {
        if (data.data.top9Variants.length > 9) {
          var vm = this;
          this.apiData = [];
          data.data.top9Variants.forEach(function(v, index) {
            if (index < 9) {
              vm.apiData[index] = v;
            }
          })
        } else {
          this.apiData = data.data.top9Variants;
        }
        this.tempData = this.changeDataformat(this.apiData);
        this.redrawed(this.chartData());
      },
      deep: true
    }
  },


  methods: {
    initChart() {
      let vm = this;
      this.barContainer = d3.select('#process-variant-chart');
      vm.barChart = d3BI.baseChart('bar')
        .x(function(d) {
          return d.label
        })
        .y(function(d) {
          return d.value
        })
        .margin({ top: 15, right: 20, left: 20, bottom: 15 })

      vm.barChart.axisLines.showAll({ x: false, y: true });
      vm.barChart.yAxis.givenDomain(vm.transformDomain);
      vm.barChart.yAxis.title('Total %');
      vm.barChart.tooltip.setContent(function(args) {
        var str = '';
        var strLists = '';
        var num = args.x.charAt(args.x.length - 1) - 1;
        var hoverData = vm.apiData[num];
        var similarity = hoverData.similarity*100;
        similarity = similarity.toFixed(2);
        for (var i = 0; i < hoverData.possibleFactorResultList.length; i++) {
          var listStr = hoverData.possibleFactorResultList[i];
          var weight = parseFloat(listStr.weight) * 100;
          weight = weight.toFixed(2);

          strLists = strLists + '<tr class = "content">' + '<td id="subTitle">' + listStr.name + ':' + '</td>' + '<td id="subContent">' + listStr.value + ", weight : " + weight + "%" + '</td>' + '</tr>';
        };
        str =
          '<div class = "firstTitle">' + args.x + '</div>' +
          '<table>' +
          '<tr class = "content">' + '<td id="subTitle">' + 'Happy Path:' + '</td>' + '<td id="subContent">' + hoverData.happyPath + '</td>' + '</tr>' +
          '<tr class = "content">' + '<td id="subTitle">' + 'Most Similar Happy Path:' + '</td>' + '<td id="subContent">' + hoverData.happyPathName + '</td>' + '</tr>' +
          '<tr class = "content">' + '<td id="subTitle">' + 'Similarity:' + '</td>' + '<td id="subContent">' + similarity + "%" + '</td>' + '</tr>' +
          '</table>' +
          '<div class = "secondTitle">' + 'Possible Factors' + '</div>';
        return '<div class="process-variant-hover-table">' + str + '<table>' + strLists + '</table>' + '</div>';
      });
    },
    redrawed(data) {
      let vm = this;
      this.barContainer.style('height', vm.barChartHeight());
      if (vm.barContainer.select('svg').size()) {
        vm.barContainer
          .select('svg')
          .datum(function(d) {
            return data ? data : d
          })
          .call(vm.barChart);
      } else {
        vm.barContainer
          .append('svg')
          .datum(data)
          .call(vm.barChart);
      }
    },
    windowResized: function(args) {
      if (args.id == this.$props.tileId) {
        this.redrawed(null)
      }
    },
    barChartHeight() {
      let chart = this.barContainer.node();
      return chart.offsetParent.clientHeight - chart.offsetTop + 'px'
    },
    transformDomain(domain) {
      // expand max
      domain[1] = 1.5 * domain[1];
      // set min to zero
      if (domain[0] > 0) domain[0] = 0;
      return domain;

    },
    changeDataformat(data) {
      var formateDatas = [];
      var formateData = {};
      for (var i = 0; i < data.length; i++) {
        var num = i + 1;
        var label = "Rank" + num;
        var value = data[i].percentage * 100;
        formateData = {
          'label': label,
          'value': value
        }
        formateDatas.push(formateData);
      }
      return formateDatas;
    },
    chartData() {
      return [{
        label: {
          x: 'name',
          y: 'total',
          z: 'ddd'
        },
        color: '#8085E9',
        values: this.tempData
      }];
    }
  },

  beforeDestroy: function() {
    eventHub.$off("tile-window-resized", this.windowResized);
  }

}
