import TypeChecker from '@/utils/type-checker.js'
import shared from '@/shared.js'
import _ from 'underscore'
import OnboardingApi from '@/api/onboarding.js'
import CommonGenerators from '@/utils/common-generators.js'
import CommonUtils from '@/utils/common-utils.js'
import DataGenerator from './dashboard-setup-data-generator.js'
import ErrorHandler from '@/utils/error-handler.js'

import TilePanelMixins from '@/components/tile/tile-panel-mixins.js'
import TileConfigurer from '@/components/tile/tile-configurer.js'
import DashboardConfigurePanel from './dashboard-configure-panel/DashboardConfigurePanel.vue'
import ProcessMiningApi from '@/api/process-mining.js'

import CaseDistributionTrendMixins from './template/case-distribution-trend/case-distribution-trend.mixins.js'
import ValueComparisonMixins from './template/value-comparison/value-comparison.mixins.js'
import AggregationMixins from './template/aggregation/aggregation.mixins.js'
import CaseValueRankingMixins from './template/case-value-ranking/case-value-ranking.mixins.js'

const TITLE_INDEX = {
  1: "caseDistributionTrendBy",
  2: "valueComparisonBy",
  3: "valueRankingBy",
  4: "aggregations"
}

let CaseDistributionTrend = { mixins: [CaseDistributionTrendMixins] },
    ValueComparison = { mixins: [ValueComparisonMixins] },
    Aggregation = { mixins: [AggregationMixins] },
    CaseValueRanking = { mixins: [CaseValueRankingMixins]};

let TilePanel = {
  mixins: [TilePanelMixins],
  components: {
    CaseDistributionTrend,
    ValueComparison,
    Aggregation,
    CaseValueRanking
  }
}

let eventHub = shared.eventHub,
    UUIDGenerator = CommonGenerators.UUIDGenerator;

