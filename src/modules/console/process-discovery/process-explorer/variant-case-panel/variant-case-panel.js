import * as d3 from 'd3'
import shared from "@/shared.js"
import processMiningApi from '@/api/process-mining.js'

import Pagging from '@/components/Paginator/Paginator.vue';
import casePanelTable from './case-panel-table/casePanelTable.vue'
import casePanelChart from './case-panel-chart/casePanelChart.vue'
import leapSelect from "@/components/leap-select/LEAPSelect"

import CommonGenerators from '@/utils/common-generators.js'
import CommonUtils from '@/utils/common-utils.js'

let UUIDGenerator = CommonGenerators.UUIDGenerator
let eventHub = shared.eventHub
export default {
  name: 'variantCasePanel',
  props: {
    conf: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      overallTotalCaseCount: 0,
      allActivityCount: 0,
      isAllVariantsClicked: false,
      dailyActivities: {},
      isNeedToRefreshDailyActivities: true,
      processName: null,
      processAnalyticsId: null,
      variantId: null,

      windowResizedTimer: null,
      variantPaginationTimer: null,
      casePaginationTimer: null,

      variantPageSize: 50,
      variantPageIndex: 1,
      casePageIndex: 1,
      casePageSize: 50,

      variantTotal: null,
      caseTotal: null,

      caseItem_CaseId_Duration: "",

      sortVariant: {
        currentMode: "实例数量",
        option: [{
                  name: "实例数量",
                  value:"caseCount"
                }, {
                  name: "接触点数量",
                  value:"activityCount"
                }],
      },
      sortCase: {
        currentMode: "实例ID",
        option: [{
                  name: "实例ID",
                  value:"caseId"
                },{
                  name: "持续时间",
                  value:"caseDuration"
                },{
                  name: "开始时间",
                  value:"caseStart"
                },{
                  name: "结束时间",
                  value:"caseEnd"
                }],
      },
      sortKeyAdaptObj: {
        "caseCount":"实例数量",
        "activityCount": "接触点数量",
        "caseDuration": "持续时间",
        "caseId": "实例ID",
        "caseStart":"开始时间",
        "caseEnd":"结束时间" 
      },

      showVariantPanel: false,
      showCasePanel: false,
      showTableChartPanel: false,

      caseList: [],
      variantList: [],
      caseTableChartData: [],
      originalVariantData: [],

      searchVariantIpt: null,
      searchCaseIpt: null,

      globalFilter: null,
      caseGlobalFilter: null,
      variantGlobalFilter: null,
      filterFunc: {
        bSearchingCase: false,
        caseSearchKey: "",
        variantSearchKey: "",
        caseOrderKey: "caseId",
        variantOrderKey: "caseCount",
      },

      updatePanelStyleFn: null,
      panelNode: {
        doc: null,
        thisChart: null,
        ct: null,
        panel: null
      }
    }
  },
  watch: {
    conf: {
      handler: function(newV, oldV) {
        var conf = CommonUtils.deepClone(this.$props.conf)
        this.clickTopVariants(conf);
      },
      deep: true
    }
  },
  components: {
    Pagging,
    leapSelect,
    casePanelTable,
    casePanelChart
  },
  methods: {
    clickTopVariants: function(args) {
      //init all data
      let selectedBarCount = args.selectedBarCount;
      this.processName = args.processName;
      this.processAnalyticsId = args.processAnalyticsId;
      this.globalFilter = this.caseGlobalFilter = this.variantGlobalFilter = args.globalFilter;
      // this.overallTotalCaseCount = args.totalCaseCount;

      this.variantPageIndex = 1;
      this.variantTotal = this.caseTotal = null;

      //init filter name in View
      this.sortVariant.currentMode = "实例数量";
      this.sortCase.currentMode = "实例ID";


      setTimeout(() => { this.updatePanelStyle(); }, 1);
      
      var filter = {pageIndex: 1,pageSize: 0,orderBy: ""}

      if (selectedBarCount == 10) {
        this.clickAll(filter);
      } else {
        this.clickNumber(args, filter);
      }
    },

    clickAll(filter) {
      //init filter value in Model
      Object.assign(this.filterFunc, {
        bSearchingCase: false,
        caseSearchKey: "",
        caseOrderKey: "caseId",
        variantSearchKey: "",
        variantOrderKey: "caseCount",
      })

      this.searchVariantIpt = this.searchCaseIpt = null;

      this.variantId = null; //variantID is 0 because clicking all

      //without variant when click all
      let _filter = Object.assign({}, filter, { pageSize: this.variantPageSize, orderBy: this.filterFunc.variantOrderKey })
      this.getRankedVariantsOrderBy(this.processAnalyticsId, _filter, this.variantGlobalFilter)
    },

    clickNumber(args, filter) {
      //init filter value in Model
      Object.assign(this.filterFunc, { bSearchingCase: false, caseSearchKey: null, caseOrderKey: "caseId", })
      this.searchCaseIpt = null;
      this.showVariantPanel = false;

      this.variantId = args.variantId;

      //with variant when click number
      let _filter = Object.assign({}, filter, { variantId: this.variantId, pageSize: this.casePageSize, orderBy: this.filterFunc.caseOrderKey })
      this.getCaseListData(this.processAnalyticsId, _filter, this.caseGlobalFilter)

      this.isNeedToRefreshDailyActivities = true;
    },

    searchItem(value, type) {
      if (type === "variant") {
        this.searchByVariant(value);
      } else if (type === "case") {
        this.isNeedToRefreshDailyActivities = true;
        this.searchByCase(value);
      }
    },

    searchByVariant(value) {
      let _filter = { pageIndex: this.variantPageIndex = 1, pageSize: this.variantPageSize, orderBy: this.filterFunc.variantOrderKey };
      this.variantTotal = null;
      this.sortCase.currentMode = "实例ID";

      if (value == "") {
        this.filterFunc.variantSearchKey = value;
        this.getRankedVariantsOrderBy(this.processAnalyticsId, _filter, this.variantGlobalFilter)
      } else {
        _filter.variantId = value;
        this.filterFunc.variantSearchKey = value;
        this.searchVariant(this.processAnalyticsId, _filter, this.variantGlobalFilter);
      }
    },

    searchByCase(value) {
      var _filter = this.variantIdOrNot(this.variantId, this.casePageSize, 1, this.filterFunc.caseOrderKey);

      this.caseTotal = null;

      if (this.filterFunc.caseOrderKey == 'caseDuration') {
        _filter.sort = 'DESC';
      }

      if (value == "") {
        this.filterFunc.bSearchingCase = false;
        this.filterFunc.caseSearchKey = '';
        this.getCaseListData(this.processAnalyticsId, _filter, this.caseGlobalFilter)
      } else {
        this.filterFunc.caseSearchKey = value;
        _filter.caseId = value;
        this.getCaseSearch(this.processAnalyticsId, _filter, this.caseGlobalFilter)
      }
    },

    sortVariantList(args) {
      //14 Feb 2018: adib.ghazali@hpe.com - refactor LEAP Select for emit data
      let value = args.value;

      this.variantTotal = null; //init paginator
      
      this.sortVariant.currentMode = value;
      
      this.isAllVariantsClicked = false;

      this.filterFunc.variantOrderKey = value;
      // this.filterFunc.variantOrderKey = this.sortKeyAdaptObj[value];
      let _filter = { pageIndex: this.variantPageIndex = 1, pageSize: this.variantPageSize, orderBy: value };
      if (this.filterFunc.variantSearchKey && this.filterFunc.variantSearchKey.length > 0) {
        _filter.variantId = this.filterFunc.variantSearchKey;
        this.searchVariant(this.processAnalyticsId, _filter, this.variantGlobalFilter);
      } else {
        this.getRankedVariantsOrderBy(this.processAnalyticsId, _filter, this.variantGlobalFilter);
      }
    },

    sortCaseList(args) {
      //14 Feb 2018: adib.ghazali@hpe.com - refactor LEAP Select for emit data
      let value = args.value;

      this.caseTotal = null; //init paginator
      this.filterFunc.caseOrderKey = value;
      // this.filterFunc.caseOrderKey = this.sortKeyAdaptObj[value];
      this.sortCase.currentMode = value;
      this.isNeedToRefreshDailyActivities = true;

      var filter = this.variantIdOrNot(this.variantId, this.casePageSize, 1, value);

      if (this.filterFunc.caseOrderKey == 'caseDuration') {
        filter.sort = 'DESC';
      }
      if (!this.filterFunc.bSearchingCase) {
        this.getCaseListData(this.processAnalyticsId, filter, this.globalFilter);
      } else {
        filter.caseId = this.filterFunc.caseSearchKey;
        this.getCaseSearch(this.processAnalyticsId, filter, this.caseGlobalFilter)
      }
    },

    caseItemClicked(index) {
      this.getCasesDetailData(this.processAnalyticsId, this.caseList[index], this.globalFilter);
      this.caseItem_CaseId_Duration = `${this.caseList[index].caseIdDisplayed} ( ${this.caseList[index].durationDisplay} )`;
      this.caseList.forEach(d => { d.show = false; })
      this.caseList[index].show = true;
    },

    variantItemClicked(index) {
      this.searchCaseIpt = null;
      this.isAllVariantsClicked = false;
      this.sortCase.currentMode = "实例ID";

      Object.assign(this.filterFunc, { bSearchingCase: false, caseSearchKey: null, caseOrderKey: "caseId", })

      this.variantId = this.variantList[index].variantId;
      this.variantList.forEach(d => { d.show = false; })
      this.variantList[index].show = true;

      let _filter = { pageIndex: 1, pageSize: this.casePageSize, variantId: this.variantId, orderBy: this.filterFunc.caseOrderKey };
      this.getCaseListData(this.processAnalyticsId, _filter, this.globalFilter)
      this.isNeedToRefreshDailyActivities = true;
    },

    allVariantsItemClicked() {
      this.searchCaseIpt = null;
      this.isAllVariantsClicked = true;
      this.caseTotal = null;
      this.sortCase.currentMode = "实例ID";

      Object.assign(this.filterFunc, { bSearchingCase: false, caseSearchKey: null, caseOrderKey: "caseId", })
      this.variantId = null;
      this.variantList.forEach(d => { d.show = false; })

      let _filter = { pageIndex: 1, pageSize: this.casePageSize, orderBy: this.filterFunc.caseOrderKey };
      this.getCaseListData(this.processAnalyticsId, _filter, this.globalFilter)
      this.isNeedToRefreshDailyActivities = true;
    },

    variantPageHandler(pageIndex) {
      this.isAllVariantsClicked = false;
      this.sortCase.currentMode = "实例ID";

      if (this.variantPaginationTimer) clearTimeout(this.variantPaginationTimer);

      this.variantPaginationTimer = setTimeout(() => {
        let _filter = {
          pageIndex: this.variantPageIndex = pageIndex,
          pageSize: this.variantPageSize,
          orderBy: this.filterFunc.variantOrderKey
        };
        if (this.filterFunc.variantSearchKey && this.filterFunc.variantSearchKey.length > 0) {
          _filter.variantId = this.filterFunc.variantSearchKey;
          this.searchVariant(this.processAnalyticsId, _filter, this.variantGlobalFilter);
        } else {
          this.getRankedVariantsOrderBy(this.processAnalyticsId, _filter, this.variantGlobalFilter);
        }
      }, 300)
    },

    casePageHandler(pageIndex) {
      this.casePageIndex = pageIndex;
      this.isNeedToRefreshDailyActivities = true;      
      if (this.casePaginationTimer) clearTimeout(this.casePaginationTimer)
      this.casePaginationTimer = setTimeout(() => {

        let _filter = this.variantIdOrNot(this.variantId, this.casePageSize, pageIndex, this.filterFunc.caseOrderKey);
        if (this.filterFunc.caseOrderKey == 'caseDuration') {
          _filter.sort = 'DESC';
        }
        if (this.filterFunc.bSearchingCase) {
          _filter.caseId = this.filterFunc.caseSearchKey;
          this.getCaseSearch(this.processAnalyticsId, _filter, this.caseGlobalFilter);
        } else {
          this.getCaseListData(this.processAnalyticsId, _filter, this.globalFilter)
        }
      }, 300)
    },
    getCaseListData(processAnalyticsId, filters, globalFilter) {
      //initInfoByCase
      this.showCasePanel = true;
      this.showTableChartPanel = false;
      this.caseList = [];

      // var caseDetailsWidthPercent = this.showVariantPanel ? "70%" : "85%";
      // this.setPanelWidth(".button-area", caseDetailsWidthPercent)

      eventHub.$emit("start-mini-loader", { id: this.loadId });

      processMiningApi.getVariantCases(this.$store.getters.processSelection.customerId, processAnalyticsId, filters, globalFilter).then(res => {

        eventHub.$emit("finish-mini-loader", { id: this.loadId });
        this.caseList = this.makeCaseListData(res.data.listCases);
        this.caseTotal = Number(res.data.total);

      }, err => {
        eventHub.$emit("finish-mini-loader", { id: this.loadId });
      })
    },
    getCasesDetailData(processAnalyticsId, caseData, globalFilter) {
      //this.initInfoByCaseDetail
      this.showTableChartPanel = true;
      this.caseTableChartData = [];
      this.caseItem_CaseId_Duration = "";

      // var caseDetailsWidthPercent = this.showVariantPanel ? "70%" : "85%";
      // this.setPanelWidth(".case-detail-table-area", caseDetailsWidthPercent)

      eventHub.$emit("start-mini-loader", { id: this.loadId });

      let promises = [],
          oldDailyActivities = this.dailyActivities,
          dailyActivities = null,
          caseTableChartData = null;
        // console.log(this.isNeedToRefreshDailyActivities)
      if (this.isNeedToRefreshDailyActivities) {
        let dailyCasesPromise = new Promise((resolve, reject) => {
          processMiningApi.getDailyCases(this.$store.getters.processSelection.customerId, processAnalyticsId, { variantId: this.variantId }, globalFilter).then(res => {
            // var data = {};
            // console.log(res);
            // data.gap=res.data.gap;
            // res.data.list.forEach(d => {
            //   if (d.date) {
            //     data.list[d.date] = d.count;
            //   } else {
            //     // data[d._id] = d.casesCount;
            //   }
            // });
            dailyActivities = res.data;
            // console.log(dailyActivities)
            resolve(res);
          }, err => {
            reject(err);
          });
        });
        promises.push(dailyCasesPromise);
      }

      let caseDetailPromise = new Promise((resolve, reject) => {
        processMiningApi.getCaseDetail(this.$store.getters.processSelection.customerId, processAnalyticsId, {
          caseId: caseData.caseId
        }).then(res => {
          let caseDetailData = [];
          res.data.value.activities.forEach(act => {
            caseDetailData.push({
              activityName: act.activityName,
              caseId: res.data.value.caseId,
              discrepancy: act.discrepancy,
              endTime: act.activityEnd,
              id: act.activityId,
              startTime: act.activityStart,
              userName: act.userName
            });
          });
          caseTableChartData = caseDetailData;
          resolve(res);
        }, err => {
          reject(err);
        });
      });
      promises.push(caseDetailPromise);

      Promise.all(promises).then(res => {
        eventHub.$emit("finish-mini-loader", { id: this.loadId });
        // this.dailyActivities = dailyActivities;
        if(this.isNeedToRefreshDailyActivities){
          this.isNeedToRefreshDailyActivities=false;
          this.dailyActivities =dailyActivities;
        }else{
          this.dailyActivities = oldDailyActivities;
        }

        this.caseTableChartData = caseTableChartData;

      }, err => {
        eventHub.$emit("finish-mini-loader", { id: this.loadId });
      });
    },
    searchVariant(processAnalyticsId, filters, globalFilter) {
      this.showVariantPanel = true;
      this.showCasePanel = false;
      this.showTableChartPanel = false;
      this.variantList = [];

      this.variantTotal = this.caseTotal = null;
      this.isAllVariantsClicked = false;
      // this.setPanelWidth(".button-area", "85%")
      eventHub.$emit("start-mini-loader", { id: this.loadId });
      processMiningApi.searchVariant(this.$store.getters.processSelection.customerId, processAnalyticsId, filters, globalFilter).then(res => {

        eventHub.$emit("finish-mini-loader", { id: this.loadId });
        this.variantTotal = Number(res.data.total);
        this.variantList = this.makeVariantListData(res.data.listVariants);

      }, err => {
        eventHub.$emit("finish-mini-loader", { id: this.loadId });
      })
    },
    getCaseSearch(processAnalyticsId, filters, globalFilter) {
      this.filterFunc.bSearchingCase = true;
      eventHub.$emit("start-mini-loader", { id: this.loadId });

      //init Info By Case;
      this.showCasePanel = true;
      this.showTableChartPanel = false;
      this.caseList = [];

      // var caseDetailsWidthPercent = this.showVariantPanel ? "70%" : "85%";
      // this.setPanelWidth(".button-area", caseDetailsWidthPercent)

      processMiningApi.getCaseSearch(this.$store.getters.processSelection.customerId, this.processAnalyticsId, filters, globalFilter).then(res => {
        eventHub.$emit("finish-mini-loader", { id: this.loadId });
        var data = res.data;
        this.caseList = this.makeCaseListData(data.listCases);
        this.caseTotal = data.total;

      }, err => {
        eventHub.$emit("finish-mini-loader", { id: this.loadId });
      })
    },

    getRankedVariantsOrderBy(processAnalyticsId, filters, globalFilter) {

      //initInfoByVariant
      this.showVariantPanel = true;
      this.showCasePanel = false;
      this.showTableChartPanel = false;
      this.variantList = [];
      // this.setPanelWidth(".button-area", "85%")


      eventHub.$emit("start-mini-loader", { id: this.loadId });
      processMiningApi.getRankedVariantsOrderBy(this.$store.getters.processSelection.customerId, processAnalyticsId, filters, globalFilter).then(res => {
        eventHub.$emit("finish-mini-loader", { id: this.loadId });
        
        this.overallTotalCaseCount = res.data.caseCount;

        this.allActivityCount = this.variantTotal = Number(res.data.total);
        
        this.variantList = this.makeVariantListData(res.data.listVariants);
      }, err => {
        eventHub.$emit("finish-mini-loader", { id: this.loadId });
      })
    },

    makeCaseListData(data) {
      var result = [];
      data.forEach((d, i) => {
        result.push({});
        result[i].caseId = d.caseId;
        result[i].caseIdDisplayed = /*"Case " + */ d.caseId;
        result[i].durationDisplay = this.makeTimeStr(d.duration);

        result[i].startTime = timeTrans(d.start);
        result[i].endTime = timeTrans(d.end);
        result[i].show = false;
        result[i].variantId = d.trace;

      })

      function timeTrans(date) {
        var date = new Date(date),
          Y = date.getFullYear() + '-',
          M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-',
          D = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate()) + ' ',
          h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':',
          m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':',
          s = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());
        return Y + M + D + h + m + s;
      }

      return result;
    },

    makeVariantListData(data) {
      var result = [];
      data.forEach((d, i) => {
        result.push({})
        result[i].variantId = d.variantId;
        result[i].variantDisplay = d.trace;

        result[i].count = d.caseCount||d.count;
        result[i].activityCount = d.activityCount||d.activitycount;

        result[i].casePercentage = d.percentage.toFixed(2);
        result[i].show = false;
      })
      return result;
    },

    throttle(fn, delay, mustRunDelay) {
      var timer = null,
        t_start;

      return function() {
        var context = this,
          args = arguments,
          t_curr = +new Date();

        clearTimeout(timer);

        if (!t_start) {
          t_start = t_curr;
        }

        if (t_curr - t_start >= mustRunDelay) {
          fn.apply(context, args);
          t_start = t_curr;
        } else {
          timer = setTimeout(function() {
            fn.apply(context, args);
          }, delay);
        }
      };
    },

    updatePanelStyle: function() {
      
    },

    windowResized: function(args) {
      this.updatePanelStyleFn()
      // console.log("resize")
    },

    backToInitial: function() {
      this.caseList = this.variantList = this.caseTableChartData = [];
      this.variantTotal = this.caseTotal = null;
      eventHub.$emit("toggle-variantCase-panel", { showPanel: false });
    },

    closePanel: function(args) {
      this.caseList = this.variantList = this.caseTableChartData = [];
      this.variantTotal = this.caseTotal = null;

      this.showVariantPanel = this.showCasePanel = this.showTableChartPanel = false;
      eventHub.$emit("toggle-variantCase-panel", { showPanel: false });
    },
    
    // setPanelWidth(ele, width) {
    //   setTimeout(() => {
    //     d3.select(ele).style("width", width)
    //   }, 0)
    // },

    makeTimeStr(data) {
      if (data !== 0) {
        var result = [];
        var dRemainder = data % 86400,
          hRemainder = data % 3600,
          mRemainder = data % 60,
          sRemainder = data,

          dayCount = data / 86400,
          hourCount = dRemainder / 3600,
          minuteCount = hRemainder / 60,
          secondCount = mRemainder,
          dayStr = null,
          hourStr = null,
          minuteStr = null,
          secondStr = null;

        dayStr = singular_complex(dayCount, "天");
        hourStr = singular_complex(hourCount, "小时");
        minuteStr = singular_complex(minuteCount, "分钟");
        secondStr = singular_complex(secondCount, "秒");

        function singular_complex(count, format) {
          var str = null;
          if (count < 1) {
            str = ""
          } else if (count === 1) {
            str = "1 " + format
          } else if (count > 1) {
            // str = parseInt(count) + " " + format + "s"
            str = parseInt(count) + " " + format;
          }
          return str;
        }

        [dayStr, hourStr, minuteStr, secondStr].forEach(d => {
          if (d != "") {
            result.push(d);
          }
        })

        return result.join(",");

      } else {
        return "0 second"
      }
    },

    variantIdOrNot(id, pageSize, pageIndex, orderBy) {
      var _filter = null;
      //
      if (id !== null) {
        _filter = {
          variantId: id,
          pageIndex: pageIndex,
          pageSize: pageSize,
          orderBy: orderBy
        }
      } else {
        _filter = {
          pageIndex: pageIndex,
          pageSize: pageSize,
          orderBy: orderBy
        }
      }

      return _filter;
    }

  },
  created: function() {
    var conf = CommonUtils.deepClone(this.$props.conf)
    this.clickTopVariants(conf);
    this.updatePanelStyleFn = this.throttle(this.updatePanelStyle, 50, 100)
    this.loadId = CommonGenerators.UUIDGenerator.purchase();

    eventHub.$on("tile-window-resized", this.windowResized);
    // if(window.addEventListener){
    //   window.addEventListener('resize', this.windowResized);
    // }else{
    //   window.attachEvent('resize', this.windowResized);
    // }

    eventHub.$on("changed-process-variant", this.backToInitial);
  },
  mounted: function() {
    this.updatePanelStyle();
  },

  beforeDestroy() {

    eventHub.$off("tile-window-resized", this.windowResized);
    eventHub.$off("changed-process-variant", this.backToInitial);
  }
}
