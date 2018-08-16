import * as d3 from 'd3'
import SVG from 'svg.js'
import * as d3BI from '@/lib/d3-bi/index.js'
import shared from '@/shared.js'
import DynamicFilterApi from '@/api/process-mining.js'
import DfUtils from "../../dynamic-filter-utils.js"
import CommonGenerators from '@/utils/common-generators.js'
import Pagging from '@/components/Paginator/Paginator.vue'
import NotyOperation from '@/utils/noty-operation.js'
import LeapSearch from '@/components/leap-search/LEAPSearch.vue'
import TypeChecker from '@/utils/type-checker.js'
import Internationalization from '@/utils/internationalization.js'

let UUIDGenerator = CommonGenerators.UUIDGenerator
let eventHub = shared.eventHub

export default {
  name: 'touch-points',
  props: ['localSectionFilter', 'filterDetailData'],
  data() {
    return {
      tableData: {
        headers: [{
          name: Internationalization.translate('Touch Points'),
          icons: { 'icon-sort': true, 'icon-sort-up': false, 'icon-sort-down': false, }
        }, {
          name: Internationalization.translate('Cases'),
          icons: { 'icon-sort': false, 'icon-sort-up': false, 'icon-sort-down': true, }
        }, {
          name: Internationalization.translate('Median Duration'),
          icons: { 'icon-sort': true, 'icon-sort-up': false, 'icon-sort-down': false, }
        }, {
          name: Internationalization.translate('Average Duration'),
          icons: { 'icon-sort': true, 'icon-sort-up': false, 'icon-sort-down': false, }
        }, {
          name: Internationalization.translate('Minimum Duration'),
          icons: { 'icon-sort': true, 'icon-sort-up': false, 'icon-sort-down': false, }
        }, {
          name: Internationalization.translate('Maximum Duration'),
          icons: { 'icon-sort': true, 'icon-sort-up': false, 'icon-sort-down': false, }
        }],
        data: [],
      },
      tableSelectArr: [],
      searchText: '',

      chartWidth: null,
      colors: {
        true: '#00C9FF',
        false: '#C7CBD5'
      },

      allTableData: null,
      frontTable: null,
      showAllSelect: false,

      currentIndexPage: 1,
      tpPageSize: 40,
      tpTotal: null,
      tpPaginationTimer: null,
      showPaggination: false,
    }
  },
  created() {
    let vm = this;
    vm.loadId = CommonGenerators.UUIDGenerator.purchase();
    eventHub.$on("tile-window-resized", vm.windowResized);
    setTimeout(function() {
      vm.windowResized();
    }, 100);
    vm.barChart = vm.barContainer = null;
    vm.fnRequestData();
  },
  mounted() {
    const that = this
    window.onresize = () => {
      return (() => {
        that.chartWidth = document.getElementsByClassName('tp-box-wrapper')[0].clientWidth;
      })()
    }
  },
  components: {
    Pagging,
    LeapSearch
  },
  watch: {
    chartWidth: {
      handler(data, oldData) {
        this.chartWidth = data;
        this.repaint(null);
      },
      deep: true
    },
    tableData: {
      handler(data, oldData) {
        if (TypeChecker.isObject(data) && data.data.length != 0) {
          let selectItem = [];
          data.data.forEach(function(c) {
            selectItem.push(c.select)
          });
          let num = selectItem.indexOf(false);
          this.showAllSelect = (num !== -1) ? false : true;
        };
      },
      deep: true
    }
  },
  methods: {
    fnRequestData() {
      let vm = this,
        processAnalyticsId = this.$store.getters.processSelection.processAnalyticsId,
        seletedCusId = this.$store.getters.processSelection.customerId;
      if (this.$props.filterDetailData == null) {
        eventHub.$emit("start-mini-loader", { id: this.loadId });
        DynamicFilterApi.getTouchPointData(seletedCusId, processAnalyticsId).then(data => {
          vm.$emit('touchPointFDChange', {
            name: 'touchPoint',
            value: data.data.list
          });
          vm.fnGetAllDateForTableAndChart(data.data.list);
          eventHub.$emit("finish-mini-loader", { id: vm.loadId });
        }, (err) => {
          eventHub.$emit("finish-mini-loader", { id: vm.loadId });
          NotyOperation.notifyError({ text: 'Get dynamic filter error.' });
        });
      } else {
        let allData = this.$props.filterDetailData;
        this.fnGetAllDateForTableAndChart(allData);
      };
    },
    initChart() {
      let vm = this;
      this.barContainer = d3.select('#tp-bar-chart');
      this.barContainer.style('height', vm.barChartHeight());
      this.barContainer.style('width', this.chartWidth);
      vm.barChart = d3BI.baseChart('bar')
        .x(function(d) { return d.label })
        .y(function(d) { return d.value })
        .margin({ top: 15, right: 3, left: 5, bottom: 10 })
      vm.barChart.bar.fnColorWrapper(vm.setEachBarColor);
      vm.barChart.axisLines.showAll({ x: true, y: false });
      vm.barChart.axisLines.pattern({ x: true, y: true });
      vm.barChart.yAxis.givenDomain(this.transformDomain);
      vm.barChart.yAxis.title('Case Percentage %');
      vm.barChart.xAxis.title('Touch Points').axisVisibility(false);
      vm.barChart.yAxis.axis().ticks(5);
      vm.barChart.tooltip.privateClass('bi-tooltip-change');
      vm.barChart.tooltipDispatch.on('click.active', function(args, ele, config) {
        vm.fnClickEachBar(args.data.label);
      });
      vm.barChart.tooltip.setContent(function(args) {
        let str = '',
          strLists = '',
          touchNum = args.yValues[0].data.x,
          percent = args.yValues[0].data.y + '%',
          totalArr = args.yValues[0].config.values,
          numtotal = 0,
          caseNum = null;
        for (var j = 0; j < totalArr.length; j++) {
          numtotal += parseInt(vm.allTableData[j].frequency);
          if (totalArr[j].label === touchNum) {
            caseNum = vm.tableData.data[j].frequency;
          }
        };
        str = '<tr><td class="title">Touch Points:</td><td>' + touchNum + '</td></tr>';
        str += '<tr><td class="title">Number of cases:</td><td>' + caseNum + '</td></tr>';
        str += '<tr><td class="title">Case Percentage:</td><td>' + percent + '</td></tr>';
        return '<table>' + str + '</table>';
      });
      let data = this.chartData(this.tableData.data);
      vm.barContainer
        .append('svg')
        .datum(data)
        .call(vm.barChart);
    },
    chartData(data) {
      let i = 0;
      return [{
        name: 'Spot',
        color: '#C7CBD6',
        values: data
      }];
    },
    setEachBarColor(h, d, config) {
      let vm = this;
      return (d.data.select) ? vm.colors.true : vm.colors.false;
    },
    transformDomain(domain) {
      domain[1] = domain[1];
      if (domain[0] > 0) domain[0] = 0;
      return domain;
    },
    barChartHeight() {
      let chart = this.barContainer.node();
      if (chart == null) {
        return '0px';
      } else {
        return chart.offsetParent.clientHeight - chart.offsetTop + 'px';
      }
    },
    repaint(data) {
      let vm = this;
      this.barContainer.style('height', vm.barChartHeight());
      if (vm.barContainer.select('svg').size()) {
        vm.barContainer
          .select('svg')
          .datum(function(d) { return data ? data : d })
          .call(vm.barChart);
      } else {
        vm.barContainer
          .append('svg')
          .datum(data)
          .call(vm.barChart);
      }
    },
    fnTpPageHandler: function(pageIndex) {
      this.currentIndexPage = pageIndex;
      if (this.tpPaginationTimer) clearTimeout(this.tpPaginationTimer)
      this.tpPaginationTimer = setTimeout(() => {
        let vm = this,
          num = null,
          end = null,
          start = vm.tpPageSize * (pageIndex - 1);
        vm.tableData.data = vm.allTableData;
        if (vm.tpTotal % vm.tpPageSize == 0) {
          num = vm.tpTotal / vm.tpPageSize;
        } else {
          num = parseInt(vm.tpTotal / vm.tpPageSize) + 1
        };
        end = (pageIndex == num) ? vm.tpTotal : vm.tpPageSize * pageIndex;
        vm.tableData.data = vm.tableData.data.slice(start, end);
        vm.repaint(vm.chartData(vm.tableData.data));
      }, 400)
    },
    fnUpdateListSize: function(args) {
      this.tpPageSize = args;
      this.fnTpPageHandler(this.currentIndexPage);
    },
    fnDoSearch: function(searchText) {
      let vm = this;
      vm.searchText = searchText;
      if (vm.searchText && vm.searchText.trim() != '') {
        vm.tableData.data = vm.allTableData;
        let val = '^(?=.*' + vm.searchText.trim().split(/\s+/).join(')(?=.*') + ').*$',
          reg = RegExp(val, 'i');
        let filtered = [];
        vm.tableData.data.forEach(function(c) {
          if (reg.test(c.attributeValue)) {
            filtered.push(c);
          }
        });
        vm.tableData.data = filtered;
        if (vm.tableData.data.length < vm.tpPageSize) {
          vm.showPaggination = false;
        }
        let data = this.chartData(vm.tableData.data)
        vm.repaint(data);
      } else {
        vm.tableData.data = vm.frontTable;
        let data = this.chartData(vm.tableData.data)
        vm.repaint(data);
        vm.showPaggination = true;
      }
    },
    timeFormat(data, count) {
      if (isNaN(data)) {
        return data
      } else {
        let str = null,
          num = null;
        if (data === 0) {
          num = 0;
          return num.toFixed(count) + " Second"
        } else if (data < 60) {
          num = data;
          str = num > 1 ? num + ' Seconds' : num + ' Second';
          return str;
        } else if (data < 60 * 60) {
          num = data / 60;
          str = num > 1 ? num.toFixed(count) + ' Minutes' : num.toFixed(count) + ' Minute';
          return str;
        } else if (data < 60 * 60 * 24) {
          num = data / (60 * 60);
          str = num > 1 ? num.toFixed(count) + ' Hours' : num.toFixed(count) + ' Hour';
          return str;
        } else {
          num = data / (60 * 60 * 24);
          str = num > 1 ? num.toFixed(count) + ' Days' : num.toFixed(count) + ' Day';
          return str;
        }
      }
    },
    fnGetAllDateForTableAndChart(data) {
      let totalCases = null,
        cases = null,
        vm = this;
      vm.tpTotal = Number(data.length);
      if (vm.tpTotal > 40) {
        vm.showPaggination = true
      };
      data.forEach((e) => {
        totalCases += parseInt(e.frequency);
      });
      data.forEach(function(ele) {
        let obj = { label: '', value: '', select: false };
        ele.select = false;
        ele.averageDuration = vm.timeFormat(ele.averageDuration, 2);
        ele.maximumDuration = vm.timeFormat(ele.maximumDuration, 2);
        ele.medianDuration = vm.timeFormat(ele.medianDuration, 2);
        ele.minimumDuration = vm.timeFormat(ele.minimumDuration, 2);
        ele.label = ele.attributeValue;
        cases = parseInt(ele.frequency);
        if (cases / totalCases * 100 < 1) {
          ele.value = (cases / totalCases * 100).toFixed(3);
        } else {
          ele.value = Math.round(cases / totalCases * 100)
        };
      })
      data.sort(function(a, b) {
        let aCol = a.frequency;
        let bCol = b.frequency;
        if (aCol > bCol) {
          return -1
        } else if (aCol < bCol) {
          return 1
        } else {
          return 0
        }
      });
      vm.deepCopy(data);
      if (data.length > vm.tpPageSize) {
        vm.tableData.data = data.slice(0, vm.tpPageSize);
        vm.frontTable = vm.tableData.data;
      } else {
        vm.tableData.data = data;
        vm.frontTable = vm.tableData.data;
      }
      vm.initSelectedFilterValue(vm.tableData.data);
      setTimeout(function() {
        vm.initChart();
      }, 100)
      eventHub.$emit("finish-mini-loader", { id: vm.loadId });
    },
    deepCopy(table) {
      let vm = this,
        arr = [];
      table.forEach(function(ele) {
        arr.push(ele);
        vm.allTableData = arr;
      });
    },
    fnClickTableColumn(index) {
      this.tableSelectArr.push(this.tableData.data[index].attributeValue);
      this.tableData.data[index].select = !this.tableData.data[index].select;
      this.repaint(null);
      //Call function to update global data model
      this.updateFilterValue(this.tableData.data);
    },
    fnClickEachBar(data) {
      let arr = [];
      for (var i = 0; i < this.tableData.data.length; i++) {
        arr.push(this.tableData.data[i].attributeValue)
        if (this.tableData.data[i].attributeValue === data) {
          this.tableData.data[i].select = !this.tableData.data[i].select;
        }
      };
      this.updateFilterValue(this.tableData.data);
      this.repaint(null);
    },
    fnSortColumn(index) {
      let data = null,
        vm = this,
        colName = null,
        keysArr = ['attributeValue', 'frequency', 'medianDuration', 'averageDuration', 'minimumDuration', 'maximumDuration'];
      if (vm.showPaggination) {
        if (this.currentIndexPage !== 1 && this.currentIndexPage !== null) {
          data = this.allTableData;
          this.fnTpPageHandler(this.currentIndexPage);
        } else {
          data = this.allTableData;
        };
      } else {
        data = this.tableData.data;
      };
      colName = keysArr[index];
      this.tableData.headers.forEach(function(e, eIndex) {
        if (eIndex !== index) {
          e.icons['icon-sort'] = true;
          e.icons['icon-sort-down'] = false;
          e.icons['icon-sort-up'] = false;
        }
      });
      this.tableData.headers[index].icons['icon-sort'] = false;
      if (this.tableData.headers[index].icons['icon-sort-up']) {
        this.tableData.headers[index].icons['icon-sort-down'] = true;
        this.tableData.headers[index].icons['icon-sort-up'] = false;
        data.sort(function(a, b) {
          var aCol = vm.fnChangeDurationFormat(colName, a[colName]);
          var bCol = vm.fnChangeDurationFormat(colName, b[colName]);
          return parseInt(bCol) - parseInt(aCol)
        });
      } else {
        this.tableData.headers[index].icons['icon-sort-up'] = true;
        this.tableData.headers[index].icons['icon-sort-down'] = false;
        data.sort(function(a, b) {
          var aCol = vm.fnChangeDurationFormat(colName, a[colName]);
          var bCol = vm.fnChangeDurationFormat(colName, b[colName]);
          return parseInt(aCol) - parseInt(bCol);
        });
      };
      if (this.currentIndexPage !== 1 && this.currentIndexPage !== null) {
        this.tableData.data = data;
        vm.repaint(vm.chartData(this.tableData.data));
      } else {
        this.tableData.data = data.slice(0, this.tpPageSize);
        vm.repaint(vm.chartData(this.tableData.data));
      }
    },
    fnChangeDurationFormat(col, data) {
      if (col == 'frequency' || col == 'attributeValue') {
        return data
      } else {
        if (data.indexOf('Days') !== -1) {
          return parseInt(data) * 86400;
        } else if (data.indexOf('Hours') !== -1) {
          return parseInt(data) * 3600;
        } else if (data.indexOf('Minutes') !== -1) {
          return parseInt(data) * 60;
        } else if (data.indexOf('Second') !== -1) {
          return data
        }
      }
    },
    fnSelectAll() {
      let vm = this,
        arr = [];
      this.tableData.data.forEach(function(ele) {
        arr.push(ele.select)
      });
      let checkItem = arr.indexOf(false);
      if (checkItem == -1) {
        this.tableData.data.forEach(function(ele) {
          ele.select = false;
        });
        vm.repaint(null);
        this.showAllSelect = false;
        this.updateFilterValue(this.tableData.data);
      } else {
        this.tableData.data.forEach(function(ele) {
          ele.select = true;
        });
        vm.repaint(null);
        this.showAllSelect = true;
        this.updateFilterValue(this.tableData.data);
      }
    },
    updateFilterValue(val) {
      let dtModel = DfUtils.getDataModel('Touch Points');
      for (var key in val) {
        if (val[key]['select']) {
          dtModel.value.include.push(parseInt(val[key]['attributeValue']));
        }
      }
      //Emit the data out global data model
      eventHub.$emit('updateFilterValue', dtModel);
    },
    initSelectedFilterValue(table) {
      //Azhaziq- 30-10-2017: Defect 2079
      let currentSelectedFilter = this.$props.localSectionFilter.value.include;
      if (currentSelectedFilter.length > 0) {
        for (var key in currentSelectedFilter) {
          let tableArr = table.find((arr) => {
            if (arr.attributeValue == currentSelectedFilter[key]) {
              return true;
            } else {
              return false;
            };
          });
          tableArr.select = true;
        }
      }
    },
    windowResized() {
      var i = document.getElementsByClassName("tp-box-wrapper")[1].clientHeight;
      var j = document.getElementsByClassName("tp-thead")[0].clientHeight;
      $('.tp-tbody').css('height', i - j - 15);
    }
  }
}
