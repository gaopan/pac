import shared from "@/shared.js"
import Store from "@/store"
import CommonUtils from "@/utils/common-utils.js"
import TypeChecker from '@/utils/type-checker.js'
import ErrorHandler from '@/utils/error-handler.js';
import CommonGenerators from '@/utils/common-generators.js'

import DFInfoBar from "./dynamic-filter-info-bar/dynamic-filter-info-bar.vue"
import DFPanel from "./dynamic-filter-panel/dynamic-filter-panel.vue"
import DFAddFilter from "./dynamic-filter-add-filter/dynamic-filter-add-filter.vue"
import DFServices from "./dynamic-filter-services.js"
import DFUtils from "./dynamic-filter-utils.js"
import q from '@/api/q.js';
import DynamicFilterApi from '@/api/process-mining.js';
import DataMapApi from '@/api/onboarding.js'

import { attributeDataModel } from './dynamic-filter-add-filter/attribute/attribute-data-model.js';

let eventHub = shared.eventHub
let UUIDGenerator = CommonGenerators.UUIDGenerator

export default {
  name: 'dynamic-filter',
  data() {
    return {
      isShowDFPanel: false,
      isShowAddFilterDetails: false,
      isEnableAttributeTab: false
    }
  },

  components: {
    'df-info-bar': DFInfoBar,
    'df-panel': DFPanel,
    'df-add-filter': DFAddFilter
  },

  created() {
    eventHub.$on("showDFPanel", this.showDFPanel);
    eventHub.$on('showDFPanelChangeItem', this.showDFPanel);
    eventHub.$on("closeDFPanel", this.closeDFPanel);
    eventHub.$on("showAddFilterDetails", this.showAddFilterDetails);
    eventHub.$on("closeAddFilterDetails", this.closeAddFilterDetails);
    eventHub.$on("showThisAddFilterDetails",this.showAddFilterDetails);
    eventHub.$on('selectFilterSets',this.showAddFilterDetails);
    eventHub.$on('showDFFilterPanel', this.showDFFilterPanel);

    // 21 March 2018: pan.gao@hpe.com - Added the loading mask
    // 3 April 2018: muhammad-azhaziq.bin-mohd-azlan-goh@dxc.com - Move the loading mask up
    let loadId = UUIDGenerator.purchase();

    eventHub.$emit("start-mini-loader", { id: loadId, roughTime: 1000 * 10 });

     // 3 April 2018: muhammad-azhaziq.bin-mohd-azlan-goh@dxc.com - Make the initialize of dynamic filter synchronous
    this.populateHistoryData().then((res) => {
      this.fnIsHaveAttributeFilter().then((res) => {
        this.emitApplyData().then((res)=>{
          eventHub.$emit("finish-mini-loader", { id: loadId });
        })
      })
    });
  },
  methods: {
    fnIsHaveAttributeFilter() {
      //12 Feb 2018: adib.ghazali@hpe.com - US #1980 - Show/Hide Attribute filter
      var defer = q.defer();
      let vm = this;

      let customerId = Store.getters.processSelection.customerId,
          processAnalyticsId = Store.getters.processSelection.processAnalyticsId;
      
      //17 April 2018: adib.ghazali@dxc.com - Dynamic Filter - Attribute (New data model)
      DataMapApi.getAllAttributes(customerId, processAnalyticsId).then( (res) => {

        if(!TypeChecker.isNull(res.data.list)) {

          let attributesList = [];

          for (let data of res.data.list) {

            let fieldType = null,
                isBoolean = false,
                type = data.type.toString().toLowerCase();

            if(type) {

                switch(type) {
                    
                    case 'boolean':

                        fieldType = 'string';
                        isBoolean = true;
                        break;

                    case 'double':
                    case 'long':
                    case 'float':
                        
                        fieldType = 'number';
                        break;

                    case 'date':
                        
                        fieldType = 'date';
                        break;

                    default:

                        fieldType = 'string';

                }

            }

            if(data.name !== 'caseId' && data.level !== 'ACTIVITY') {

                let attributeObject = new attributeDataModel().model;

                attributeObject.field = data.name; //key for BE <==> FE
                attributeObject.fieldLabel = vm.$options.filters.camelToTitleCase(data.name); //Displayed on UI
                attributeObject.fieldType = fieldType;

                attributesList.push(attributeObject);
                
            }
            
          }

          if(attributesList.length > 0) {
            vm.isEnableAttributeTab = true;
          }

          DFServices.saveAttributesList(attributesList);

        }

        defer.resolve({ status: 'success',message: 'Checking Attribute Exists Finish' });

      }, (err) => {
        ErrorHandler.handleApiRequestError(err);
        console.error(err);
        defer.resolve({ status: 'error',message: err });
      });

      return defer.promise;
    },

    showDFPanel() {
      this.isShowDFPanel = true;
      //this.isLoading = true;
      this.isShowAddFilterDetails = false;
      eventHub.$emit("enableApplyFilterBtn", false);
      eventHub.$emit("removeHighlightedItem");
      // 2017-12-5 Liao Fang: always ignore currentFilters , just use appliedFilter
    },

    closeAddFilterDetails(){
      this.isShowAddFilterDetails = false;
    },

    showAddFilterDetails() {
      this.isShowAddFilterDetails = true;
      this.isShowDFPanel = false;
      eventHub.$emit('enableApplyFilterBtn',true);
    },

    closeDFPanel() {
      this.isShowAddFilterDetails = false;
      this.isShowDFPanel = false;
    },

    showDFFilterPanel() {
      this.isShowDFPanel = true;
      this.isShowAddFilterDetails = false;
      eventHub.$emit("removeHighlightedItem");
    },

    // Azhaziq - 17/11/2017 - Add Process Analytic Id
    emitApplyData(){
      
      var defer = q.defer();

      let metadata = {
        fileName: this.$store.getters.processSelection.fileName,
        customerId: this.$store.getters.processSelection.customerId,
        recipeId: '',
        processAnalyticsId: this.$store.getters.processSelection.processAnalyticsId
      };
      
      let appliedFiltersPromise = DFServices.getAppliedFilters(metadata.processAnalyticsId);
      
      appliedFiltersPromise.then((res) => {
        let appliedFilter;

        if(res.empty){
          appliedFilter = DFUtils.setGblDfDataModel();
        } else {
          appliedFilter = CommonUtils.deepClone(res.data);
          metadata.recipeId = appliedFilter.recipeId;
        }

        eventHub.$emit('setGlobalFilter',appliedFilter); 
        eventHub.$emit('activityStatus', appliedFilter);
        let emitObj = DFUtils.getEmitModel(metadata,appliedFilter.value);
        setTimeout(() => {
           eventHub.$emit('changed-global-filters', emitObj);
           defer.resolve({ status: 'success',message: 'Apply Filter Data Success' });
        },0);
      },(res) => {
        defer.resolve(res);
      })

      return defer.promise;
    },
    //faiz-asyraf.abdul-aziz@hpe.com - To populate history filters from the VueX store and shared across components
    populateHistoryData() {

      var defer = q.defer();

      let processAnalyticsId = this.$store.getters.processSelection.processAnalyticsId;
      DFServices.getHistoryFilters(processAnalyticsId).then((res) => {
        defer.resolve(res);
      },(res) => { console.err(err); defer.resolve(res); })

      return defer.promise;
    },
    onPropagateFilter(){
      this.emitApplyData();
    },

    clearAllFilterInfo(){
      DFServices.saveAppliedFilters(null);
    },
  },
  beforeDestroy(){
    eventHub.$off("showDFPanel");
    eventHub.$off("closeDFPanel");
    eventHub.$off("showAddFilterDetails");
    eventHub.$off("closeAddFilterDetails");
    eventHub.$off("showThisAddFilterDetails");

    DFServices.saveAttributesList(null);

    this.clearAllFilterInfo();
  },
  watch: {
    $route: function(to,from){
      this.emitApplyData();
    }
  },
  filters: {
    camelToTitleCase: function(val) {
      let result = val.replace(/([A-Z])/g, " $1");
      return result.charAt(0).toUpperCase() + result.slice(1);
    }
  }
}