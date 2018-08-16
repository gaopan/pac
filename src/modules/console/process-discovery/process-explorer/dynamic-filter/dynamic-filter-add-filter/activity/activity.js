import shared from "@/shared.js"
import * as d3 from 'd3'
import SVG from 'svg.js'
import * as d3BI from '@/lib/d3-bi/index.js'
import CommonGenerators from '@/utils/common-generators.js'
import NotyOperation from '@/utils/noty-operation.js'

import DfUtils from "../../dynamic-filter-utils.js"
import DynamicFilterApi from '@/api/process-mining.js'

var eventHub = shared.eventHub;

export default {
  name: 'activity',
  props: ['localSectionFilter', 'filterDetailData'],

  data() {
    return {
      activityData: [],
      activityTableData: [],
      chartWidth: null,
      chartHeight: null,
      checkAllBox: false,
      showFilterModeInfo: false,
      sortFrequency: 0,
      activitySearchText: '',
      tempData: [],
      isInitData: false,
      showEditFilterMode: false,
      editFilterData: {},
      sortTableOption: null,
      loadId: null,
      sortTableStatus: [],
      colors: {
        true: '#00C9FF',
        false: '#C7CBD5'
      }
    }
  },

  created() {
    eventHub.$on("tile-window-resized", this.windowResized);
    eventHub.$on("changeFilterSets", this.onChangeFilterSets);
    this.loadId = CommonGenerators.UUIDGenerator.purchase();
    this.requestData();
    var vm = this;
    setTimeout(function() {
      vm.windowResized();
    }, 500);
    this.barChart = null;
    this.barContainer = null;
    this.initTempData();
    this.initSortStatus();
  },

  mounted: function() {
    const that = this;
    window.onresize = () => {
      return (() => {
        if (document.getElementsByClassName('act-box-wrapper')[0] != undefined) {
          that.chartWidth = document.getElementsByClassName('act-box-wrapper')[0].clientWidth;
        }
      })()
    }
  },

  watch: {
    chartWidth: {
      handler(data, oldData) {
        this.chartWidth = data;
        this.repaint(null)
      },
      deep: true
    },
    activityTableData: {
      handler(data, oldData) {
        var isAllChecked = true;
        for (var i = 0; i < data.length; i++) {
          if (data[i].checked == false) {
            this.checkAllBox = false;
            isAllChecked = false;
          }
        }
        if (isAllChecked == true) {
          this.checkAllBox = true;
        }
      },
      deep: true
    }
  },

  methods: {
    requestData() {
      var vm = this,
        processAnalyticsId = this.$store.getters.processSelection.processAnalyticsId,
        customerId = this.$store.getters.processSelection.customerId;
      if (this.$props.filterDetailData == null) {
        eventHub.$emit("start-mini-loader", { id: this.loadId });
        DynamicFilterApi.getActivityData(customerId, processAnalyticsId).then((res) => {
          eventHub.$emit("finish-mini-loader", { id: this.loadId });
          vm.initChartAndTable(res.data.list)
          vm.$emit('activityFDChange', {
            name: 'activity',
            value: res.data.list
          })
          vm.clickSortNum('frequency');
        }, () => {
          eventHub.$emit("finish-mini-loader", { id: this.loadId });
          NotyOperation.notifyError({ text: 'Get dynamic filter error.' });
        });
      } else {
        vm.initChartAndTable(this.$props.filterDetailData)
        vm.clickSortNum('frequency');
      }
    },

    initChartAndTable(activityList) {
      var vm = this;
      for (var i = 0; i < activityList.length; i++) {
        var activityData = {};
        activityData.index = i;
        activityData.checked = false;
        //24 Nov 2017: adib.ghazali@gmail.com - add properties (activityId)
        activityData.activityId = activityList[i].activity.activityId ? parseInt(activityList[i].activity.activityId) : undefined;
        activityData.activity = activityList[i].activity.activityName;
        activityData.frequency = activityList[i].frequency;
        var relativeFrequency = parseFloat(activityList[i].relativeFrequency) * 100;
        relativeFrequency = relativeFrequency.toFixed(2);
        activityData.relativeFrequency = relativeFrequency;
        activityData.medianDuration = this.timeFormat(activityList[i].medianDuration, 2);
        activityData.averageDuration = this.timeFormat(activityList[i].averageDuration, 2);
        activityData.minimumDuration = this.timeFormat(activityList[i].minimumDuration, 2);
        activityData.maximumDuration = this.timeFormat(activityList[i].maximumDuration, 2);
        activityData.origMedianDuration = activityList[i].medianDuration;
        activityData.origAverageDuration = activityList[i].averageDuration;
        activityData.origMinimumDuration = activityList[i].minimumDuration;
        activityData.origMaximumDuration = activityList[i].maximumDuration;
        var filteringMode = {};
        filteringMode.included = false;
        filteringMode.excluded = false;
        activityData.filteringMode = filteringMode;
        this.activityData.push(activityData);
      }
      this.initActivityDataBylocalSectionFilter();
      var objDeepCopy = function(source) {
        var sourceCopy = source instanceof Array ? [] : {};
        for (var item in source) {
          sourceCopy[item] = typeof source[item] === 'object' ? objDeepCopy(source[item]) : source[item];
        }
        return sourceCopy;
      }
      this.activityTableData = objDeepCopy(this.activityData);
      this.changeTempData(this.activityTableData);
      setTimeout(function() {
        vm.initChart();
      }, 100)
    },

    initActivityDataBylocalSectionFilter() {
      var excluded = this.localSectionFilter.value.exclude;
      var included = this.localSectionFilter.value.include;

      for (var i = 0; i < excluded.length; i++) {
        for (var j = 0; j < this.activityData.length; j++) {

          //07-12-2017: Azhaziq - Always compare activity
          if (excluded[i] == this.activityData[j].activity) {
            this.activityData[j].checked = true;
            this.activityData[j].filteringMode.excluded = true;
          }

        }
      }
      for (var i = 0; i < included.length; i++) {
        for (var j = 0; j < this.activityData.length; j++) {

          //07-12-2017: Azhaziq - Always compare activity
          if (included[i] == this.activityData[j].activity) {
            this.activityData[j].checked = true;
            this.activityData[j].filteringMode.included = true;
          }
        }
      }
    },

    deepCopy(arr) {
      let res = []
      for (let i = 0; i < arr.length; i++) {
        res.push(arr[i])
      }
      return res
    },

    initTempData() {
      this.tempData = [];
      for (var i = 0; i < this.activityTableData.length; i++) {
        var tempData = {};
        var tempDataValue = this.activityTableData[i].relativeFrequency.slice(0, this.activityTableData[i].relativeFrequency.length - 1)
        tempData.value = tempDataValue;
        tempData.label = i;
        tempData.index = this.activityTableData[i].index;
        tempData.selected = this.activityTableData[i].checked;
        this.tempData.push(tempData);
      }
    },

    initChart() {
      let vm = this;
      this.barContainer = d3.select('#act-bar-chart');
      this.barContainer.style('height', vm.barChartHeight());
      this.barContainer.style('width', this.chartWidth);
      vm.barChart = d3BI.baseChart('bar')
        .x(function(d) {
          return d.label
        })
        .y(function(d) {
          return d.value
        })
        .margin({ top: 15, right: 20, left: 15, bottom: 10 })
      vm.barChart.axisLines.showAll({ x: true, y: false });
      vm.barChart.axisLines.pattern({ x: true, y: true });
      vm.barChart.yAxis.givenDomain(this.transformDomain);
      vm.barChart.yAxis.title('Relative Frequency %');
      vm.barChart.xAxis.title('Activity');
      vm.barChart.bar.fnColorWrapper(vm.getColorCode);
      vm.barChart.yAxis.axis().ticks(5);
      vm.barChart.tooltip.privateClass('bi-tooltip-change');
      vm.barChart.tooltipDispatch.on('click.active', function(args, ele, config) {
        vm.fnSelectColumnForChart(args.data.label);
      });
      vm.barChart.tooltip.setContent(function(args) {
        var str = '',
          activityNum = args.yValues[0].data.x;
        for (var i = 0; i < vm.activityTableData.length; i++) {
          if (i === activityNum) {
            var activityName = vm.activityTableData[i].activity;
            var frequency = vm.activityTableData[i].frequency;
            var relativeFrequency = vm.activityTableData[i].relativeFrequency;
          }
        }
        str = '<p>' + activityName + '</p>' +
          '<p>' + 'Frequency: ' + frequency + '</p>' +
          '<p>' + 'Relative Frequency: ' + relativeFrequency + '%' + '</p>'
        return '<div>' + str + '</div>';
      });
      var data = this.chartData(this.tempData)
      vm.barContainer
        .append('svg')
        .datum(data)
        .call(vm.barChart);
    },

    barChartHeight() {
      let chart = this.barContainer.node();
      if (chart == null) {
        return '0px';
      } else {
        return chart.offsetParent.clientHeight - chart.offsetTop + 'px';
      }
    },

    transformDomain(domain) {
      var y = 0;
      this.activityData.forEach(function(a) {
        y = y < parseFloat(a.relativeFrequency) ? parseFloat(a.relativeFrequency) : y
      })
      if (y < 100) {
        if (y % 2 == 1) {
          y++;
        } else {
          y = y + 2;
        }
      }
      domain[1] = y;
      if (domain[0] > 0) domain[0] = 0;
      return domain;
    },

    chartData(data) {
      var i = 0;
      return [{
        name: 'Spot',
        values: data
      }];
    },

    repaint(data) {
      let vm = this;
      if (vm.barContainer != null) {
        vm.barContainer.style('height', vm.barChartHeight());
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
      }

    },

    fnSelectColumnForChart(data) {
      if (this.activityTableData[data].checked == false) {
        this.activityTableData[data].filteringMode.included = true;
      } else {
        this.activityTableData[data].filteringMode.included = false;
        this.activityTableData[data].filteringMode.excluded = false;
      }
      this.activityTableData[data].checked = !this.activityTableData[data].checked;
      var activityDataIndex = this.activityTableData[data].index
      if (this.activityData[activityDataIndex].checked == false) {
        this.activityData[activityDataIndex].filteringMode.included = true;
        this.activityData[activityDataIndex].checked = true;
      } else {
        this.activityData[activityDataIndex].filteringMode.included = false;
        this.activityData[activityDataIndex].filteringMode.excluded = false;
        this.activityData[activityDataIndex].checked = false;
      }
      this.changeTempData(this.activityTableData);
      this.repaint(this.chartData(this.tempData));
      this.updateFilterValue(this.getCheckedActivityData(this.activityData));
      if (this.activityTableData[data].checked == true) {
        this.showEditFilterMode = true;
      }
      this.editFilterData = this.activityTableData[data];
    },

    closeEditFilterMode() {
      this.showEditFilterMode = false;
    },

    clickEditFilterModeExcluded(index) {
      var activityDataIndex = 0;
      for (var i = 0; i < this.activityData.length; i++) {
        if (index == this.activityData[i].index) {
          activityDataIndex = i;
        }
      }
      this.activityData[activityDataIndex].filteringMode.included = false;
      this.activityData[activityDataIndex].filteringMode.excluded = true;
      this.editFilterData.filteringMode.included = false;
      this.editFilterData.filteringMode.excluded = true;
      this.updateFilterValue(this.getCheckedActivityData(this.activityData));
    },

    clickEditFilterModeIncluded(index) {
      var activityDataIndex = 0;
      for (var i = 0; i < this.activityData.length; i++) {
        if (index == this.activityData[i].index) {
          activityDataIndex = i;
        }
      }
      this.activityData[activityDataIndex].filteringMode.included = true;
      this.activityData[activityDataIndex].filteringMode.excluded = false;
      this.editFilterData.filteringMode.included = true;
      this.editFilterData.filteringMode.excluded = false;
      this.updateFilterValue(this.getCheckedActivityData(this.activityData));
    },

    getColorCode(h, d, config) {
      for (var i = 0; i < this.activityTableData.length; i++) {
        if (i == d.data.index) {
          config.barGroupIndex = this.activityTableData[i].checked;
        }
      }
      return (d.data.selected) ? this.colors.true : this.colors.false;
    },

    clickActivityTheadCheckbox() {
      for (var i = 0; i < this.activityTableData.length; i++) {
        var activityDataIndex = this.activityTableData[i].index;
        if (this.checkAllBox == true) {
          this.activityTableData[i].checked = false;
          this.activityTableData[i].filteringMode.included = false;
          this.activityTableData[i].filteringMode.excluded = false;
        } else {
          if (this.activityTableData[i].checked == false) {
            this.activityTableData[i].checked = true;
            this.activityTableData[i].filteringMode.included = true;
          };
        }

        if (this.checkAllBox == true) {
          this.activityData[activityDataIndex].checked = false;
          this.activityData[activityDataIndex].filteringMode.included = false;
          this.activityData[activityDataIndex].filteringMode.excluded = false;
        } else {
          this.activityData[activityDataIndex].checked = true;
          this.activityData[activityDataIndex].filteringMode.included = true;
        }
      }
      this.checkAllBox = !this.checkAllBox;
      this.changeTempData(this.activityTableData);
      this.repaint(this.chartData(this.tempData));
      this.updateFilterValue(this.getCheckedActivityData(this.activityData));
    },

    checkThisBox(index, tableIndex) {
      let vm = this;
      if (this.activityData[index].checked == false) {
        this.activityData[index].filteringMode.included = true;
        this.activityData[index].checked = true;
      } else {
        this.activityData[index].filteringMode.included = false;
        this.activityData[index].filteringMode.excluded = false;
        this.activityData[index].checked = false;
      }
      if (this.activityTableData[tableIndex].checked == false) {
        this.activityTableData[tableIndex].filteringMode.included = true;
        this.activityTableData[tableIndex].checked = true;
      } else {
        this.activityTableData[tableIndex].filteringMode.included = false;
        this.activityTableData[tableIndex].filteringMode.excluded = false;
        this.activityTableData[tableIndex].checked = false;
      }
      this.changeTempData(this.activityTableData);
      this.repaint(this.chartData(this.tempData));
      this.updateFilterValue(this.getCheckedActivityData(this.activityData));
    },

    checkIncluded(index, tableIndex) {
      this.activityData[index].checked = true;
      this.activityData[index].filteringMode.included = true;
      this.activityData[index].filteringMode.excluded = false;
      this.activityTableData[tableIndex].checked = true;
      this.activityTableData[tableIndex].filteringMode.included = true;
      this.activityTableData[tableIndex].filteringMode.excluded = false;
      this.changeTempData(this.activityTableData);
      this.repaint(this.chartData(this.tempData));
      this.updateFilterValue(this.getCheckedActivityData(this.activityData));
    },
    checkExcluded(index, tableIndex) {
      this.activityData[index].checked = true;
      this.activityData[index].filteringMode.included = false;
      this.activityData[index].filteringMode.excluded = true;
      this.activityTableData[tableIndex].checked = true;
      this.activityTableData[tableIndex].filteringMode.included = false;
      this.activityTableData[tableIndex].filteringMode.excluded = true;
      this.changeTempData(this.activityTableData);
      this.repaint(this.chartData(this.tempData));
      this.updateFilterValue(this.getCheckedActivityData(this.activityData));
    },

    initSortStatus() {
      this.sortTableStatus.activity = 0;
      this.sortTableStatus.frequency = 0;
      this.sortTableStatus.relativeFrequency = 0;
      this.sortTableStatus.origMedianDuration = 0;
      this.sortTableStatus.origAverageDuration = 0;
      this.sortTableStatus.origMinimumDuration = 0;
      this.sortTableStatus.origMaximumDuration = 0;
    },

    clickSortNum(opt) {
      let vm = this;
      if (this.sortTableOption != opt) {
        this.initSortStatus();
        this.sortTableOption = opt;
      }
      if (this.sortTableStatus[opt] == 0) {
        this.sortTableStatus[opt] = -1;
        this.activityTableData.sort(this.compareNumFromSmallToLarge(opt))
      } else if (this.sortTableStatus[opt] == -1) {
        this.sortTableStatus[opt] = 1;
        this.activityTableData.sort(this.compareNumFromLargeToSmall(opt))
      } else {
        this.sortTableStatus[opt] = -1;
        this.activityTableData.sort(this.compareNumFromSmallToLarge(opt))
      }
      this.changeTempData(this.activityTableData);
      vm.repaint(this.chartData(this.tempData));
    },

    compareNumFromLargeToSmall(prop) {
      return function(obj1, obj2) {
        var val1 = parseFloat(obj1[prop]);
        var val2 = parseFloat(obj2[prop]);
        if (val1 < val2) {
          return -1;
        } else if (val1 > val2) {
          return 1;
        } else {
          return 0;
        }
      }
    },

    compareNumFromSmallToLarge(prop) {
      return function(obj1, obj2) {
        var val1 = parseFloat(obj1[prop]);
        var val2 = parseFloat(obj2[prop]);
        if (val1 > val2) {
          return -1;
        } else if (val1 < val2) {
          return 1;
        } else {
          return 0;
        }
      }
    },
    clickSortTable(opt) {
      let vm = this;
      if (this.sortTableOption != opt) {
        this.initSortStatus();
        this.sortTableOption = opt;
      }

      if (this.sortTableStatus[opt] == 0) {
        this.sortTableStatus[opt] = -1;
        this.activityTableData.sort(this.compareFromSmallToLarge(opt))
      } else if (this.sortTableStatus[opt] == -1) {
        this.sortTableStatus[opt] = 1;
        this.activityTableData.sort(this.compareFromLargeToSmall(opt))
      } else {
        this.sortTableStatus[opt] = -1;
        this.activityTableData.sort(this.compareFromSmallToLarge(opt))
      }
      this.changeTempData(this.activityTableData);
      vm.repaint(this.chartData(this.tempData));
    },

    compareFromLargeToSmall(prop) {
      return function(obj1, obj2) {
        var val1 = obj1[prop];
        var val2 = obj2[prop];
        if (val1 < val2) {
          return -1;
        } else if (val1 > val2) {
          return 1;
        } else {
          return 0;
        }
      }
    },

    compareFromSmallToLarge(prop) {
      return function(obj1, obj2) {
        var val1 = obj1[prop];
        var val2 = obj2[prop];
        if (val1 > val2) {
          return -1;
        } else if (val1 < val2) {
          return 1;
        } else {
          return 0;
        }
      }
    },

    clickSearchActivity() {
      var objDeepCopy = function(source) {
        var sourceCopy = source instanceof Array ? [] : {};
        for (var item in source) {
          sourceCopy[item] = typeof source[item] === 'object' ? objDeepCopy(source[item]) : source[item];
        }
        return sourceCopy;
      }
      let vm = this;
      var reg = new RegExp(this.activitySearchText.toLowerCase());
      this.activityTableData = [];
      var activityTableDataCopy = [];
      for (var i = 0; i < this.activityData.length; i++) {
        if (this.activityData[i].activity.toLowerCase().match(reg)) {
          activityTableDataCopy.push(this.activityData[i]);
        }
      }
      this.activityTableData = objDeepCopy(activityTableDataCopy);
      this.changeTempData(this.activityTableData);
      vm.repaint(this.chartData(this.tempData));
      this.checkAllBox = false;
    },

    changeTempData(data) {
      this.tempData = [];
      for (var i = 0; i < data.length; i++) {
        var tempData = {};
        var tempDataValue = data[i].relativeFrequency.slice(0, data[i].relativeFrequency.length - 1)
        tempData.value = tempDataValue;
        tempData.label = i;
        tempData.index = data[i].index
        tempData.selected = data[i].checked;
        this.tempData.push(tempData);
      }
    },


    getCheckedActivityData(data) {
      var checkedActivityData = {};
      checkedActivityData.filterType = 'activity';
      var included = [],
        inNum = 0,
        excluded = [],
        exNum = 0;
      for (var i = 0; i < data.length; i++) {
        if (data[i].checked == true) {
          if (data[i].filteringMode.included) {

            //07/12-2017: Azhaziq - Always send name
            included[inNum] = data[i].activity;
            inNum++;
          }
          if (data[i].filteringMode.excluded) {

            //07/12-2017: Azhaziq - Always send name
            excluded[exNum] = data[i].activity;
            exNum++;
          }
        }
      }

      //Azhaziq - 13-10-2017 : include and exlude present tense instead of past tense
      var activityValue = {};
      activityValue.include = included;
      activityValue.exclude = excluded;
      checkedActivityData.value = activityValue;
      return checkedActivityData;
    },

    updateFilterValue(val) {
      //24 Nov 2017: adib.ghazali@gmail.com - using activityId instead of activityName when send data to BE
      eventHub.$emit('updateFilterValue', val);
    },

    timeFormat(data, count) {
      var str = null,
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
    },

    windowResized(args) {
      setTimeout(function() {
        if (document.getElementsByClassName("act-table-container")[0] != undefined) {
          var i = document.getElementsByClassName("act-table-container")[0].clientHeight;
          var j = document.getElementsByClassName("activity-thead")[0].clientHeight;
          $('.activity-tbody').css('height', i - j);
        }
      }, 200)
    },

    onChangeFilterSets() {

    }
  }
}
