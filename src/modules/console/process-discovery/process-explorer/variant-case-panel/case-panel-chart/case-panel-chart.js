import * as d3 from 'd3'
import * as d3BI from '@/lib/d3-bi/index.js'
import SVG from 'svg.js'
import shared from "@/shared.js"
import CommonUtils from '@/utils/common-utils.js'
import DatetimeUtils from '@/utils/datetime-utils'

var eventHub = shared.eventHub;

export default {
  name: 'case-panel-chart',
  props: {
    caseChartData: {
      type: Array,
      required: true
    },
    dailyActivities: {
      type: Object,
    }
  },
  data() {
    return {
      noData: false,
      dataYMD: [],
      dateContent: [],
      startTimes: [],
      dateNoIn: [],
      endTimes: [],
      minStartTime: 0,
      maxEndTime: 0,
      totalActivities: 0,
      textTitle: ['总持续时间', '总活动数量', '实例开始时间', '实例结束时间'],
      textContent: {},
      valueForChart: [],
      valueForCurrentCase: [],
      originStartTime: 0,
      originEndTime: 0,
      gap:0,

    }


  },

  created: function() {
    this.textContent = { '总持续时间': 0, '总活动数量': 0, '实例开始时间': 0, '实例结束时间': 0 };
    eventHub.$on("tile-window-resized", this.windowResized);
  },


  watch: {
    "dailyActivities": function(newVal, oldVal) {
      console.log(newVal)
      // if (data && data.length != 0) {
      if (newVal&& newVal.length != 0){
        var data = CommonUtils.deepClone(newVal)

        this.noData = false;

        this.gap=data.gap;
        this.valueForChart = [];
         data.list.forEach(d=> {
          this.valueForChart.push({
            label: d.date,
            value: d.count || 0,
            trueCount:d.count || 0,
          })
        })

        var bigin = [];
        this.valueForChart.forEach(d => {
          bigin.push(d.label);
        })
        this.originStartTime = Math.min.apply(null, bigin);
        // console.log(this.originStartTime);
        // console.log(this.formatDateYMD(new Date(this.originStartTime)))

        this.originEndTime = Math.max.apply(null, bigin);

        var aa;
        this.dataYMD = [];
        this.valueForChart.forEach(d => {
          aa = this.formatDateYMD(new Date(Number(d.label)));
          this.dataYMD.push(aa)
        })


        // this.temp();
        // console.log(this.dateContent);
        // console.log(this.dataYMD);
        this.dateContent.forEach(d => {
          if (this.dataYMD.indexOf(d) < 0) {
            this.dateNoIn.push({
              label: (new Date(d)).valueOf(),
              value: 0,
              trueCount:0,
            })

          }

        })
        // console.log(this.dateNoIn);
        this.dateNoIn.forEach(d => {
          this.valueForChart.push(d);
        })
        this.ascendSort_ObjectsInArray(this.valueForChart, "label");
      }


    },
    "caseChartData": function(newVal, oldV) {
      // console.log(_newVal);
      if (newVal.length != 0) {
        let vm = this;
        var _newVal = CommonUtils.deepClone(newVal);
        this.startTimes = [];
        this.endTimes = [];

        _newVal.forEach(d => {
          this.startTimes.push(d.startTime);
          this.endTimes.push(d.endTime);
        })

        this.minStartTime = Math.min.apply(null, this.startTimes);
        this.maxEndTime = Math.max.apply(null, this.endTimes);

        this.totalActivities = _newVal.length;

        this.textContent = {};
        this.textContent = {
          '总持续时间': this.durationFormat(this.maxEndTime - this.minStartTime) || '0 second',
          '总活动数量': this.totalActivities,
          '实例开始时间': this.formatDate(new Date(this.minStartTime)),
          '实例结束时间': this.formatDate(new Date(this.maxEndTime))
        }
        var count = 0,
            counts = [];
        this.valueForChart.forEach(d => {
          counts.push(d.value);
        })
        count = Math.max.apply(null, counts);
        var sCount=0,
            eCount=0;
        vm.valueForChart.forEach(d=>{
          let compareOri=new Date(Number(d.label)).setHours(0,0,0,0);
          // console.log(d.label);
          // console.log(new Date(Number(d.label)))
          // console.log(compareOri);
          if(compareOri==new Date(Number(this.minStartTime)).setHours(0,0,0,0).valueOf()){
            sCount=d.value;
            // console.log('scount:',sCount);
          }
          if(compareOri==new Date(Number(this.maxEndTime)).setHours(0,0,0,0).valueOf()){
            eCount=d.value;
            // console.log(eCount);
          }
        })
        this.valueForCurrentCase = [{
          label: this.minStartTime,
          value: count,
          trueCount:sCount
        }, {
          label: this.maxEndTime,
          value: count,
          trueCount:eCount
        }]

        this.$refs.actDurChartContainer.innerHTML = " ";   
   
        if (newVal.length != 0&&this.valueForChart.length>1) {
           var _endLength=this.valueForChart.length-1;
           var _addOneDay={
                label:this.maxEndTime>new Date(parseInt(this.valueForChart[_endLength].label)).setHours(23, 59, 59, 999)?this.maxEndTime:new Date(parseInt(this.valueForChart[_endLength].label)).setHours(23, 59, 59, 999),
                value:this.maxEndTime>new Date(parseInt(this.valueForChart[_endLength].label)).setHours(23, 59, 59, 999)?0:this.valueForChart[_endLength].value
              };
          this.valueForChart.push(_addOneDay)
          let vm=this;
          setTimeout(function() {
            vm.renderActDurChart();
          }, 0);

        }else if(this.valueForChart.length==0){
          this.noData=true;
        }else if(this.valueForChart.length==1){
           var addOneDay={
                label:this.maxEndTime>new Date(parseInt(this.valueForChart[0].label)).setHours(23, 59, 59, 999)?this.maxEndTime:new Date(parseInt(this.valueForChart[0].label)).setHours(23, 59, 59, 999),
                value:this.valueForChart[0].value
              };
          this.valueForChart.push(addOneDay)
          this.$refs.actDurChartContainer.innerHTML = " ";
           let vm=this;
          setTimeout(function() {
            vm.renderActDurChart();
          }, 0);
        }

      }


    }
  },

  // mounted: function() {
  //   var vm = this;
  //   this.$refs.actDurChartContainer.innerHTML = " ";
  //   setTimeout(function() {
  //     vm.renderActDurChart();
  //   }, 0);

  // },

  methods: {
    ascendSort_ObjectsInArray(data, key) {
      data.sort((a, b) => {
        if (a[key] && b[key]) {
          if (/^((\d+\.?\d*)|(\d*\.\d+))\%$/.test(a[key])) {
            var A = a[key].substr(0, a[key].length - 1),
              B = b[key].substr(0, b[key].length - 1);
            return Number(A) - Number(B);
          } else if ((typeof a[key]) != "number") {
            return a[key].localeCompare(b[key]);
          } else {
            return a[key] - b[key];
          }
        } else {
          console.warn("no data for ascend sorting !")
        }

      });
    },
    windowResized() {

      this.$refs.actDurChartContainer.innerHTML = " ";
       let vm=this;
      // setTimeout(function() {
       
      vm.renderActDurChart();
      // }, 500);
    },
    temp() {
      function getDate(datestr) {
        var temp = datestr.split("-");
        var date = new Date(temp[0], temp[1]-1, temp[2]);
        return date;
      }
      var start = this.formatDateYMD(new Date(this.originStartTime));
      var end = this.formatDateYMD(new Date(this.originEndTime));
      var _startTime = getDate(start);
      var _endTime = getDate(end);
      // console.log(_startTime);
      // console.log(_endTime);
      while ((_endTime.getTime() - _startTime.getTime()) >= 0) {
        var year = _startTime.getFullYear();
        var month = (_startTime.getMonth()+1).toString().length == 1 ? "0" + (_startTime.getMonth()+1).toString() : _startTime.getMonth()+1;
        var day = _startTime.getDate().toString().length == 1 ? "0" + _startTime.getDate() : _startTime.getDate();
        var bb = year + "-" + month + "-" + day;
        this.dateContent.push(bb);
        _startTime.setDate(_startTime.getDate() + 1);
      }


    },
    formatDateYMD(now) {
      var years = this.noSingle(now.getFullYear()) || 0;
      var months = this.noSingle(now.getMonth() + 1) || 0;
      var dates = this.noSingle(now.getDate()) || 0;
      return years + "-" + months + "-" + dates
    },

    formatDate(now) {
      if (now) {
        var year = this.noSingle(now.getFullYear()) || 0;
        var month = this.noSingle(now.getMonth() + 1) || 0;
        var date = this.noSingle(now.getDate()) || 0;
        var hour = this.noSingle(now.getHours()) || 0;
        var minute = this.noSingle(now.getMinutes()) || 0;
        var second = this.noSingle(now.getSeconds()) || 0;
        return year + "-" + month + "-" + date + " " + hour + ":" + minute + ":" + second;
      }

    },
    noSingle(single) {
      if (Number(single) < 10) {
        return '0' + single;

      } else {
        return single;
      }

    },
    durationFormat(duration) {
      if (duration) {
        if (duration == -Infinity) {
          return 0;
        }

        var dRemainder = duration % 86400000,
          hRemainder = duration % 3600000,
          mRemainder = duration % 60000,

          dayCount = Math.floor(duration / 86400000),
          hourCount = Math.floor(dRemainder / 3600000),
          minuteCount = Math.floor(hRemainder / 60000),
          secondCount = Math.floor(mRemainder / 1000),

          dayStr = null,
          hourStr = null,
          minuteStr = null,
          secondStr = null,

          dayStr = this.singular_complex(dayCount, "day"),
          hourStr = this.singular_complex(hourCount, "hour"),
          minuteStr = this.singular_complex(minuteCount, "minute"),
          secondStr = this.singular_complex(secondCount, "second");

        return dayStr + " " + hourStr + " " + minuteStr + " " + secondStr;

      }
    },
    singular_complex(count, format) {
      var str = null;
      if (count < 1) {
        str = ""
      } else if (count >= 1 && count < 2) {
        str = "1 " + format
      } else if (count >= 2) {
        str = count.toFixed(0) + " " + format + "s"
      }
      return str;
    },

    renderActDurChart: function() {
      var vm = this,
        actDurChartContainer = this.$refs.actDurChartContainer,
        hContainer = d3.select(actDurChartContainer),
        actDurChart = this.actDurChart = d3BI.baseChart(),
        data = [{
          name: "Activity Duration",
          type: "line",
          area: true,
          color: "#A5A9B3",
          label: {
            x: "Date",
            y: "Case Count",
            name: "name"
          },
          values: vm.valueForChart
        }, {
          name: "Activity Duration 1",
          type: "line",
          area: true,
          color: "#BFE9F9",
          label: {
            x: "Date",
            y: "Case Count",
            name: "name"
          },
          values: vm.valueForCurrentCase

        }];


      actDurChart.xAxis.scale(d3.scaleTime()).title("Log Timeline")
        .axisVisibility(false);
      actDurChart.xAxis.axis().ticks(d3.utcDay.every(1)).tickFormat(d3.timeFormat('%m/%d/%Y'));
      actDurChart.yAxis.title("Case Count")
        .axisVisibility(false);
      actDurChart.legend.visibility(false);
      actDurChart.lineTooltip.type('line');
      actDurChart.axisLines.pattern({ x: true, y: false });
      actDurChart.tooltip.setContent(function(d) {

        var str = '',
          data_ = d.yValues[0].data,
          config = d.yValues[0].config;
          // console.log(data_);
          // console.log(config);

        // for (var k in data_) {
        //   if (data_.hasOwnProperty(k) && config.label.hasOwnProperty(k)) {
        //     str += '<tr><td class="title">' + config.label[k].toUpperCase() + '</td><td>' + data_[k] + '</td></tr>';
        //   }
        // }
        // console.log(new Date(data_.x).setHours(0,0,0,0).valueOf()+(vm.gap-1)*24*60*60*1000);
        let dateObj=new Date(data_.x).setHours(0,0,0,0).valueOf()+(vm.gap-1)*24*60*60*1000
        // console.log(DatetimeUtils.getFullDate(new Date(dateObj),'MM/dd/yyyy'))
        let bb;
        if(vm.gap>1){
          let targetDate=DatetimeUtils.getFullDate(new Date(dateObj),'MM/dd/yyyy')
        }
        
        if(new Date(data_.x).setHours(0,0,0,0).valueOf()==new Date(config.values[0].label).setHours(0,0,0,0).valueOf()){
          bb=config.values[0].trueCount;
        }
        else if(new Date(data_.x).setHours(0,0,0,0).valueOf()==new Date(config.values[1].label).setHours(0,0,0,0).valueOf()){
          bb=config.values[1].trueCount;
        }else{
          bb=data_.y
        }
        if(vm.gap>1){
          let targetDate=DatetimeUtils.getFullDate(new Date(dateObj),'MM/dd/yyyy')
           str = `<tr><td class="title">日期</td><td>${data_.x}-${targetDate}</td></tr><tr><td class="title">实例数量</td><td>${bb}</td></tr>`;
        }else{
          str += '<tr><td class="title">' + '日期' + '</td><td>' + data_.x + '</td></tr>'+
         '<tr><td class="title">' + '实例数量' + '</td><td>' + bb + '</td></tr>';
        }
         
        return '<table>' + str + '</table>';
      });
      hContainer
        .append('svg')
        .datum(data)
        .call(actDurChart);
    },


  },

  beforeDestroy: function() {
    eventHub.$off("tile-window-resized", this.windowResized);

  }

}
