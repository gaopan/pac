import DfUtils from "../../dynamic-filter-utils.js"
import Datepicker from "@/components/leap-datepicker/Datepicker.vue"
import * as d3 from 'd3'
import * as d3BI from '@/lib/d3-bi/index.js'
import shared from '@/shared.js'
import DynamicFilterApi from '@/api/process-mining.js'
import NotyOperation from '@/utils/noty-operation.js'
import CommonGenerators from '@/utils/common-generators.js'
import DatetimeUtils from '@/utils/datetime-utils.js'
import TypeChecker from '@/utils/type-checker.js'
import Noty from '@/utils/noty-operation.js'
import Internationalization from '@/utils/internationalization.js'

let eventHub = shared.eventHub;
let UUIDGenerator = CommonGenerators.UUIDGenerator;

export default {
  name: 'date-range',
  props: ['localSectionFilter', 'filterDetailData'],
  data() {
    return {
      loadingId: UUIDGenerator.purchase(),
      rangDate: {
        startDate: null,
        endDate: null
      },
      chartData: [],
      startData: [],
      endData: [],
      intersectingData: [],
      filterData: {
        filterType: "date_range",
        value: {
          startDate: null,
          endDate: null,
          way: 'started'
        }
      },
      endDateDisable: {
        to: null,
        from: null
      },
      startDateDisable: {
        to: null,
        from: null
      },
      currentData: [],
      gap: {
        start: 1,
        end: 1,
        intersect: 1
      }
    }
  },
  watch: {
    startData: {
      handler() {
        this.drawChart();
      },
      deep: true
    },
    rangDate: {
      handler(newDate) {
        var vm = this;
        if (newDate.startDate != null && newDate.endDate != null) {
          if (typeof newDate.startDate == 'string') {
            if (new Date().getTimezoneOffset() > 0) {
              newDate.startDate = new Date(new Date(newDate.startDate.replace(/-/, "/")).getTime() - new Date().getTimezoneOffset() * 1000 * 60 + 24 * 60 * 60 * 1000);

            } else if (new Date().getTimezoneOffset() <= 0) {
              newDate.startDate = new Date(new Date(newDate.startDate.replace(/-/, "/")).getTime() - new Date().getTimezoneOffset() * 1000 * 60);
            }
          }
          if (typeof newDate.endDate == 'string') {
            if (new Date().getTimezoneOffset() > 0) {
              newDate.endDate = new Date(new Date(newDate.endDate.replace(/-/, "/")).getTime() - new Date().getTimezoneOffset() * 1000 * 60 + 24 * 60 * 60 * 1000);

            } else if (new Date().getTimezoneOffset() <= 0) {
              newDate.endDate = new Date(new Date(newDate.endDate.replace(/-/, "/")).getTime() - new Date().getTimezoneOffset() * 1000 * 60);
            }
          }
          this.updateChart();
        }
      },
      deep: true
    },
    filterData: {
      handler() {

        this.updateFilterValue(this.filterData); //pping algorithm to fit your own data model to global data model
      },
      deep: true
    }
  },
  methods: {
    updateFilterValue(val) {
      //This is function to add the filter value to global data model

      //05-10-2017 - Azhaziq: Tansform Selected Data to fit global data model
      //Set data model
      let dtModel = DfUtils.getDataModel('Date Range');
      dtModel.value = val.value;
      //Emit the data out global data model
      eventHub.$emit('updateFilterValue', val);

    },
    addEventLogRange: function() {
      var vm = this;
      var vm = this;
      if (vm.currentData.length) {
        let newObj = vm.rangDate;
        var rdate = new Date(vm.currentData[0].time);
        var endDate = new Date(vm.currentData[vm.currentData.length - 1].time);
        vm.startDateDisable = {
          to: rdate ? rdate : null,
          from: (newObj.endDate) ? new Date(newObj.endDate.getTime() - 24 * 60 * 60 * 1000) : null // Disable all dates after specific date
        }
        vm.endDateDisable = {
          to: (newObj.startDate) ? new Date(newObj.startDate.getTime() + 24 * 60 * 60 * 1000) : null,
          from: endDate ? new Date(Date.parse(vm.currentData[vm.currentData.length - 1].time)) : null // Disable all dates up to specific date
        }
      } else {
        var newDate = new Date();
        newDate.setTime(0);
        vm.endDateDisable = {
          to: null,
          from: new Date(newDate.toJSON()) // Disable all dates up to specific date
        }
        vm.startDateDisable = {
          to: null,
          from: new Date(newDate.toJSON()) // Disable all dates after specific date
        }
      }
    },
    clickStatus(type) {
      var vm = this;
      vm.filterData.value.way = type;
      vm.setCurrentData(type);
      vm.drawChart();
      setTimeout(function() {
        var rdate = new Date(vm.currentData[0].time);
        var endDate = new Date(vm.currentData[vm.currentData.length - 1].time);
        vm.rangDate.startDate = rdate;
        vm.rangDate.endDate = endDate;
      }, 100)

      this.updateChart();


    },
    setCurrentData(type) {
      switch (type) {
        case 'started':
          this.currentData = this.startData;
          break;
        case 'completed':
          this.currentData = this.endData;
          break;
        case 'intersection':
          this.currentData = this.intersectingData;
          break;
      }
    },
    initChart() {
      let vm = this;

      this.lineChart = d3BI.baseChart();
      this.draggedRuler = d3BI.draggedRuler();

      this.lineChart.duration(0).margin({ top: 10, right: 45, bottom: 0, left: 0 });
      this.lineChart.legend.visibility(false);
      this.lineChart.yAxis.title(Internationalization.translate('number of cases')).domainToZero(true).packetAxis((hC) => {
        if (this.lineChart.hasOwnProperty('yAxisPosition')) {
          let axisPosition = this.lineChart.yAxisPosition;
          hC.attr('transform', 'translate(' + axisPosition.x + ',' + (axisPosition.y - 5) + ')');
        }
      });
      this.lineChart.xAxis.scale(d3.scaleLinear()).axisVisibility(false);
      this.lineChart.line.curve(d3.curveMonotoneX);
      this.lineChart.lineTooltip.type('line');

      this.draggedRuler.dispatch.on('dragging', function(per, type) {

        if (type == 'pre') {
          var nDate = (vm.extentLineX[vm.extentLineX.length - 1] - vm.extentLineX[0]) * per + vm.extentLineX[0];
          var dDate = new Date(vm.getChartDate(new Date(nDate)) + new Date().getTimezoneOffset() * 60000);
          vm.lineData[1].values[0].label = Date.UTC(dDate.getFullYear(), dDate.getMonth(), dDate.getDate());
          var rdate = new Date(vm.lineData[1].values[0].label);
          vm.rangDate.startDate = rdate;
        } else {
          var nDate = (vm.extentLineX[vm.extentLineX.length - 1] - vm.extentLineX[0]) * per + vm.extentLineX[0],
            dDate = new Date(vm.getChartDate(new Date(nDate)) + new Date().getTimezoneOffset() * 60000);
          vm.lineData[1].values[1].label = Date.UTC(dDate.getFullYear(), dDate.getMonth(), dDate.getDate());
          var rdate = new Date(vm.lineData[1].values[1].label);
          vm.rangDate.endDate = rdate;

        }
      });

      // this.draggedRuler.dispatch.on('drag-end', function(per, type) {
      //   if (type == 'pre') {
      //     var nDate = (vm.extentLineX[vm.extentLineX.length - 1] - vm.extentLineX[0]) * per + vm.extentLineX[0],
      //       dDate = new Date(nDate+(new Date().getTimezoneOffset())*60000);

      //     vm.lineData[1].values[0].label = Date.UTC(dDate.getFullYear(), dDate.getMonth(), dDate.getDate());
      //     var rdate = new Date(vm.lineData[1].values[0].label);

      //     vm.rangDate.startDate = rdate;
      //   } else {
      //     var nDate = (vm.extentLineX[vm.extentLineX.length - 1] - vm.extentLineX[0]) * per + vm.extentLineX[0],
      //       dDate = new Date(nDate);
      //     vm.lineData[1].values[1].label = Date.UTC(dDate.getFullYear(), dDate.getMonth(), dDate.getDate());
      //     var rdate = new Date(vm.lineData[1].values[1].label);
      //     vm.rangDate.endDate = rdate;
      //   }
      // })
    },
    getChartDate(date) {
      var vm = this;
      var chartDate;
      vm.currentData.forEach((list, i) => {
        if (i != vm.currentData.length - 1) {
          if (list.time <= date.getTime() && date.getTime() < vm.currentData[i + 1].time) {
            chartDate = list.time.getTime()
          }
        } else {
          if (list.time.getTime() == date.getTime()) {
            chartDate = list.time.getTime()
          }
        }
      })
      return chartDate;
    },
    drawChart() {
      var vm = this;
      if (!this.currentData.length) {
        this.hLineChart.iappend('svg.chart').datum([]).call(this.lineChart);
        return;
      };
      this.lineData = getLineData();
      this.totalLineParts = this.lineData[0].values.length - 1;
      this.extentLineX = d3.extent(this.lineData[0].values.map(function(d) { return d.label }));
      this.extentLineY = d3.extent(this.lineData[0].values.map(function(d) { return d.value }));

      this.lineData[1].values = [{
          label: this.extentLineX[0],
          value: this.extentLineY[1]
        },
        {
          label: this.extentLineX[0],
          value: this.extentLineY[1]
        }
      ];

      this.hLineChart.iappend('svg').datum(this.lineData).call(this.lineChart);

      this.draggedRuler
        .distance({
          left: this.lineChart.xAxisPosition.x,
          right: this.lineChart.width - (this.lineChart.xAxisPosition.x + this.lineChart.xAxisWidth)
        })
        .sitePercentage({
          pre: this.selectedLineLeft / (vm.extentLineX[vm.extentLineX.length - 1] - vm.extentLineX[0]),
          lat: this.selectedLineRight / (vm.extentLineX[vm.extentLineX.length - 1] - vm.extentLineX[0])
        });

      this.hDraggedRuler.iappend('svg').call(this.draggedRuler);



      function getLineData() {
        let bgValues = [],
          selectedValues = [];
        var selectedDate = vm.currentData;
        selectedDate.forEach((d, i) => {
          var list = {};
          list.label = Date.parse(new Date(d.time));
          list.value = d.caseCount;
          bgValues.push(list);
        });
        vm.chartData = bgValues;
        return [{
          type: 'line',
          name: 'bg area',
          area: true,
          color: '#5F6B6D',
          label: {
            x: 'bg x',
            y: 'bg y',
            name: 'name'
          },
          values: bgValues
        }, {
          type: 'line',
          name: 'selected area',
          area: true,
          color: '#01B8AA',
          label: {
            x: 'selected x',
            y: 'selected y',
            name: 'name'
          },
          values: []
        }];
      }
    },
    updateChart() {
      var vm = this;

      var filterRdate = vm.rangDate.startDate;

      var filterEndDate = vm.rangDate.endDate;

      var convertDateToStr = function(date) {
        var y = date.getFullYear(),
          m = date.getMonth(),
          d = date.getDate();


        var sY = y + '',
          sM = m + 1 + '',
          sD = d + '';

        if (m < 9) sM = '0' + sM;
        if (d < 10) sD = '0' + sD;

        return sY + '-' + sM + '-' + sD;
      };
      vm.filterData.value.startDate = DatetimeUtils.convertUTCWithTimeZone(new Date(filterRdate.getTime() + new Date().getTimezoneOffset() * 1000 * 60));
      vm.filterData.value.endDate = DatetimeUtils.convertUTCWithTimeZone(new Date(filterEndDate.getTime() + 24 * 60 * 60 * 1000 + new Date().getTimezoneOffset() * 1000 * 60));

      var rdate = vm.getChartDate(new Date(vm.rangDate.startDate));
      var endDate = vm.getChartDate(new Date(vm.rangDate.endDate));
      if (this.extentLineY != null) {
        this.lineData[1].values = [{
            label: rdate,
            value: this.extentLineY[1]
          },
          {
            label: endDate,
            value: this.extentLineY[1]
          }
        ];

        function byDay(timeZone) {
          var dayTimeZone = parseInt(timeZone / 3600000 / 24);
          return dayTimeZone;
        };
        this.lineChart.tooltip.setContent(function(d) {
          if (rdate < d.x && endDate > d.x) {
            var dTimeTip = new Date(d.x);

            var count = d.yValues[0].data.y;
            var timeTip = convertDateToStr(dTimeTip);
            var str = '<tr><td >' + Internationalization.translate('Case Count') + ' : ' + '</td><td>' + count + '</td></tr>' +
              '<tr><td >' + Internationalization.translate('Date') + ' : ' + '</td><td>' + timeTip + '</td></tr>';

          } else if (rdate == d.x || endDate == d.x) {
            var count = null;
            vm.chartData.forEach((r) => {
              if (r.label == d.x) {
                count = r.value;
              }
            })
            var dTimeTip = new Date(d.x);

            var timeTip = convertDateToStr(dTimeTip);
            if (count != null) {
              var str = '<tr><td >' + Internationalization.translate('Case Count') + ' : ' + '</td><td>' + count + '</td></tr>' +
                '<tr><td >' + Internationalization.translate('Date') + ' : ' + '</td><td>' + timeTip + '</td></tr>';
            } else {
              var str = '<tr><td >' + Internationalization.translate('Date') + ' : ' + '</td><td>' + timeTip + '</td></tr>';
            }

          } else {
            var str = '<tr><span> ' + Internationalization.translate('Out Of Date Range') + ' <span><tr>';
          }
          return '<table>' + str + '</table>';
        });
        this.hLineChart.iappend('svg').datum(this.lineData).call(this.lineChart);
        this.draggedRuler
          .sitePercentage({
            pre: (rdate - vm.extentLineX[0]) / (vm.extentLineX[vm.extentLineX.length - 1] - vm.extentLineX[0]),
            lat: (endDate - vm.extentLineX[0]) / (vm.extentLineX[vm.extentLineX.length - 1] - vm.extentLineX[0])
          });

        this.hDraggedRuler.iappend('svg').call(this.draggedRuler);
      }
      setTimeout(function() {
        d3.select(vm.$refs['date-range']).select('.line-groups').select('.line-tooltip.line-tooltip-line').selectAll('rect')

          .on('click', function(d) {
            if (rdate <= d.x && endDate >= d.x) {

              var caseCount = 0;
              vm.currentData.forEach((list) => {
                if (rdate <= list.time && endDate >= list.time) {
                  caseCount += list.caseCount;
                }
              })
              var time = (endDate - rdate) / 3600 / 24 / 1000 + 1;
              var unit;
              if (time > 1) {
                unit = 'days'
              } else {
                unit = 'day'
              }

              Noty.alertWithOneButton({
                text: '<br/> <table><tr><td>' + Internationalization.translate('Total Case') + ' </td><td>' + ': ' + caseCount + '</td></tr>' +
                  '<table><tr><td>' + Internationalization.translate('Total Days') + ' </td><td>' + ': ' + time + ' ' + unit + '</td></tr>' +
                  '<tr><td>' + Internationalization.translate('From') + ' </td><td>' + ': ' + DatetimeUtils.getFullDate(new Date(rdate), 'yyyy-MM-dd') + '</td></tr>' +
                  '<tr><td>' + Internationalization.translate('To') + ': </td><td>' + ': ' + DatetimeUtils.getFullDate(new Date(endDate), 'yyyy-MM-dd') + '</td></tr></table>',
                layout: 'center'
              });
            }
          });

      }, 500)
      this.addEventLogRange();
    },
    windowResize() {
      this.drawChart();
      this.updateChart();
    },
    compareDate(obj1, obj2) {
      var val1 = Date.parse(new Date(obj1.time));
      var val2 = Date.parse(new Date(obj2.time));
      if (val1 < val2) {
        return -1;
      } else if (val1 > val2) {
        return 1;
      } else {
        return 0;
      }
    },
    initAllData(res) {
      var vm = this;
      var minTime = Infinity,
        maxTime = 0,
        startData = [],
        endData = [],
        intersectingData = [];

      var getDataList = function(d) {
        var list = {};
        var convertedTime = d.date;
        list.time = new Date(convertedTime);
        list.caseCount = d.count;
        return list;
      };

      var fnCheckIfExist = function(theData, nTime) {
        var exists = false;
        theData.every(theD => {
          if (theD.time.getTime() == nTime) {
            exists = true;
            return false;
          }
          return true;
        });
        return exists;
      };
      res.data.completedInDateRange.list.forEach((d) => {
        endData.push(getDataList(d));
      })
      res.data.startedInDateRange.list.forEach((d) => {
        startData.push(getDataList(d));
      })
      res.data.intersectingDateRange.list.forEach((d) => {
        intersectingData.push(getDataList(d));
      })



      function allData(minTime, maxTime, gap, datalist) {
        for (var t = minTime; t <= maxTime; t = t + gap * 24 * 3600000) {
          if (!fnCheckIfExist(datalist, t)) {
            datalist.push({
              time: new Date(t),
              caseCount: 0
            });
          }
        }
      }
      this.gap.start = res.data.startedInDateRange.gap;
      this.gap.end = res.data.completedInDateRange.gap;
      this.gap.intersect = res.data.intersectingDateRange.gap;
      allData(res.data.completedInDateRange.start, res.data.completedInDateRange.end, res.data.completedInDateRange.gap, endData);
      allData(res.data.startedInDateRange.start, res.data.startedInDateRange.end, res.data.startedInDateRange.gap, startData);
      allData(res.data.intersectingDateRange.start, res.data.intersectingDateRange.end, res.data.intersectingDateRange.gap, intersectingData);
      vm.startData = startData.sort(vm.compareDate);
      vm.endData = endData.sort(vm.compareDate);
      vm.intersectingData = intersectingData.sort(vm.compareDate);

      var type = vm.localSectionFilter.value.way || 'started';
      vm.setCurrentData(type);
      vm.filterData.value.way = type;
      var startDateTime = vm.currentData[0].time.getTime();
      var endDateTime = vm.currentData[vm.currentData.length - 1].time.getTime();
      console.log(vm.currentData);
      if (TypeChecker.isString(vm.localSectionFilter.value.startDate)) {
        var setStartDateTime = new Date(vm.localSectionFilter.value.startDate).getTime();
        if (setStartDateTime >= startDateTime && setStartDateTime <= endDateTime) {
          startDateTime = setStartDateTime;
        }
      }
      if (TypeChecker.isString(vm.localSectionFilter.value.endDate)) {
        var setEndDateTime = new Date(vm.localSectionFilter.value.endDate).getTime() - 24 * 60 * 60 * 1000;
        if (setEndDateTime >= startDateTime && setEndDateTime <= endDateTime) {
          endDateTime = setEndDateTime;
        }

      }
      var rdate = new Date(startDateTime);
      var endDate = new Date(endDateTime);
      vm.filterData.value.startDate = DatetimeUtils.getFullDate(rdate, 'yyyy-MM-dd');
      vm.filterData.value.endDate = DatetimeUtils.getFullDate(endDate, 'yyyy-MM-dd');

      setTimeout(function() {
        vm.rangDate.startDate = rdate;
        vm.rangDate.endDate = endDate;
      }, 100);
    },
    getRangeDate() {
      var vm = this;
      if (vm.$props.filterDetailData == null) {
        eventHub.$emit("start-mini-loader", { id: this.loadingId });
        DynamicFilterApi.getRangeData(this.$store.getters.processSelection.customerId,
          this.$store.getters.processSelection.processAnalyticsId).then((res) => {
          eventHub.$emit("finish-mini-loader", { id: this.loadingId });
          vm.initAllData(res);
          vm.$emit('dataRangeFDChange', {
            name: 'dataRange',
            value: res
          })
        }, () => {
          eventHub.$emit("finish-mini-loader", { id: this.loadingId });
          NotyOperation.notifyError({ text: 'Get dynamic filter error.' });
        })
      } else {
        vm.initAllData(vm.$props.filterDetailData);
      }

    }
  },
  created() {
    let vm = this;

    this.lineData = null;
    this.totalLineParts = 0;
    this.extentLineX = null;
    this.extentLineY = null;
    this.selectedLineLeft = 0;
    this.selectedLineRight = 0;

    this.lineChart = null;
    this.draggedRuler = null;

    this.hLineChart = null;
    this.hDraggedRuler = null;
    window.addEventListener('resize', this.windowResize);

  },
  mounted() {
    this.getRangeDate();
    this.hLineChart = d3.select(this.$refs['date-range']).select('.line-chart').select('.chart');
    this.hDraggedRuler = d3.select(this.$refs['date-range']).select('.dragged-ruler').select('.chart');
    this.initChart();
    this.drawChart();
    this.addEventLogRange();

  },
  beforeDestroy() {
    window.removeEventListener('resize', this.windowResize);
  },
  components: {
    Datepicker
  }
}
