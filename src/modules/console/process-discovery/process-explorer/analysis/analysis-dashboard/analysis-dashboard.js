import TilePanelMixins from '@/components/tile/tile-panel-mixins.js'
import TileConfigurer from '@/components/tile/tile-configurer.js'
import CommonGenerators from '@/utils/common-generators.js'
import _ from 'underscore'
import shared from '@/shared.js'
import ProcessMiningApi from '@/api/process-mining.js'
import ProcessAnalyticsApi from '@/api/process-analytics.js'
import DFUtils from '../../dynamic-filter/dynamic-filter-utils.js'
import DfServices from "../../dynamic-filter/dynamic-filter-services.js"
import CommonUtils from '@/utils/common-utils.js'
import DatetimeUtils from '@/utils/datetime-utils.js'
import TypeChecker from '@/utils/type-checker.js'

import DataGenerator from '@/modules/console/process-discovery/dashboard-setup/dashboard-setup-data-generator.js'
import DashboardSetup from '@/modules/console/process-discovery/dashboard-setup/DashboardSetup.vue'
import BoxChart from '@/modules/console/process-discovery/process-explorer/analysis/analysis-dashboard/box-chart/BoxChart.vue'
import CaseDistributionTrendMixins from '@/modules/console/process-discovery/dashboard-setup/template/case-distribution-trend/case-distribution-trend.mixins.js'
import ValueComparisonMixins from '@/modules/console/process-discovery/dashboard-setup/template/value-comparison/value-comparison.mixins.js'
import AggregationMixins from '@/modules/console/process-discovery/dashboard-setup/template/aggregation/aggregation.mixins.js'
import CaseValueRankingMixins from '@/modules/console/process-discovery/dashboard-setup/template/case-value-ranking/case-value-ranking.mixins.js'

import OnboardingApi from '@/api/onboarding.js'
import tabsGenerator from '../../../dashboard-setup/template/common.js'


let eventHub = shared.eventHub

let UUIDGenerator = CommonGenerators.UUIDGenerator

let CaseDistributionTrend = { mixins: [CaseDistributionTrendMixins] },
  ValueComparison = { mixins: [ValueComparisonMixins] },
  Aggregation = { mixins: [AggregationMixins] },
  CaseValueRanking = { mixins: [CaseValueRankingMixins] };

let TilePanel = {
  mixins: [TilePanelMixins],
  components: {
    BoxChart,
    CaseDistributionTrend,
    ValueComparison,
    Aggregation,
    CaseValueRanking
  }
}

