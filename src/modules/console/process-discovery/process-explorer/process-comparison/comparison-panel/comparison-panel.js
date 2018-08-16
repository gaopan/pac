import processMiningApi from '@/api/process-mining.js'
import processMappingApi from '@/api/process-mapping.js'
import TypeChecker from '@/utils/type-checker.js'
import CommonGenerators from '@/utils/common-generators.js'
import StringUtils from '@/utils/string-utils.js'
import ErrorHandler from '@/utils/error-handler.js'
// import filterUtils from '@/utils/filters-utils.js'
import DFUtils from '../../dynamic-filter/dynamic-filter-utils.js'
import Noty from '@/utils/noty-operation.js'
import RecipeSelection from '../recipe-selection/RecipeSelection.vue'
import PNChart from "../../../pn-chart/PNChart.vue"
import ProcessKpi from "../process-kpi/ProcessKpi.vue"
import CycleTimeKpi from './cycle-time-kpi/CycleTimeKpi.vue'
import SVG from 'svg.js'
import shared from '@/shared.js'
import ProcessVariantKpi from './process-variant-kpi/process-variant-kpi.vue'
import ProcessDeviationKpi from '../comparison-panel/process-deviation-kpi/ProcessDeviationKpi.vue'


let eventHub = shared.eventHub

let UUIDGenerator = CommonGenerators.UUIDGenerator