export default {
  name: 'dashboard-setup',
  props: {
    status: {
      type: Number,
      default: 1 // 1: view, 2: edit
    },
    type: {
      // 1: system level, 2: user level
      validator: function(_type) {
        if (!TypeChecker.isNumber(_type)) return false;
        if (_type != 1 && _type != 2) return false;
        return true;
      }
    },
    params: {
      validator: function(_params) {
        if (!TypeChecker.isObject(_params)) return false;
        if (!TypeChecker.isString(_params.customerId) || _params.customerId.trim().length < 1) return false;
        if (!TypeChecker.isString(_params.processId) || _params.processId.trim().length < 1) return false;
        if (!TypeChecker.isString(_params.processAnalyticsId) || _params.processAnalyticsId.trim().length < 1) return false;
        return true;
      }
    },
    dataReactor: {
      validator: function(_dataGenerator) {
        if (TypeChecker.isFunction(_dataGenerator)) {
          if (!_dataGenerator instanceof DataGenerator.Reactor) return false;
        }
        return true;
      }
    },
    overall: {
      validator: function(_overall){
        if(!TypeChecker.isObject(_overall)) return false;
        if(!TypeChecker.isNumber(_overall.caseCount)) return false;

        return true;
      }
    }
  },
  data() {
    return {
      title: null,
      tilePanelId: UUIDGenerator.purchase(),
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
        // chartDataKey: 'valueRankingBy',
        chartDataKey: 'valueRankingBy_top10',
        tableDataKey: 'valueRankingBy'
      },
      tiles: [],
      isShowConfPanel: false,
      currentTileOrder: 1,
      minOrder: 1,
      maxOrder: 4,
      currentStatus: 1,
      isEditMode: false,
      chartConfigs: null,
      availableFields: null,
      remoteConfigInfo: null,
      // dataGenerator: null,
      dataGenerator: this.$props.dataReactor || DataGenerator.generate(),
      bNewestConfig: false,
      currentDashboardConf:null ,
      loadedConfig: false
    };
  },
  watch: {
    currentTileOrder() {
      this.markupCurrentTile();
    },
    isShowConfPanel() {
      this.markupCurrentTile();
    },
    params: {
      handler(val) {
        this.dataGenerator.params({
          customerId: this.$props.params.customerId,
          processAnalyticsId: this.$props.params.processAnalyticsId,
          filters: this.$props.params.filters,
          rank:this.$props.params.rank
        });
      },
      deep: true
    }
  },
  components: {
    TilePanel,
    DashboardConfigurePanel
  },
  created() {
    this.currentStatus = this.$props.status;
    this.title = (this.$props.type == 1 ? 'System' : 'Personalized') + ' Analysis Dashboard';
    let customerId = this.$props.params.customerId,
        processId = this.$props.params.processId,
        processAnalyticsId = this.$props.params.processAnalyticsId;

    // fetch data for all tiles
    this.dataGenerator.params({
      customerId:customerId,
      processAnalyticsId : processAnalyticsId,
      filters: this.$props.params.filters,
      rank: this.$props.params.rank
    }).error(function(err) {
      ErrorHandler.handleApiRequestError(err);
    });

    //judge to use  create or update API for dashboard configuration
    OnboardingApi.getAvailableLevelConfig(customerId, processId).then(res => {
      let type = this.$props.type == 1 ? "PROCESS":"USER";
      this.bNewestConfig = res.data.indexOf(type) < 0;
    }, err => {
      ErrorHandler.handleApiRequestError(err);
    });

    this.configTiles();
    this.generateConfig();   
  },
  mounted() {

  },
  beforeDestroy() {
    this.$off()
  },
  methods: {
    generateConfig(){
      let customerId = this.$props.params.customerId,
          processId = this.$props.params.processId;

      let fieldsPromise = OnboardingApi.getDashboardSetupData(customerId, processId),
          configPromise = this.$props.type == 1 ? OnboardingApi.getSystemLevelConfig(customerId, processId) : OnboardingApi.getPersonalLevelConfig(customerId, processId),
          analysisOverviewPromise = ProcessMiningApi.analysisOverview(customerId, processId, {filter:this.$props.params.filters}, this.$props.params.rank)          
      
      //get filed data
      fieldsPromise.then(res => {
        this.availableFields = res.data;
      }, err => {
        ErrorHandler.handleApiRequestError(err);
      });

      // fetch config 
      configPromise.then(res => {
        this.remoteConfigInfo = res.data;
      }, err => {
        ErrorHandler.handleApiRequestError(err);
      });

      analysisOverviewPromise.then(res => {
        this.valueRankingConf.tileBundle.chartConfig.totalCaseCount = res.data.totalCaseCount;
      }, err => {
        ErrorHandler.handleApiRequestError(err);
      });

      Promise.all([fieldsPromise, configPromise,analysisOverviewPromise]).then(() => {
        this.loadedConfig = true;
        let massagedConfig = {},
            configs = [this.caseDistributionTrendConf, this.valueRankingConf, this.valueComparisonConf, this.aggregationConf],
            dashboardConfiguration = this.remoteConfigInfo.dashboardConfiguration || {};

        if (TypeChecker.isObject(dashboardConfiguration)) {
          configs.forEach((conf, index) => {

            massagedConfig[conf.configKey] = TypeChecker.isArray(dashboardConfiguration[conf.dataKey])?dashboardConfiguration[conf.dataKey]:[];

            if (!TypeChecker.isArray(this.availableFields[conf.configKey]) && index < 3) {
              this.availableFields[conf.configKey] = [];
            } else if (index == 3) {
              if (!TypeChecker.isObject(this.availableFields[conf.configKey])) {
                this.availableFields[conf.configKey] = {};
              }
            }
          });
        }

        this.currentDashboardConf = massagedConfig;
       
        configs.forEach((config, i)=>{
          config.tileBundle.chartConfig.data = config.dataKey == "valueRankingBy"?{chart: null, table: null}:null;
          if(config.dataKey == "aggregations"){
              let aggregateGroups_ = CommonUtils.deepClone(massagedConfig[this.aggregationConf.configKey]);
              aggregateGroups_.forEach(g=>{
                g.byLabel = g.by.label
                g.groupByLabel = g.groupBy.label
              })   

             config.tileBundle.chartConfig.groups = CommonUtils.multistageSort(aggregateGroups_,"asc",["aggregate","byLabel","groupByLabel"]);            
             
          }else{
            config.tileBundle.chartConfig.groups = massagedConfig[config.dataKey];
          }
        }) 
        
      });
    },    
    markupCurrentTile() {
      this.chartConfigs.forEach((c, index) => {
        let el = document.getElementById(c.id);
        let wrapper = el.childNodes[0];
        if (this.isShowConfPanel) {
          if (index + 1 == this.currentTileOrder) {
            wrapper.classList.add('current');
          } else {
            wrapper.classList.remove('current');
          }
        } else {
          wrapper.classList.remove('current');
        }
      })
    },
    editTile(order) {
      let vm = this;
      if (!this.isShowConfPanel) {
        this.isShowConfPanel = true;
        setTimeout(function() {
          eventHub.$emit('resize-tile-panel-container', {
            id: vm.tilePanelId
          });
        }, 0);
      }
      if (this.currentTileOrder != order) {
        this.currentTileOrder = order;
      }
    },
    cancelEditTile() {
      let vm = this;
      if (this.isShowConfPanel) {
        this.isShowConfPanel = false;
        setTimeout(function() {
          eventHub.$emit('resize-tile-panel-container', {
            id: vm.tilePanelId
          });
        }, 0);
      }
    },
    configTiles(config) {
      let vm = this;

      let fnStartToReact = _.debounce(function() {
        vm.dataGenerator.react();
      }, 500);

      if (!this.caseDistributionTrendConf.tileBundle) {
        this.caseDistributionTrendConf.tileBundle = TileConfigurer.defaultConfigurer()
          .type('CaseDistributionTrend').title('')
          .width({ xs: 6 })
          .height({ xs: 6 })
          .transform({ xs: { x: 0, y: 0 } })
          .hideHeader(true)
          .chart({
            data: null,
            groups: [],
            notifyInjectData: function(args) {
              if (TypeChecker.isFunction(vm.dataGenerator[args.type])) {
                vm.dataGenerator[args.type]({
                  id: vm.caseDistributionTrendConf.channelId,
                  key: vm.caseDistributionTrendConf.dataKey,
                  pageSize: args.data.pageSize,
                  pageIndex: args.data.pageIndex,
                  pipes: [{ method: "COUNT", dataField: args.data.field }],
                  obtain: function(data) {
                    vm.caseDistributionTrendConf.tileBundle.chartConfig.data = data;
                  },
                  error: function(){
                    vm.caseDistributionTrendConf.tileBundle.chartConfig.data = null;
                  }
                });

                if (args.type == 'shunt') fnStartToReact();
              }
            }
          })
          .react();
        this.tiles.push(this.caseDistributionTrendConf.tileBundle);
      }

      if (!this.valueComparisonConf.tileBundle) {
        this.valueComparisonConf.tileBundle = TileConfigurer.defaultConfigurer()
          .type('ValueComparison').title('')
          .width({ xs: 6 })
          .height({ xs: 6 })
          .transform({ xs: { x: 6, y: 0 } })
          .hideHeader(true)
          .chart({
            data: null,
            groups: [],
            notifyInjectData: function(args) {
              if (TypeChecker.isFunction(vm.dataGenerator[args.type])) {
                vm.dataGenerator[args.type]({
                  id: vm.valueComparisonConf.channelId,
                  key: vm.valueComparisonConf.dataKey,
                  pageSize: args.data.pageSize,
                  pageIndex: args.data.pageIndex,
                  sortBy: 'DESC',
                  pipes: [{ method: 'COUNT', dataField: args.data.field }, { method: 'AVERAGE', dataField: args.data.field }],
                  obtain: function(data) {
                    vm.valueComparisonConf.tileBundle.chartConfig.data = data;
                  },
                  error: function(){
                    vm.valueComparisonConf.tileBundle.chartConfig.data = null;
                  }
                });

                if (args.type == 'shunt') fnStartToReact();
              }
            }
          })
          .react();
        this.tiles.push(this.valueComparisonConf.tileBundle);
      }

      if (!this.valueRankingConf.tileBundle) {
        this.valueRankingConf.tileBundle = TileConfigurer.defaultConfigurer()
          .type('CaseValueRanking').title('')
          .width({ xs: 6 })
          .height({ xs: 6 })
          .transform({ xs: { x: 0, y: 6 } })
          .hideHeader(true)
          .chart({
            data: {chart: null, table: null},
            groups: [],
            field:null,
            totalCaseCount:null,
            notifyInjectData: function(args) {   
              if (TypeChecker.isFunction(vm.dataGenerator[args.type])) {
                vm.valueRankingConf.tileBundle.chartConfig.field = args.data.field;

                let channel = {
                  id: vm.valueRankingConf[args.view + 'ChannelId'],
                  key: vm.valueRankingConf[args.view + 'DataKey'],
                  sortBy: args.data.sortBy,
                  orderBy: args.data.orderBy,
                  pageSize: args.data.pageSize,
                  pageIndex: args.data.pageIndex,
                  obtain: function(data) {
                    vm.valueRankingConf.tileBundle.chartConfig.data[args.view] = data;
                  },
                  error: function(){
                    vm.valueRankingConf.tileBundle.chartConfig.data[args.view] = null;
                  }
                };

                if(args.view == 'chart') {
                  channel.pipes = [{ method: 'COUNT', dataField: args.data.field }];
                } else {
                  channel.pipes = [{ method: 'COUNT', dataField: args.data.field }, { method: 'AVERAGE', dataField: args.data.field }];
                }
                vm.dataGenerator[args.type](channel);
                if (args.type == 'shunt') fnStartToReact();
              }
            }
          })
          .react();
        this.tiles.push(this.valueRankingConf.tileBundle);
      }

      if (!this.aggregationConf.tileBundle) {
        this.aggregationConf.tileBundle = TileConfigurer.defaultConfigurer()
          .type('Aggregation').title('')
          .width({ xs: 6 })
          .height({ xs: 6 })
          .transform({ xs: { x: 6, y: 6 } })
          .hideHeader(true)
          .chart({
            data: null,
            groups: [],
            notifyInjectData: function(args) {
              if (TypeChecker.isFunction(vm.dataGenerator[args.type])) {
                vm.dataGenerator[args.type]({
                  id: vm.aggregationConf.channelId,
                  key: vm.aggregationConf.dataKey,
                  groupBy: args.data.groupBy,
                  pageSize: args.data.pageSize,
                  pageIndex: args.data.pageIndex,
                  pipes: [{method: args.data.type, dataField: args.data.dataField}],
                  obtain: function(data) {
                    vm.aggregationConf.tileBundle.chartConfig.data = data;
                  },
                  error: function(){
                    vm.aggregationConf.tileBundle.chartConfig.data = null;
                  }
                });

                if (args.type == 'shunt') fnStartToReact();
              }
            }
          })
          .react();
        this.tiles.push(this.aggregationConf.tileBundle);
      }

      this.chartConfigs = [this.caseDistributionTrendConf.tileBundle, this.valueComparisonConf.tileBundle, this.valueRankingConf.tileBundle, this.aggregationConf.tileBundle];

      this.toggleEditTileMode();
    },
    toggleEditTileMode() {
      let vm = this;
      let generateEditOpt = function(order) {
        let opt = {
          class: 'edit-btn',
          icon: 'icon-pencil',
          hide: false,
          onClick: function(evt, tile) {
            vm.editTile(order);
          }
        };
        return opt;
      };
      let chartConfigs = this.chartConfigs;
      if (!vm.isEditMode) {
        chartConfigs.forEach(c => {
          c.customActions = [];
        });
      } else {
        chartConfigs.forEach((c, index) => {
          c.customActions = [generateEditOpt(index + 1)];
        });
      }
    },
    prev() {
      if (this.currentTileOrder > 1) {
        this.currentTileOrder--;
      }
    },
    next() {
      if (this.currentTileOrder < 4) {
        this.currentTileOrder++;
      }
    },
    cancel() {
      if (this.$props.status == 1) {
        this.currentStatus = 1;
        this.isEditMode = false;
        this.toggleEditTileMode();
      }
      this.cancelEditTile();
      this.$emit('cancel');
    },
    saveConfiguration(args) {
      if (this.$props.status == 1) {
        this.currentStatus = 1;
        this.isEditMode = false;
        this.toggleEditTileMode();
      }
      this.cancelEditTile();

      let config_payLoad = this.payloadGenetator(args,this.bNewestConfig),
          configurationAPI = this.bNewestConfig?"createDashboardConfiguration":"updateDashboardConfiguration";

      OnboardingApi[configurationAPI](this.$props.params.customerId, config_payLoad).then(res => {
        
        this.remoteConfigInfo = res.data;
        this.bNewestConfig = false;

        let massagedConfig = {},
            configs = [this.caseDistributionTrendConf, this.valueComparisonConf, this.valueRankingConf, this.aggregationConf],
            dashboardConfiguration = res.data.dashboardConfiguration || {};

        configs.forEach((config, i)=>{
          massagedConfig[config.configKey] = TypeChecker.isArray(dashboardConfiguration[config.dataKey])?dashboardConfiguration[config.dataKey]:[];
          
          for(let i in massagedConfig){
            if(massagedConfig.hasOwnProperty(i)){

              let field = this.availableFields[i];
              if(i == "valueGroupBy"){
                massagedConfig[i].forEach(mConf=>{
                  field.field.forEach(f=>{
                   if(mConf.by.key == field.field.key)mConf.by.label = field.label;
                  })
                  field.groupBy.forEach(f=>{
                   if(mConf.groupBy.key == field.groupBy.key)mConf.groupBy.label = field.label;
                  })                 
                })
              }else{
                massagedConfig[i].forEach(mConf=>{
                  field.forEach(f=>{
                    if(f.key == mConf.key)mConf.label = f.label
                  })
                })
              }

            }
          }
        })

        configs.forEach((config, i)=>{        
          config.tileBundle.chartConfig.data = config.dataKey == "valueRankingBy"?{chart: null, table: null}:null;
          if(config.dataKey == "aggregations"){

              let aggregateGroups = CommonUtils.deepClone(this.aggregationConf.configKey);

              aggregateGroups.forEach(g=>{
                g.byLabel = g.by.label
                g.groupByLabel = g.groupBy.label
              })   

             config.tileBundle.chartConfig.groups = CommonUtils.multistageSort(aggregateGroups,"asc",["aggregate","byLabel","groupByLabel"]);


             let argConfig = args[i].config, 
                 fieldValues = argConfig.allFields.map(f => f.value), 
                 groupByFeildValues = argConfig.allGroupByFields.map(f => f.value);

             config.tileBundle.chartConfig.groups.forEach(g => {
              g.by.label = argConfig.allFields[fieldValues.indexOf(g.by.key)].name;
              g.groupBy.label = argConfig.allGroupByFields[groupByFeildValues.indexOf(g.groupBy.key)].name;
             });

          }else{
            config.tileBundle.chartConfig.groups = massagedConfig[config.dataKey];
            
            let argConfig = args[i].config, 
                fieldValues = argConfig.allFields.map(f => f.value);

            config.tileBundle.chartConfig.groups.forEach(g => {
              g.label = argConfig.allFields[fieldValues.indexOf(g.key)].name;
            });
          }
        })    

        this.currentDashboardConf = massagedConfig; //update configuration selected

      }, err => {
        ErrorHandler.handleApiRequestError(err);
      })
    },

    payloadGenetator(args,bNewestConfig){

      let vm = this,
          config_create = {
            processId: vm.$props.params.processId,
            dashboardType: vm.$props.type == 1 ? "PROCESS" : "USER",
            userId: null,
            caseDistributionTrendBy: [],
            valueComparisonBy: [],
            valueRankingBy: [],
            aggregations: [],
            selected: vm.$props.type == 1 ? false : true
          };       
      //fetch data
      args.forEach(arg => {
        let name = TITLE_INDEX[arg.order];
        if (arg.order == 4) {
          arg.groups.forEach((group,index) => {
            let groupData = group.name.split(" "),
                availableFields = this.availableFields,
                newGroup = {
                  aggregate: groupData[0],
                  order: index+1
                },
                bValueGroupBy = availableFields && availableFields.valueGroupBy;

            if (bValueGroupBy && TypeChecker.isArray(availableFields.valueGroupBy.field)) {
              availableFields.valueGroupBy.field.forEach(g => {
                if (g.label == groupData[2]) newGroup.by = {key:g.key};
              })
            }

            if (bValueGroupBy && TypeChecker.isArray(availableFields.valueGroupBy.groupBy)) {
              availableFields.valueGroupBy.groupBy.forEach(g => {
                if (g.label == groupData[4]) newGroup.groupBy = {key:g.key};
              })
            }

            config_create[name].push(newGroup);

          })
        } else {
          arg.groups.forEach(group => {
            config_create[name].push({key: group.value});
          })
        }
      })

      // fix the bug of updating the dashboard configuration of process and user
      if(!bNewestConfig&&vm.$props.type == 1){
        config_create.userId = null;       
      }else{
        config_create.userId = vm.$store.getters.userProfile.userFe.id;       

      }
      let config_update = {
          id: vm.remoteConfigInfo.id,
          dashboardConfiguration:config_create,
          deleted:vm.$props.type == 1?false:true
      }   
      // return config_create;
      return bNewestConfig?config_create:config_update;

    },
    close() {
      this.$emit('close');
    },
    toEditView() {
      if(TypeChecker.isObject(this.availableFields) && this.loadedConfig){
        this.isEditMode = true;
        this.currentStatus = 2;
        this.toggleEditTileMode();
        this.editTile(this.currentTileOrder);
      }
    },   
  }
}