export default {
  name: 'analysis-dashboard',
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
      tilePanelId: UUIDGenerator.purchase(),
      innerDataFilters: {
        variant: {},
        dashboard: null
      },
      dataFilters: {
        processName: null,
        globalFilters: null
      },
      viewFilters: {},
      // disabledFilter: false,
      loadId: UUIDGenerator.purchase(),
      loadIds: { 

      },
      caseDistributionTrendConf: {
        channelId: UUIDGenerator.purchase(),
        tileBundle: null,
        configKey: 'caseDistributionTrendBy',
        dataKey: 'caseDistributionTrendBy'
      },
      aggregationConf: {
        channelId: UUIDGenerator.purchase(),
        tileBundle: null,
        configKey: 'valueGroupBy',
        dataKey: 'aggregations'
      },
      valueComparisonConf: {
        channelId: UUIDGenerator.purchase(),
        tileBundle: null,
        configKey: 'valueComparisonBy',
        dataKey: 'valueComparisonBy'
      },
      valueRankingConf: {
        chartChannelId: UUIDGenerator.purchase(),
        tableChannelId: UUIDGenerator.purchase(),
        tileBundle: null,
        configKey: 'valueRankingBy',

        dataKey: 'valueRankingBy',
        chartDataKey: 'valueRankingBy_top10',
        tableDataKey: 'valueRankingBy'
      },
      dataReactorForDashboard: null,
      dataReactorForSetup: null,
      dashboardTiles: [],
      fnCancelFunc: null,
      viewStatus: "",
      bEditing: false, //swtich editing view and displaying view
      bHideView: false,
      personalizedEdited: false, //create dashboard only once
      showConfigButton: false,
      bUserLevelConfig: false,
      dashboardConfig: {
        user: null,
        process: null,
        current: null,
      },
      setupParams: {},
      updateLastViewType: null,
      analysisOverviewData: null,
      bEnableSystemButton: false

    }
  },
  watch: {
    dataFilters: {
      handler(val) {
        this.changedDataFilters();
        //filters for set up
        this.setupParams.filters = this.dataFilters.filters;
      }
    },
    "dashboardConfig.current": {
      handler(newV, oldV) {
        if (newV && TypeChecker.isObject(newV)) {
          let chartsConfigInstances = [this.caseDistributionTrendConf, this.valueRankingConf, this.valueComparisonConf, this.aggregationConf]
          let groups;
          chartsConfigInstances.forEach(instance => {
            instance.tileBundle.chartConfig.data = instance.dataKey == "valueRankingBy" ? { chart: null, table: null } : null;
            if (instance.dataKey == "aggregations") {
              groups = CommonUtils.deepClone(newV[this.aggregationConf.configKey]||[]);
              groups.forEach(g=>{
                g.byLabel = g.by.label
                g.groupByLabel = g.groupBy.label
              })         
              instance.tileBundle.chartConfig.groups = CommonUtils.multistageSort(groups,"asc",["aggregate","byLabel","groupByLabel"]);
            } else {
              groups = CommonUtils.deepClone(newV[instance.dataKey]||[]);
              CommonUtils.ascendSort_ObjectsInArray(groups,"label");
              instance.tileBundle.chartConfig.groups = groups;
            }
          })
        }
      },
      deep: true
    }
  },
  beforeCreate: function() {
    this.$options.components.TilePanel = TilePanel;
  },
  created() {
    eventHub.$on("tile-window-resized", this.windowResized);
    eventHub.$on("changed-analysis-filter", this.onChangedAnalysisFilter);
    eventHub.$on("changed-global-filters", this.onChangedGlobalFilters);
    eventHub.$on("changed-process-variant", this.onChangedVariant);
    eventHub.$on("cancel-load-data-in-tile", this.cancelLoadData);
    eventHub.$on("cancel-loaing-from-mini-loader", this.cancelLoadFromMiniLoader);

    DataGenerator.init();
    this.dataReactorForSetup = DataGenerator.generate();
    this.dataReactorForDashboard = DataGenerator.generate();
    //config tiles
    this.configTiles();

    // function for throttle when user switch buttons
    let vm = this,
      processSelection = this.$store.getters.processSelection,
      latestConfigPromise = null;

    this.updateLastViewType = _.debounce(function() {

      let dashboardType = this.viewStatus,
        customerId = vm.$store.getters.processSelection.customerId,
        processId = vm.$store.getters.processSelection.processAnalyticsId;

      OnboardingApi.updateDashboardConfigType(customerId, processId, dashboardType).then(res => {
        //update the lastest configuration type selected
      }, err => {
        ErrorHandler.handleApiRequestError(err);
      })

    }, 400);

    this.reactDataForDashboard = _.debounce(function() {
      vm.dataReactorForDashboard.react();
    }, 400);

    this.fetchAnalysisData = _.debounce(function() {
      if (vm.dataFilters.processName && TypeChecker.isNumber(vm.innerDataFilters.variant.order)) {
        //Azhaziq - 08-12-2017: To cater C2
        DFUtils.formatDataFiltersForRequest(vm.dataFilters).then(data => {
          var body = data;
          var id = vm.loadId;
          // vm.disabledFilter = true;
          let params = this.setupParams = {
            customerId: vm.$store.getters.processSelection.customerId,
            processId: vm.$store.getters.processSelection.processAnalyticsId,
            processAnalyticsId: vm.$store.getters.processSelection.processAnalyticsId,
            filters: body.filter,
            rank: vm.innerDataFilters.variant.order == 10 ? null : vm.innerDataFilters.variant.order
          };

          vm.dataReactorForDashboard.params(params);
          vm.dataReactorForSetup.params(params);

          //valueRanking chart repointer by "reintit",assign false to it when globalfilter changed
          vm.valueRankingConf.tileBundle.chartConfig.reinit = false;

          ProcessMiningApi.analysisOverview(params.customerId, params.processAnalyticsId, {
            filter: params.filters
          }, params.rank).then(res => {
            vm.analysisOverviewData = res.data;
            if (latestConfigPromise) {
              latestConfigPromise.then(() => {
                vm.boxChartConf.chartConfig.data = vm.analysisOverviewData;
                vm.valueRankingConf.tileBundle.chartConfig.totalCaseCount = vm.analysisOverviewData.totalCaseCount;
                vm.reactDataForDashboard();
              });
            } else {
              vm.boxChartConf.chartConfig.data = vm.analysisOverviewData;
              vm.valueRankingConf.tileBundle.chartConfig.totalCaseCount = vm.analysisOverviewData.totalCaseCount;
              vm.reactDataForDashboard();
            }

          }, err => {
            ErrorHandler.handleApiRequestError(err);
          });
        })
      }
    }, 1000);

    latestConfigPromise = new Promise((resolve, reject) => {
      OnboardingApi.getLatestDashboardConfig(processSelection.customerId, processSelection.id).then(res => {
        //get the lastest configuration type selected
        this.viewStatus = res.data.dashboardType;

        let level, otherLevel, levelAPI;

        if (this.viewStatus == "PROCESS") {
          levelAPI = "getPersonalLevelConfig";
          level = "process";
          otherLevel = "user";
        } else {
          levelAPI = "getSystemLevelConfig";
          otherLevel = "process";
          level = "user";
        }
        this.dashboardConfig.current = this.dashboardConfig[level] = this.generateConfig(res.data);

        OnboardingApi[levelAPI](processSelection.customerId, processSelection.id).then(res => {
          
          this.dashboardConfig[otherLevel] = this.generateConfig(res.data.dashboardConfiguration);          

        }, err => {
          ErrorHandler.handleApiRequestError(err);
        })

        resolve();
        setTimeout(function() {
          latestConfigPromise = null;
        }, 0);
      }, err => {
        ErrorHandler.handleApiRequestError(err);
        reject();
      });
    });

    //display the button of create new config or edit personalized;
    OnboardingApi.getAvailableLevelConfig(processSelection.customerId, processSelection.id).then(res => {
      this.showConfigButton = true;
      this.bUserLevelConfig = res.data.includes("USER");

      this.bEnableSystemButton = res.data.includes("PROCESS");      

    }, err => {
      ErrorHandler.handleApiRequestError(err);
    });

  },
  methods: {
    toggleView(type) {

      if (type == "System") {
        if (!this.bEnableSystemButton) return;
        if (this.viewStatus == "PROCESS") return;

        this.viewStatus = "PROCESS";
        this.dashboardConfig.current = this.dashboardConfig.process;
      } else if (type == "Personalized") {
        if (this.viewStatus == "USER") return;

        this.viewStatus = "USER";
        this.dashboardConfig.current = this.dashboardConfig.user;
      }
      this.updateLastViewType();
    },

    openDashboardSetup() {
      if (this.viewStatus == "USER" || !this.bUserLevelConfig) {

        let vm = this;
        eventHub.$emit("out-full-screen-tile", {
          id: this.$props.tileId
        });
        vm.bHideView = true;
        setTimeout(function() {
          vm.bEditing = true;
        }, 500);
      }
    },
    closeDashboardSetup() {
      //get availableLevelConfig again to check if user save the new config at the first time to config personlized
      let customerId = this.$store.getters.processSelection.customerId,
        processId = this.$store.getters.processSelection.processAnalyticsId;

      OnboardingApi.getAvailableLevelConfig(customerId, processId).then(res => {
        this.bUserLevelConfig = res.data.includes("USER");
        this.bEditing = false;
        this.bHideView = false;

        eventHub.$emit("out-exit-full-screen-tile", {
          id: this.$props.tileId
        });

        if(this.bUserLevelConfig){
          this.viewStatus = "USER"
          OnboardingApi.getPersonalLevelConfig(customerId, processId).then(res => {
            this.dashboardConfig.current = this.dashboardConfig.user = this.generateConfig(res.data.dashboardConfiguration);
          }, err => {
            ErrorHandler.handleApiRequestError(err);
          })
        }

      }, err => {
        ErrorHandler.handleApiRequestError(err);
      });
    },
    notifyGlobalFilter: function(filterChanges) {
      // Format of filterChanges
      // {
      //   documentType: [],
      //   companyCode: [],
      //   channel: [],
      //   invoiceType: [],
      //   vendor: []
      // }
      var objKey = Object.keys(filterChanges),
          filterKey = objKey[0];

      var dtModel = DFUtils.getDataModel(filterKey);

      if (dtModel.filterType != 'attribute') {

        if (TypeChecker.isObject(filterChanges[filterKey])) {

          //Filter is object
          if (filterKey == "dateRange") {

            //Temporary solution
            dtModel.filterType = 'date_range';
            dtModel.value.startDate = filterChanges[filterKey].startDate;
            dtModel.value.endDate = filterChanges[filterKey].endDate;
            dtModel.value.way = filterChanges[filterKey].way;
          }

        } else if (TypeChecker.isArray(filterChanges[filterKey])) {

          dtModel.value.include = filterChanges[filterKey].slice();
        } else {

          dtModel.value = filterChanges[filterKey];
        }

      } else {

        //7 Dec 2017: adib.ghazali@hpe.com - setActiveAttribute when clicked any chart
        DfServices.saveActiveAttribute(filterKey);

        var attrDtModel = null;

        //19th April 2018 - muhammad-azhaziq.bin-mohd-azlan-goh@dxc.com - Defect 5179 - check if there is startDate and endDate key, if have get daterange data model
        if(filterChanges[filterKey].hasOwnProperty('start') || filterChanges[filterKey].hasOwnProperty('end')){
          attrDtModel = DFUtils.getAttrDataModel('daterange', filterKey);
        } else {
          attrDtModel = DFUtils.getAttrDataModel('string', filterKey);
        }

        if (TypeChecker.isObject(filterChanges[filterKey])) {

          attrDtModel.value = Object.assign({}, filterChanges[filterKey]);

          if(attrDtModel.fieldType == "daterange"){
            attrDtModel.fieldType = "date";

            //20th April 2018 - muhammad-azhaziq.bin-mohd-azlan-goh@dxc.com - Defect 5179 - for analysis dashboard it is always start <= date < end 
            attrDtModel.value.inclusive = {
              start: true,
              end: false
            }
          }

        } else if (TypeChecker.isArray(filterChanges[filterKey])) {

          attrDtModel.value.include = filterChanges[filterKey].slice();
        } else {

          attrDtModel.value = filterChanges[filterKey];
        }

        dtModel.value.push(attrDtModel);
      }

      this.disabledFilter = true;
      eventHub.$emit('apply-global-filters', {
        src: 'analysis',
        dataFilters: dtModel
      });
    },
    configTiles: function(config) {
      var vm = this;

      if (!this.boxChartConf) {
        this.boxChartConf = TileConfigurer.defaultConfigurer()
          .type('BoxChart').title('')
          .width({ xs: 12 })
          .height({ xs: 2 })
          .transform({ xs: { x: 0, y: 0 } })
          .hideHeader(true)
          .chart({ data: null }).react();
        this.$data.dashboardTiles.push(this.boxChartConf);
      }

      if (!this.caseDistributionTrendConf.tileBundle) {
        this.caseDistributionTrendConf.tileBundle = TileConfigurer.defaultConfigurer()
          .type('CaseDistributionTrend').title('')
          .width({ xs: 6 })
          .height({ xs: 5 })
          .transform({ xs: { x: 0, y: 2 } })
          .hideHeader(true)
          .chart({
            data: null,
            groups: [],
            opts: {
              onClickItem: function(_data) {
                // if (vm.disabledFilter) return;
                
                //19th April 2018 - muhammad-azhaziq.bin-mohd-azlan-goh@dxc.com - Defect 5179
                var filterChanges = {};

                if(_data.way){
                  filterChanges["dateRange"] = _data;
                } else {
                  filterChanges[_data.field] = {
                    start: _data.startDate,
                    end: _data.endDate
                  };
                }

                vm.notifyGlobalFilter(filterChanges)
              }
            },
            notifyInjectData: function(args) {
              if (TypeChecker.isFunction(vm.dataReactorForDashboard[args.type])) {
                vm.dataReactorForDashboard[args.type]({
                  id: vm.caseDistributionTrendConf.channelId,
                  key: vm.caseDistributionTrendConf.dataKey,
                  pipes: [{ method: "COUNT", dataField: args.data.field }],
                  pageSize: args.data.pageSize,
                  pageIndex: args.data.pageIndex,
                  obtain: function(data) {
                    vm.caseDistributionTrendConf.tileBundle.chartConfig.data = data;
                  },
                  error: function(data) {
                    vm.caseDistributionTrendConf.tileBundle.chartConfig.data = null;
                  }
                });
                if (args.type == 'shunt') {
                  vm.reactDataForDashboard();
                }
              }
            },
          })
          .react();
        this.dashboardTiles.push(this.caseDistributionTrendConf.tileBundle);
      }

      if (!this.valueComparisonConf.tileBundle) {
        this.valueComparisonConf.tileBundle = TileConfigurer.defaultConfigurer()
          .type('ValueComparison').title('')
          .width({ xs: 6 })
          .height({ xs: 5 })
          .transform({ xs: { x: 6, y: 2 } })
          .hideHeader(true)
          .chart({
            data: null,
            groups: [],
            notifyInjectData: function(args) {

              if (TypeChecker.isFunction(vm.dataReactorForDashboard[args.type])) {
                vm.dataReactorForDashboard[args.type]({
                  id: vm.valueComparisonConf.channelId,
                  key: vm.valueComparisonConf.dataKey,
                  pageSize: args.data.pageSize,
                  pageIndex: args.data.pageIndex,
                  // sortBy: 'DESC',
                  sortBy: 'ASC',
                  pipes: [{ method: 'COUNT', dataField: args.data.field }, { method: 'AVERAGE', dataField: args.data.field }],
                  obtain: function(data) {
                    vm.valueComparisonConf.tileBundle.chartConfig.data = data;
                  },
                  error: function(err) {
                    vm.valueComparisonConf.tileBundle.chartConfig.data = null;
                  }
                });
                if (args.type == 'shunt') {
                  vm.reactDataForDashboard();
                }
              }
            },
            opts: {
              onClickItem: function(data, ele, config) {
                // if (vm.disabledFilter) return;

                let filterChanges = {};

                filterChanges[config.field] = [config.getY(data.data)];

                vm.notifyGlobalFilter(filterChanges);
              }
            }
          })
          .react();
        this.dashboardTiles.push(this.valueComparisonConf.tileBundle);
      }

      if (!this.valueRankingConf.tileBundle) {
        this.valueRankingConf.tileBundle = TileConfigurer.defaultConfigurer()
          .type('CaseValueRanking').title('')
          .width({ xs: 6 })
          .height({ xs: 5 })
          .transform({ xs: { x: 0, y: 7 } })
          .hideHeader(true)
          .chart({
            totalCaseCount: null,
            field: null, 
            reinit: false,
            data: { chart: null, table: null },
            groups: [],
            notifyInjectData: function(args) {
              if (TypeChecker.isFunction(vm.dataReactorForDashboard[args.type])) {
                vm.valueRankingConf.tileBundle.chartConfig.field = args.data.field;
                vm.valueRankingConf.tileBundle.chartConfig.reinit = false;
                let channel = {
                  id: vm.valueRankingConf[args.view + 'ChannelId'],
                  key: vm.valueRankingConf[args.view + 'DataKey'],
                  sortBy: args.data.sortBy,
                  orderBy: args.data.orderBy,
                  pageSize: args.data.pageSize,
                  pageIndex: args.data.pageIndex,
                  obtain: function(data) {
                    vm.valueRankingConf.tileBundle.chartConfig.data[args.view] = data;
                    vm.valueRankingConf.tileBundle.chartConfig.reinit = true;
                  },
                  error: function(data) {
                    vm.valueRankingConf.tileBundle.chartConfig.data[args.view] = null;
                  }
                };
                if (args.view == 'chart') {
                  channel.pipes = [{ method: 'COUNT', dataField: args.data.field }];
                } else {
                  channel.pipes = [{ method: 'COUNT', dataField: args.data.field }, { method: 'AVERAGE', dataField: args.data.field }];
                }

                vm.dataReactorForDashboard[args.type](channel);

                if (args.type == 'shunt') {
                  vm.reactDataForDashboard();
                }
              }
            },
            opts: {
              onClickItem: function(data,field) {
                // if (vm.disabledFilter) return;
                let filterChanges = {}
                filterChanges[field] = [data];
                vm.notifyGlobalFilter(filterChanges)
              }
            }
          })
          .react();
        this.dashboardTiles.push(this.valueRankingConf.tileBundle);
      }

      if (!this.aggregationConf.tileBundle) {
        this.aggregationConf.tileBundle = TileConfigurer.defaultConfigurer()
          .type('Aggregation').title('')
          .width({ xs: 6 })
          .height({ xs: 5 })
          .transform({ xs: { x: 6, y: 7 } })
          .hideHeader(true)
          .chart({
            data: null,
            groups: [],
            notifyInjectData: function(args) {
              if (TypeChecker.isFunction(vm.dataReactorForDashboard[args.type])) {
                vm.dataReactorForDashboard[args.type]({
                  id: vm.aggregationConf.channelId,
                  key: vm.aggregationConf.dataKey,
                  groupBy: args.data.groupBy,
                  pageSize: args.data.pageSize,
                  pageIndex: args.data.pageIndex,                  
                  pipes: [{ method: args.data.type, dataField: args.data.dataField }],
                  obtain: function(data) {
                    vm.aggregationConf.tileBundle.chartConfig.data = data;
                  },
                  error: function(data) {
                    vm.aggregationConf.tileBundle.chartConfig.data[args.view] = null;
                  }
                });

                if (args.type == 'shunt') {
                  vm.reactDataForDashboard();
                }
              }
            },
            opts: {
              onClickItem: function(data,field) {
                // if (vm.disabledFilter) return;

                //muhammad-azhaziq.bin-mohd-azlan-goh - Defect 5292 - 24th April 2018
                //muhammad-azhaziq.bin-mohd-azlan-goh - Defect 5316 - 25th April 2018
                let attrList = vm.$store.getters.getAttributesList;
                let selectedAttr = attrList.filter(attr => attr.key === field);

                let filterChanges = {};

                if(selectedAttr[0].fieldType === "date"){

                  let dataRange = data.split("-");

                  if(dataRange[dataRange.length - 2] === "0"){
                    
                    let newStartDate = `${dataRange[0]}-01-01`,
                      newEndDate = `${dataRange[0]}-12-31`;

                    //For non-full date i.e 2017-08-0 - need to send endDate. EndDate will used to get the next day for range
                    filterChanges[field] = DFUtils.preparationAnalysisFilterDateData(newStartDate,newEndDate);

                  } else if(dataRange[dataRange.length - 1] === "0"){
                    
                    let year = parseInt(dataRange[0]),
                        month = parseInt(dataRange[1]);
                    
                    let totalMonthDays = new Date(year,month,0).getDate();

                    if(totalMonthDays.toString().length != 2){
                      totalMonthDays = '0' + totalMonthDays;
                    }

                    let newStartDate = `${dataRange[0]}-${dataRange[1]}-01`,
                        newEndDate = `${dataRange[0]}-${dataRange[1]}-${totalMonthDays}`;

                    //For non-full date i.e 2017-08-0 - need to send endDate. EndDate will used to get the next day for range
                    filterChanges[field] = DFUtils.preparationAnalysisFilterDateData(newStartDate,newEndDate);

                  } else {

                    //For full date i.e 2017-08-01 - no need to send endDate. It will use the selected date to get the next day for range
                    filterChanges[field] = DFUtils.preparationAnalysisFilterDateData(data);
                  }

                } else {
                  filterChanges[field] = [data];
                }

                vm.notifyGlobalFilter(filterChanges)
              }
            }
          })
          .react();
        this.dashboardTiles.push(this.aggregationConf.tileBundle);
      }
    },
    windowResized: function(args) {
      var vm = this;
      if (args.id == this.$props.tileId) {
        eventHub.$emit('resize-tile-panel-container', {
          id: vm.tilePanelId
        });
      }
    },
    onChangedGlobalFilters: function(args) {
      var filters = DFUtils.formatGlobalFilters(args);
      var changedRes = DFUtils.checkIfChanged(filters, {
        dataFilters: this.dataFilters,
        viewFilters: this.viewFilters
      });
      if (changedRes.data) {
        this.dataFilters = filters.dataFilters;
      }
      if (changedRes.view) {
        this.viewFilters = filters.viewFilters;
      }
    },
    onChangedVariant: function(args) {
      if (TypeChecker.isArray(args.variantData) && TypeChecker.isNumber(args.selectedBarCount) && args.variantData.length >= args.selectedBarCount) {
        var theVariant = args.variantData[args.selectedBarCount - 1];
        this.innerDataFilters.variant = Object.assign({}, theVariant);
        this.fetchAnalysisData();
      }
    },
    onChangedAnalysisFilter: function(args) {
      var vm = this,
        changedDashboardFilter = false;
      if (args.dashboardFilters) {
        var oldDashboardStr = DFUtils.filterDataToString(this.innerDataFilters.dashboard);
        var newDashboardStr = DFUtils.filterDataToString(args.dashboardFilters);
        if (oldDashboardStr != newDashboardStr) {
          changedDashboardFilter = true;
        }
        this.innerDataFilters.dashboard = CommonUtils.deepClone(args.dashboardFilters);
      }
      if (changedDashboardFilter) {
        this.fetchAnalysisData();
      }
    },
    changedDataFilters: function() {
      this.fetchAnalysisData();
    },
    cancelLoadData: function(args) {
      var vm = this;
      if (args.id == this.$props.tileId) {
        if (TypeChecker.isFunction(vm.fnCancelFunc)) {
          vm.fnCancelFunc.call(vm);
        }
        eventHub.$emit("finish-mini-loader", { id: vm.loadId });
      }
    },
    cancelLoadFromMiniLoader: function(args) {
      var vm = this;
      if (args.id == this.loadId) {
        if (TypeChecker.isFunction(vm.fnCancelFunc)) {
          vm.fnCancelFunc.call(vm);
        }
      }
    },
    generateConfig(data) {
      let configs = [this.caseDistributionTrendConf, this.valueRankingConf, this.valueComparisonConf, this.aggregationConf],
        config = {};
      if (TypeChecker.isObject(data)) {
        configs.forEach((conf, index) => {
          if (TypeChecker.isArray(data[conf.dataKey])) {
            config[conf.configKey] = data[conf.dataKey];
          } else {
            config[conf.configKey] = [];
          }
        });
      }
      return config;
    }
  },
  mounted: function() {},
  components: {
    DashboardSetup
  },
  beforeDestroy: function() {
    eventHub.$off("tile-window-resized", this.windowResized);
    eventHub.$off("changed-analysis-filter", this.onChangedAnalysisFilter);
    eventHub.$off("changed-global-filters", this.onChangedGlobalFilters);
    eventHub.$off("changed-process-variant", this.onChangedVariant);
    eventHub.$off("cancel-load-data-in-tile", this.cancelLoadData);
    eventHub.$off("cancel-loaing-from-mini-loader", this.cancelLoadFromMiniLoader);

    DataGenerator.destroy();
  }
}