export default {
  name: 'comparison-panel',
  props: {
    tileId: {
      type: String,
      required: true
    },
    tileConf: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      innerDataFilters: {
        variant: {}
      },
      dataFilters: {
        processAnalyticsId: null,
        globalFilters: null
      },
      viewFilters: {
        viewType: 1, // 0: both, 1: Transactions, 2: Durations
      },
      selectionConf: {
        opts: {
          disabledCompareBtn: false
        }
      },
      variantKpiConf: { data: null, opts: null },
      industryKpiConf: { data: null, opts: null },
      variantChart: null,
      industryChart: null,
      showSelection: true,
      isMapping: false,
      variantConf: {
        data: null,
        opts: {
          disabledTooltip: false,
          enabledClickPop: true,
          isMapping: false,
          viewType: 1,
          viewOpts: { kpi: "abs" },
          showTitle: true,
          enabledTooltipLinkage: false,
          disabledTooltipKpi: true,
          id: UUIDGenerator.purchase()
        }
      },
      industryConf: {
        data: null,
        opts: {
          disabledTooltip: false,
          viewType: 1,
          viewOpts: { kpi: "abs" },
          showTitle: true,
          enabledTooltipLinkage: true,
          disabledAddon: true,
          disabledTooltipKpi: true,
          id: UUIDGenerator.purchase()
        }
      },
      showMapTip: false,
      showKpiDetail: false,
      remoteMappingId: null,
      variantLoadId: UUIDGenerator.purchase(),
      variantCancelFunc: null,
      kpiDetailData: null,
      kpiDetailCancelFunc: null,
      kpiDetailLoadId: UUIDGenerator.purchase(),
      isRequestForKpiDetailDataEnded: true,
      kpiAggregatorData: null,
      kpiAggregatorCancelFunc: null,
      kpiAggregatorLoadId: UUIDGenerator.purchase(),
      isRequestForKpiAggregatorDataEnded: true,
      cycleTimeKpiConf: { data: null },
      processVariantKpiConf: { data: null },
      processDeviationKpiConf: { data: null },
      retainMappingList: [],
      unMappedLeftActs: [],
      unMappedRightActs: [],
      currentMappingOrder: 1,
      absentMappingOrders: [],
      mappingList: [],
      timer: null,
      showConfirmModal: false,
      comDateForMapping: null
    }
  },
  components: {
    RecipeSelection,
    ProcessKpi,
    'pn-chart': PNChart,
    'cycle-time-kpi': CycleTimeKpi,
    'process-variant-kpi': ProcessVariantKpi,
    'process-deviation-kpi': ProcessDeviationKpi,
  },
  watch: {
    innerDataFilters: {
      handler(val) {
        this.changedInnerDataFilters();
      },
      deep: true
    },
    viewFilters: {
      handler() {
        this.changedViewFilters();
      },
      deep: true
    },
    dataFilters: {
      handler() {
        this.changedDataFilters();
      },
      deep: true
    }
  },
  methods: {
    fetchProcessDefinitionData: function(cb) {
      let vm = this

      if (!this.dataFilters.processAnalyticsId || !this.innerDataFilters.variant || !TypeChecker.isNumber(this.innerDataFilters.variant.order)) {
        if (this.dataFilters.processAnalyticsId && this.innerDataFilters.variant && TypeChecker.isFunction(cb)) {
          cb.call(vm, null);
        }
        return;
      }

      var id = vm.variantLoadId;
      eventHub.$emit("start-mini-loader", { id: id, roughTime: 1000 * 60 * 2 });
      eventHub.$emit("loading-data-in-tile", { id: this.$props.tileId, loadId: id });

      //Azhaziq - 08-12-2017: To cater C2
      DFUtils.formatDataFiltersForRequest(this.dataFilters).then(data => {

        let filtersToRequest = data;

        processMiningApi.filterProcessDefinition(this.$store.getters.processSelection.customerId, this.dataFilters.processAnalyticsId, filtersToRequest, this.innerDataFilters.variant.order == 10 ? null : this.innerDataFilters.variant.order, function(c) {
          vm.variantCancelFunc = c;
        }).then(function(res) {
          if (TypeChecker.isFunction(cb)) {
            cb.call(vm, res.data);
          }
          vm.variantCancelFunc = null;
          setTimeout(function() {
            eventHub.$emit("finish-mini-loader", { id: id });
            eventHub.$emit("loaded-data-in-tile", { id: vm.$props.tileId, loadId: id });
          }, 1000);
        }, err => {
          vm.variantCancelFunc = null;
          eventHub.$emit("finish-mini-loader", { id: id });
          eventHub.$emit("loaded-data-in-tile", { id: vm.$props.tileId, loadId: id });
        });
      });
    },
    configComponents: function(pnData) {
      this.selectionConf.opts.disabledCompareBtn = !pnData;
      this.variantConf.data = pnData;
      this.variantConf.opts.viewType = this.viewFilters.viewType;
      this.industryConf.opts.viewType = this.viewFilters.viewType;
    },
    init: function() {
      if (this.$route.query.id) {
        this.setId(this.$route.query.id);
      } else {
        this.configComponents();
      }
    },
    fetchRemoteMappingList: function(variantId, industryId) {
      var vm = this;
      vm.showMapTip = false;
      var id = UUIDGenerator.purchase();
      eventHub.$emit("start-mini-loader", { id: id });
      processMappingApi.getProcessMappingInfoPromise(this.customerId, this.customerName, variantId, industryId)
        .then(function(res) {
          var remoteMappingList = res.data.mappings;
          if (!remoteMappingList) {
            vm.clearMapping();
            vm.showMapTip = true;
            setTimeout(function() {
              vm.showMapTip = false;
            }, 8000);
            eventHub.$emit("finish-mini-loader", { id: id });
            return;
          }
          vm.remoteMappingId = res.data.id;
          // save the mapping with activity not in current pnchart to retainMappingList for update
          vm.retainMappingList = [];
          var validMappingList = [];
          if (vm.variantChart && vm.industryChart) {
            remoteMappingList.forEach(function(m) {
              var matchedSource = null,
                matchedTarget = null;
              if (vm.variantChart._transitions) {
                vm.variantChart._transitions.every(function(t) {
                  if (t._title == m.sourceName) {
                    matchedSource = t;
                    return false;
                  }
                  return true;
                });
              }
              if (vm.industryChart._transitions) {
                vm.industryChart._transitions.every(function(t) {
                  if (t._title == m.targetName) {
                    matchedTarget = t;
                    return false;
                  }
                  return true;
                });
              }
              if (matchedSource && matchedTarget) {
                validMappingList.push(m);
              } else {
                vm.retainMappingList.push(m);
              }
            });
          }

          if (vm.variantChart._transitions && validMappingList.length == (vm.variantChart._transitions.length - 2)) {
            vm.showMapTip = false;
          } else {
            vm.showMapTip = true;
            setTimeout(function() {
              vm.showMapTip = false;
            }, 8000);
          }

          vm.parseMappingListWithAPIFormat(validMappingList);

          eventHub.$emit("finish-mini-loader", { id: id });
        }, function(err) {
          ErrorHandler.handleApiRequestError(err);
          eventHub.$emit("finish-mini-loader", { id: id });
        });
    },
    parseMappingListWithAPIFormat: function(validMappingList) {
      var vm = this;
      var theMappingList = [];
      var mappingOrder = 1,
        mapping = null,
        usedMappingIndexes = [];
      // group the data
      validMappingList.forEach(function(m, index) {
        if (usedMappingIndexes.indexOf(index) < 0) {
          usedMappingIndexes.push(index);
          if (!mapping) {
            mapping = { leftActNames: [m.sourceName], rightActNames: [m.targetName], order: mappingOrder };
          }
          // find the mapping has relationship with the mapping
          validMappingList.forEach(function(theM, theIndex) {
            var existedInLeft = mapping.leftActNames.indexOf(theM.sourceName) > -1,
              existedInRight = mapping.rightActNames.indexOf(theM.targetName) > -1;
            if (existedInLeft || existedInRight) {
              usedMappingIndexes.push(theIndex);
              // merged to the mapping
              if (existedInLeft && !existedInRight) {
                mapping.rightActNames.push(theM.targetName);
              } else if (!existedInLeft && existedInRight) {
                mapping.leftActNames.push(theM.sourceName);
              }
            }
          });
          theMappingList.push(mapping);
          mapping = null;
        }
      });

      vm.parseMappingList(theMappingList);
    },
    changedInnerDataFilters: function() {
      var vm = this;
      vm.fetchProcessDefinitionData(function(pnData) {
        // changed process definition id, so refresh mapping
        vm.remoteMappingId = null;
        if (pnData && vm.industryConf.data && vm.industryConf.data.id) {
          vm.configComponents(pnData);
          vm.fetchRemoteMappingList(vm.$store.getters.processSelection.processAnalyticsId, vm.industryConf.data.id);
        } else {
          vm.resetSelection();
          vm.configComponents(pnData);
        }
      });
      // refresh kpi data
      vm.refreshKpiData();
    },
    changedViewFilters: function() {
      var vm = this;
      this.variantConf.opts.viewType = this.viewFilters.viewType;
      // changed viewtype, should not refresh mapping, need to replace the act node
      setTimeout(function() {
        var formatedMappingList = vm.convertMappingListToAPIFormat();
        vm.parseMappingListWithAPIFormat(formatedMappingList);
      }, 0);
    },
    refreshKpiData: function() {
      var vm = this;
      if (vm.industryConf.data && vm.industryConf.data.id) {
        vm.retrieveDataForAggregratorKpi();

        if (vm.showKpiDetail) {
          vm.retrieveDataForDetailKpi();
        }
      } else {
        // reset kpi aggregrator
        vm.kpiAggregatorData = null;
        vm.variantKpiConf.data = null;

        // reset kpi details
        vm.kpiDetailData = null;
        vm.cycleTimeKpiConf.data = null;
        vm.processVariantKpiConf.data = null;
        vm.processDeviationKpiConf.data = null;
      }
    },
    retrieveDataForDetailKpi: function(cb, errCb) {
      var vm = this;
      vm.isRequestForKpiDetailDataEnded = false;
      if (!this.industryConf.data || !this.industryConf.data.id || !this.dataFilters.processAnalyticsId || !this.innerDataFilters.variant || !TypeChecker.isNumber(this.innerDataFilters.variant.order)) {
        return;
      }
      // get the data for kpi detail
      var id = vm.kpiDetailLoadId;
      eventHub.$emit("start-mini-loader", { id: id, roughTime: 1000 * 60 * 2 });
      eventHub.$emit("loading-data-in-tile", { id: vm.$props.tileId, loadId: id });
      DFUtils.formatDataFiltersForRequest(this.dataFilters).then(data => {
        let filtersToRequest = data;
        filtersToRequest.recipeId = vm.industryConf.data.id;
        processMiningApi
          .filterKpiDetail(this.$store.getters.processSelection.customerId,
            this.$store.getters.processSelection.customer.name, this.dataFilters.processAnalyticsId, filtersToRequest, this.innerDataFilters.variant.order == 10 ? null : this.innerDataFilters.variant.order,
            function(c) {
              vm.kpiDetailCancelFunc = c;
            })
          .then(function(res) {
            vm.kpiDetailData = res.data;
            vm.cycleTimeKpiConf.data = vm.kpiDetailData;
            vm.processVariantKpiConf.data = vm.kpiDetailData;
            vm.processDeviationKpiConf.data = vm.kpiDetailData;
            if (TypeChecker.isFunction(cb)) {
              cb.call(vm);
            }
            vm.isRequestForKpiDetailDataEnded = true;
            vm.kpiDetailCancelFunc = null;
            eventHub.$emit("finish-mini-loader", { id: id });
            eventHub.$emit("loaded-data-in-tile", { id: vm.$props.tileId, loadId: id });
          }, function(err) {
            ErrorHandler.handleApiRequestError(err);
            vm.isRequestForKpiDetailDataEnded = true;
            if (TypeChecker.isFunction(errCb)) {
              errCb.call(vm);
            }
            vm.kpiDetailCancelFunc = null;
            eventHub.$emit("finish-mini-loader", { id: id });
            eventHub.$emit("loaded-data-in-tile", { id: vm.$props.tileId, loadId: id });
          });
      });

    },
    retrieveDataForAggregratorKpi: function(cb, errCb) {
      var vm = this;
      vm.isRequestForKpiAggregatorDataEnded = false;
      if (!this.industryConf.data || !this.industryConf.data.id || !this.dataFilters.processAnalyticsId || !this.innerDataFilters.variant || !TypeChecker.isNumber(this.innerDataFilters.variant.order)) {
        return;
      }
      // get the data for kpi aggregator
      var id = vm.kpiAggregatorLoadId;
      eventHub.$emit("start-mini-loader", { id: id, roughTime: 1000 * 60 * 2 });
      eventHub.$emit("loading-data-in-tile", { id: vm.$props.tileId, loadId: id });
      DFUtils.formatDataFiltersForRequest(this.dataFilters).then(data => {
        let filtersToRequest = data;
        filtersToRequest.recipeId = vm.industryConf.data.id;
        processMiningApi
          .filterKpiAggregator(this.$store.getters.processSelection.customerId,
            this.$store.getters.processSelection.customer.name, this.dataFilters.processAnalyticsId, filtersToRequest, this.innerDataFilters.variant.order == 10 ? null : this.innerDataFilters.variant.order,
            function(c) {
              vm.kpiAggregatorCancelFunc = c;
            }, !!vm.$route.query.test_api)
          .then(function(res) {
            vm.kpiAggregatorData = res.data;
            vm.variantKpiConf.data = {
              cycleTime: vm.kpiAggregatorData.overallAverageCycleTime,
              firstPassYield: vm.kpiAggregatorData.overallFirstPassYield,
              compliance: vm.kpiAggregatorData.overallConformanceRate
            };
            if (TypeChecker.isFunction(cb)) {
              cb.call(vm);
            }
            vm.isRequestForKpiAggregatorDataEnded = true;
            vm.kpiAggregatorCancelFunc = null;
            eventHub.$emit("finish-mini-loader", { id: id });
            eventHub.$emit("loaded-data-in-tile", { id: vm.$props.tileId, loadId: id });
          }, function(err) {
            ErrorHandler.handleApiRequestError(err);
            vm.isRequestForKpiAggregatorDataEnded = true;
            if (TypeChecker.isFunction(errCb)) {
              errCb.call(vm);
            }
            vm.kpiAggregatorCancelFunc = null;
            eventHub.$emit("finish-mini-loader", { id: id });
            eventHub.$emit("loaded-data-in-tile", { id: vm.$props.tileId, loadId: id });
          });
      });

    },
    changedDataFilters: function() {
      this.refreshKpiData();
    },
    onChangedFilters: function(args) {
      var filters = DFUtils.formatGlobalFilters(args);
      var changedRes = DFUtils.checkIfChanged(filters, {
        dataFilters: this.dataFilters
      });
      if (changedRes.data) {
        this.dataFilters = filters.dataFilters;
      }
    },
    toMapActivities: function() {
      var vm = this;
      vm.showMapTip = false;
      vm.isMapping = true;

      vm.changePNchartIsMapping();
      vm.variantConf.opts.enabledTooltipLinkage = true;
      setTimeout(function() {
        vm.fetchRemoteMappingList(vm.$store.getters.processSelection.processAnalyticsId, vm.industryConf.data.id);
      }, 500)
      if (vm.variantKpiConf.opts && vm.variantKpiConf.opts.actions && vm.variantKpiConf.opts.actions.length == 3) {
        vm.variantKpiConf.opts.actions[0].hide = true;
        vm.variantKpiConf.opts.actions[1].hide = false;
        vm.variantKpiConf.opts.actions[2].hide = false;
      }
    },
    onChangedProcessToCompare: function(args) {
      var vm = this;
      vm.comDateForMapping = args.data;
      this.showSelection = false;
      vm.industryConf.data = {
        id: args.data.id,
        name: args.data.name,
        processMap: args.data.processMap
      };
      vm.industryKpiConf.data = {
        cycleTime: args.data.cycleTime,
        firstPassYield: args.data.firstPassYield,
        compliance: args.data.complianceRate
      };

      eventHub.$emit("mapping-process");

      // 26-7-2017: Azhaziq - Recipe Id Addition
      // eventHub.$emit('apply-global-filters', {
      //   src: 'comparison',
      //   recipeId: vm.industryConf.data.id ? vm.industryConf.data.id : ""
      // });

      // retrieve remote mapped info
      vm.remoteMappingId = null;
      setTimeout(function() {
        vm.fetchRemoteMappingList(vm.$store.getters.processSelection.processAnalyticsId, vm.industryConf.data.id);

        // // fetch data for kpi session id
        vm.refreshKpiData();
      }, 300)

    },
    touchOnActivity: function(act) {
      var vm = this;
      if (!vm.isMapping) return;
      if (!act) return;
      if (act._pid == vm.variantConf.opts.id) {
        if (!act.mapping) {
          // find act in unMappedLeftActs
          if (vm.unMappedLeftActs.indexOf(act) < 0) {
            vm.unMappedLeftActs.push(act);
            act.node.classList.add("pined");
          } else {
            vm.unMappedLeftActs.splice(vm.unMappedLeftActs.indexOf(act), 1);
            act.node.classList.remove("pined");
          }
        } else {
          if (act.mapping.leftActs.length < 2) {
            // remove the mapping
            vm.currentMappingOrder = act.mapping.order;
            vm.absentMappingOrders.push(act.mapping.order);
            vm.mappingList.splice(vm.mappingList.indexOf(act.mapping), 1);
            vm.eraseMapping(act.mapping);
          } else {
            act.mapping.leftActs.splice(act.mapping.leftActs.indexOf(act), 1);
            vm.eraseActivity(act);
          }
        }
      }
      if (act._pid == vm.industryConf.opts.id) {
        if (!act.mapping) {
          // find act in unMappedRightActs
          if (vm.unMappedRightActs.indexOf(act) < 0) {
            // vm.unMappedRightActs.push(act);
            vm.unMappedRightActs.forEach(function(rightAct) {
              rightAct.node.classList.remove("pined");
            });
            vm.unMappedRightActs.splice(0, vm.unMappedRightActs.length, act);
            act.node.classList.add("pined");
          } else {
            vm.unMappedRightActs.splice(vm.unMappedRightActs.indexOf(act), 1);
            act.node.classList.remove("pined");
          }
        } else {
          if (act.mapping.rightActs.length < 2) {
            // remove the mapping
            vm.currentMappingOrder = act.mapping.order;
            vm.absentMappingOrders.push(act.mapping.order);
            vm.mappingList.splice(vm.mappingList.indexOf(act.mapping), 1);
            vm.eraseMapping(act.mapping);
          } else {
            act.mapping.rightActs.splice(act.mapping.rightActs.indexOf(act), 1);
            vm.eraseActivity(act);
          }
        }
      }
      // when both leftacts and right acts has element, trigger popup to select save mapping or continue selecting
      // Updated: 
      if (vm.unMappedLeftActs.length > 0 && vm.unMappedRightActs.length > 0) {
        // vm.showConfirmModal = true;
        vm.setupMapping();
      }
    },
    clearMapping: function() {
      var vm = this;
      vm.currentMappingOrder = 1;
      while (vm.unMappedLeftActs.length > 0) {
        var act = vm.unMappedLeftActs.pop();
        act.node.classList.remove("pined");
        act.node.classList.remove("flag-pined");
      }
      while (vm.unMappedRightActs.length > 0) {
        var act = vm.unMappedRightActs.pop();
        act.node.classList.remove("pined");
        act.node.classList.remove("flag-pined");
      }
      vm.mappingList.forEach(function(map) {
        vm.eraseMapping(map);
      });
      vm.mappingList = [];
      vm.absentMappingOrders = [];
    },
    changePNchartIsMapping: function() {
      this.variantConf.opts.isMapping = this.isMapping;
      this.industryConf.opts.isMapping = this.isMapping;
    },

    parseMappingList: function(list) {
      var vm = this,
        notFound = false;

      vm.clearMapping();

      var fnConvertNameToAct = function(names, pnChart) {
        var acts = [];
        names.forEach(function(name) {
          var matched = null;
          if (pnChart && pnChart._transitions) {
            pnChart._transitions.every(function(t) {
              if (t._title == name) {
                matched = t;
                return false;
              }
              return true;
            });
          }
          if (!matched) {
            return false;
          }
          acts.push(matched);
          return true;
        });
        return acts;
      };
      list.every(function(map) {
        // find left act from variant chart
        var leftActs = fnConvertNameToAct(map.leftActNames, vm.variantChart);
        if (leftActs.length != map.leftActNames.length) {
          console.warn("Not found matched transition in PNChart");
          return false;
        }

        // find right act from industry chart
        var rightActs = fnConvertNameToAct(map.rightActNames, vm.industryChart);
        if (rightActs.length != map.rightActNames.length) {
          console.warn("Not found matched transition in PNChart");
          return false;
        }
        // new mapping stored in vm.mappingList
        var newMapping = {
          id: UUIDGenerator.purchase(),
          order: vm.currentMappingOrder++,
          leftActs: leftActs,
          rightActs: rightActs
        };
        leftActs.forEach(function(act) {
          act.mapping = newMapping;
        });
        rightActs.forEach(function(act) {
          act.mapping = newMapping;
        });
        vm.mappingList.push(newMapping);
        vm.drawMapping(newMapping);

        return true;
      });
    },
    eraseActivity: function(act) {
      if (act.mapPinNode) {
        act.mapPinNode.parentNode.removeChild(act.mapPinNode);
        act.mapPinNode = null;
      }
      if (act.node) {
        act.node.classList.remove("pined");
        act.node.classList.remove("flag-pined");
      }
      act.mapping = null;
    },
    eraseMapping: function(mapping) {
      var vm = this;
      mapping.leftActs.forEach(function(act) {
        vm.eraseActivity(act);
      });
      mapping.rightActs.forEach(function(act) {
        vm.eraseActivity(act);
      });
    },
    drawMapPinOnActivity: function(act) {
      act.node.classList.add("flag-pined");
      var pinWrapper = act.mapPinNode = document.createElement("div");
      pinWrapper.className = "pn-map-pin";
      act.node.appendChild(pinWrapper);

      var pinIcon = document.createElement("i");
      pinIcon.className = "icon-flag";
      pinWrapper.appendChild(pinIcon);

      var label = document.createElement("label");
      label.className = "pn-map-pin-label";
      label.innerHTML = act.mapping.order;
      pinWrapper.appendChild(label);
    },
    drawMapping: function(mapping) {
      var vm = this;
      mapping.leftActs.forEach(function(act) {
        vm.drawMapPinOnActivity(act);
      });
      mapping.rightActs.forEach(function(act) {
        vm.drawMapPinOnActivity(act);
      });
    },
    convertMappingListToAPIFormat: function() {
      var vm = this;
      // convert the vm.mappingList to the format backend API required
      var formatedMappingList = [];
      vm.mappingList.forEach(function(map) {
        map.leftActs.forEach(function(leftAct) {
          map.rightActs.forEach(function(rightAct) {
            formatedMappingList.push({
              sourceName: leftAct._title,
              targetName: rightAct._title,
              order: map.order
            });
          });
        });
      });

      return formatedMappingList;
    },
    saveMapping: function() {
      var vm = this;
      // convert the vm.mappingList to the format backend API required
      vm.isMapping = false;

      var formatedMappingList = vm.convertMappingListToAPIFormat();


      var postBody = {
        sourceId: vm.$store.getters.processSelection.processAnalyticsId,
        targetId: vm.industryConf.data.id,
        mappings: formatedMappingList.concat(vm.retainMappingList)
      };

      var id = UUIDGenerator.purchase();
      eventHub.$emit("start-mini-loader", { id: id });
      eventHub.$emit("loading-data-in-tile", { id: vm.$props.tileId, loadId: id });

      var successHandler = function(res) {

        eventHub.$emit("finish-mini-loader", { id: id });
        eventHub.$emit("loaded-data-in-tile", { id: vm.$props.tileId, loadId: id });
        vm.changePNchartIsMapping();
        vm.variantConf.opts.enabledTooltipLinkage = false;
        setTimeout(() => {

          vm.fetchRemoteMappingList(vm.$store.getters.processSelection.processAnalyticsId, vm.industryConf.data.id);
        }, 500)



        if (vm.variantKpiConf.opts && vm.variantKpiConf.opts.actions && vm.variantKpiConf.opts.actions.length == 3) {
          vm.variantKpiConf.opts.actions[0].hide = false;
          vm.variantKpiConf.opts.actions[1].hide = true;
          vm.variantKpiConf.opts.actions[2].hide = true;
        }

        // need to call api to refresh the kpi data
        Noty.alertWithTwoButtons({
          text: "<br/>Saved mapping successfully. Do you want to recalculate the KPIs(cycle time, first pass yield and compliance) for current process right now?<br/><br/>",
          btn1text: "Yes. Now",
          btn1onclick: function() {
            vm.refreshKpiData();
          },
          btn2text: "No. Later",
          btn2class: 'btn btn-black'
        });
      };

      var errorHandler = function(err) {

        vm.changePNchartIsMapping();
        vm.variantConf.opts.enabledTooltipLinkage = false;
        setTimeout(function() {
          vm.fetchRemoteMappingList(vm.$store.getters.processSelection.processAnalyticsId, vm.industryConf.data.id);
        }, 500)

        eventHub.$emit("finish-mini-loader", { id: id });
        eventHub.$emit("loaded-data-in-tile", { id: vm.$props.tileId, loadId: id });
        Noty.notifyError({
          text: '<p>Failed to save mapping.</p>'
        });
      };

      if (!vm.remoteMappingId) {
        processMappingApi.saveProcessMapping(vm.customerId, vm.customerName, postBody).then(successHandler, errorHandler);
      } else {
        postBody.id = vm.remoteMappingId;
        processMappingApi.updateProcessMapping(vm.customerId, vm.customerName, postBody).then(successHandler, errorHandler);
      }

    },
    setupMapping: function() {
      var vm = this;
      var newMapping = {
        id: UUIDGenerator.purchase(),
        order: vm.currentMappingOrder,
        leftActs: vm.unMappedLeftActs.splice(0),
        rightActs: vm.unMappedRightActs.splice(0)
      };
      newMapping.leftActs.forEach(function(act) {
        act.mapping = newMapping;
      });
      newMapping.rightActs.forEach(function(act) {
        act.mapping = newMapping;
      });
      vm.mappingList.push(newMapping);
      vm.drawMapping(newMapping);

      if (vm.absentMappingOrders.indexOf(vm.currentMappingOrder) > -1) {
        vm.absentMappingOrders.splice(vm.absentMappingOrders.indexOf(vm.currentMappingOrder), 1);
      }
      if (vm.absentMappingOrders.length > 0) {
        vm.currentMappingOrder = vm.absentMappingOrders.pop();
      } else {
        vm.currentMappingOrder = vm.mappingList.length + 1;
      }
      vm.showConfirmModal = false;
    },
    cancelSetupMapping: function() {
      this.showConfirmModal = false;
    },
    closeKpiDetail: function() {
      eventHub.$emit('close-kpi-detail', { id: this.variantKpiConf.opts.id });
    },
    onChangedVariant: function(args) {
      if (TypeChecker.isArray(args.variantData) && TypeChecker.isNumber(args.selectedBarCount) && args.variantData.length >= args.selectedBarCount) {
        var theVariant = args.variantData[args.selectedBarCount - 1];
        this.innerDataFilters.variant = Object.assign({}, theVariant);
      }
    },
    cancelLoadData: function(args) {
      var vm = this;
      if (args.id == this.$props.tileId) {
        if (TypeChecker.isFunction(vm.kpiAggregatorCancelFunc)) {
          vm.kpiAggregatorCancelFunc.call(vm);
        }
        if (TypeChecker.isFunction(vm.kpiDetailCancelFunc)) {
          vm.kpiDetailCancelFunc.call(vm);
        }
        if (TypeChecker.isFunction(vm.variantCancelFunc)) {
          vm.variantCancelFunc.call(vm);
        }
        eventHub.$emit("finish-mini-loader", { id: vm.kpiAggregatorLoadId });
        eventHub.$emit("finish-mini-loader", { id: vm.kpiDetailLoadId });
        eventHub.$emit("finish-mini-loader", { id: vm.variantLoadId });
      }
    },
    cancelLoadFromMiniLoader: function(args) {
      var vm = this;
      if (args.id == vm.kpiAggregatorLoadId) {
        if (TypeChecker.isFunction(vm.kpiAggregatorCancelFunc)) {
          vm.kpiAggregatorCancelFunc.call(vm);
        }
      }
      if (args.id == vm.kpiDetailLoadId) {
        if (TypeChecker.isFunction(vm.kpiDetailCancelFunc)) {
          vm.kpiDetailCancelFunc.call(vm);
        }
      }
      if (args.id == vm.variantLoadId) {
        if (TypeChecker.isFunction(vm.variantCancelFunc)) {
          vm.variantCancelFunc.call(vm);
        }
      }
    },
    resetSelection: function() {
      var vm = this;
      vm.showSelection = true;
      vm.isMapping = false;
      vm.variantConf.opts.enabledTooltipLinkage = false;
      vm.changePNchartIsMapping();
      vm.clearMapping();

      eventHub.$emit('need-to-change-comparison-process');
      eventHub.$emit("end-mapping-process");

      if (vm.variantKpiConf.opts && vm.variantKpiConf.opts.actions && vm.variantKpiConf.opts.actions.length == 3) {
        vm.variantKpiConf.opts.actions[0].hide = false;
        vm.variantKpiConf.opts.actions[1].hide = true;
        vm.variantKpiConf.opts.actions[2].hide = true;
      }
    },
   windowResized: function(args) {
      var vm = this;
      if (args.id == this.$props.tileId) {
        setTimeout(function(){
        vm.fetchRemoteMappingList(vm.$store.getters.processSelection.processAnalyticsId, vm.industryConf.data.id);
        },500)

      }
    },
  },
  created() {
    eventHub.$on("changed-global-filters", this.onChangedFilters);
    eventHub.$on("changed-process-to-compare", this.onChangedProcessToCompare);
    eventHub.$on("changed-process-variant", this.onChangedVariant);
    eventHub.$on("cancel-load-data-in-tile", this.cancelLoadData);
    eventHub.$on("cancel-loaing-from-mini-loader", this.cancelLoadFromMiniLoader);
    eventHub.$on("tile-window-resized", this.windowResized);

    var vm = this;
    this.variantConf.awareChartInstance = function(chartInstance) {
      vm.variantChart = chartInstance;
    };
    this.industryConf.awareChartInstance = function(chartInstance) {
      vm.industryChart = chartInstance;
    };

    this.customerName = this.$store.getters.processSelection.customer.name;
    this.customerId = this.$store.getters.processSelection.customerId;
  },
  mounted: function() {
    var vm = this
    this.init();
    this.variantConf.opts.onClickTransition = function(t) {
      vm.touchOnActivity(t);
    };
    this.industryConf.opts.onClickTransition = function(t) {
      vm.touchOnActivity(t);
    };


    this.industryKpiConf.data = { cycleTime: 8 * 24 * 3600, firstPassYield: 0.55, compliance: 0.92 };
    this.industryKpiConf.opts = {
      id: CommonGenerators.UUIDGenerator.purchase(),
      standard: true,
      desc: 'Click on a process activity and click on an activity in the comparing process to set up the activity linkage.',
      actions: [{
        title: "Change Process",
        fn: function() {
          vm.resetSelection();

          // 28-7-2017: Azhaziq - Recipe Id Removal when user select change process
          eventHub.$emit('apply-global-filters', {
            src: 'comparison',
            recipeId: ""
          });
        }
      }]
    };

    this.variantKpiConf.opts = {
      id: CommonGenerators.UUIDGenerator.purchase(),
      desc: 'Click on a process activity and click on an activity in the comparing process to set up the activity linkage.',
      actions: [{
        title: "Map the Activities",
        hide: false,
        fn: function() {
          vm.toMapActivities();
        }
      }, {
        title: "Save Mapping",
        hide: true,
        fn: function() {
          vm.saveMapping();
        }
      }, {
        title: "Reset",
        hide: true,
        fn: function() {
          vm.clearMapping();
        }
      }],
      detailToggle: {
        toggle: function(expand) {
          vm.showKpiDetail = expand;
          if (vm.showKpiDetail) {
            vm.kpiDetailData = null;
            vm.retrieveDataForDetailKpi();
            eventHub.$emit('hide-kpi-caption', { id: vm.industryKpiConf.opts.id });
          } else {
            eventHub.$emit('show-kpi-caption', { id: vm.industryKpiConf.opts.id });
          }
        },
        expand: false
      }
    };
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }

    eventHub.$off("changed-global-filters", this.onChangedFilters);
    eventHub.$off("changed-process-to-compare", this.onChangedProcessToCompare);
    eventHub.$off("changed-process-variant", this.onChangedVariant);
    eventHub.$off("cancel-load-data-in-tile", this.cancelLoadData);
    eventHub.$off("cancel-loaing-from-mini-loader", this.cancelLoadFromMiniLoader);
  }
}
