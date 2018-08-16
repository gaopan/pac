import * as d3 from 'd3'
import commonUtils from '@/utils/common-utils.js';

export default {
  name: 'case-panel-table',
  props: {
    caseTableData: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      caseItemTableData: [],
      theadConfig: [
          { name: "活动", sort:"normal"},
          { name: "开始日期/时间", sort:"up"},
          { name: "结束日期/时间", sort:"normal"},
          { name: "等待时间", sort:"normal"},
          { name: "处理时间", sort:"normal"},
          { name: "总持续时间", sort:"normal"},
          { name: "用户名", sort:"normal"},
        ],
      resizeTimer:null,
      count:0     
    }
  },
  watch: {
    caseTableData: {
      handler(data) {
        this.caseItemTableData = [];
        if(data&&data.length>0){
          var waitingTime = 0,
              processingTime = 0;
          for (var i = 0; i < data.length; i++) {

            if(i > 0){
              waitingTime = data[i].startTime - data[i-1].endTime;
              waitingTime = waitingTime < 0 ? 0 : waitingTime;
            }else{
              waitingTime = 0;
            }
            // waitingTime = i > 0 ? data[i].startTime - data[i-1].endTime : 0;
            processingTime = data[i].endTime - data[i].startTime;

            this.caseItemTableData.push({
              activity: data[i].activityName,
              _startTime: data[i].startTime,
              _endTime: data[i].endTime,
              _waitingTime: waitingTime,
              _processingTime: processingTime ,
              _totalDuration: waitingTime + processingTime,
              
              startTime: this.formatDate(new Date(data[i].startTime)),
              endTime: this.formatDate(new Date(data[i].endTime)),
              waitingTime: this.durationFormat(waitingTime),
              processingTime: this.durationFormat(processingTime),
              totalDuration: this.durationFormat(waitingTime + processingTime),
              userName: data[i].userName,
              // waitingTime: waitingTime,
              // processingTime: processingTime,
              // totalDuration: waitingTime + processingTime,
            })
          }
          commonUtils.ascendSort_ObjectsInArray(this.caseItemTableData,'startTime');
        }
        this.calculateContainer();
      },
      deep:true
    }
  },
  created(){
    window.addEventListener("resize", this.reCalculateContainer,false)            
  },

  methods: {
    sortTable(index){  // sort function 

      var theadNameConfig={
         "活动":"activity",
         "开始日期/时间":"_startTime",
         "结束日期/时间":"_endTime",
         "等待时间":"_waitingTime",
         "处理时间":"_processingTime",
         "总持续时间":"_totalDuration",
         "用户名":"userName"
      }      

      var name = this.theadConfig[index]["name"],
          key=theadNameConfig[name],
          sortBy = this.theadConfig[index]["sort"],
          iconTo={
            "normal":"up",
            "up":"down",
            "down":"up",
          };

      this.theadConfig.forEach(d=>{
        d.sort="normal"
      })
      this.theadConfig[index]["sort"]=iconTo[sortBy]

      if(iconTo[sortBy]=="up"){
        commonUtils.ascendSort_ObjectsInArray(this.caseItemTableData,key)
      }else if(iconTo[sortBy]=="down"){
        commonUtils.descendSort_ObjectsInArray(this.caseItemTableData,key)
      }

    },
    calculateContainer(){  // calculate  table's height
      
      var doc=document,
          caseHeight = doc.querySelector(".case-details").clientHeight,
          chartHeight = doc.querySelector('.chart-area').clientHeight,
          tableHeightMax = caseHeight-chartHeight-100,
          tbodyElement = d3.select(".casePanelTableContainer table tbody");

      setTimeout(function(){
        if(tbodyElement.node().scrollHeight>tableHeightMax){
          tbodyElement.style("height", tableHeightMax + "px");
        }else{
          tbodyElement.style("height", "auto");
        }        
      },0)
    },
    reCalculateContainer(){
      if(this.resizeTimer){
        clearTimeout(this.resizeTimer);
      }
      this.resizeTimer=setTimeout(this.calculateContainer,400)      
    },

    formatDate(now) {
      var year = noSingle(now.getFullYear());
      var month = noSingle(now.getMonth() + 1);
      var date = noSingle(now.getDate());
      var hour = noSingle(now.getHours());
      var minute = noSingle(now.getMinutes());
      var second = noSingle(now.getSeconds());
  
      function noSingle(single) {
        return Number(single) < 10 ? '0' + single : single
      }     

      return year + "-" + month + "-" + date + " " + hour + ":" + minute + ":" + second;
    },

    durationFormat(duration) {
      var dRemainder = duration % 86400000,
        hRemainder = duration % 3600000,
        mRemainder = duration % 60000,

        dayCount =Math.floor(duration / 86400000), 
        hourCount = Math.floor(dRemainder / 3600000),
        minuteCount = Math.floor(hRemainder / 60000),
        secondCount=Math.floor(mRemainder/1000),
        dayStr = null,
        hourStr = null,
        minuteStr = null,
        secondStr = null;

      dayStr = this.singular_complex(dayCount, "天");
      hourStr = this.singular_complex(hourCount, "小时");
      minuteStr = this.singular_complex(minuteCount, "分钟");
      secondStr = this.singular_complex(secondCount, "秒");
      var timeStr = dayStr + " " + hourStr + " " + minuteStr + " " + secondStr;

      if (timeStr == "   " || timeStr == null + "   ") {
        timeStr = "0 秒";
      }
      return timeStr;
    },
    singular_complex(count, format) {
      var str = null;
      if (count < 1) {
        str = ""
      } else if (count >= 1 && count < 2) {
        str = "1 " + format
      } else if (count >= 2) {
        // str = parseInt(count) + " " + format + "s"
        str = parseInt(count) + " " + format;
      }
      return str;
    },
  },
  beforeDestroy(){
    window.removeEventListener("resize",this.reCalculateContainer,false)    
  }
}
