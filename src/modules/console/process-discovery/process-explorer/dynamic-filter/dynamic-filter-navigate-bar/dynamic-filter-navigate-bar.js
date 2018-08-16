import shared from "@/shared.js"
import CommonUtils from "@/utils/common-utils.js";
import Store from '@/store';
import DfServices from "../dynamic-filter-services.js"
import DfUtils from "../dynamic-filter-utils.js"
import Noty from '@/utils/noty-operation.js';
import LeapDropupdown from "@/components/leap-dropupdown/LeapDropupdown.vue"
import DynamicFilterSaveAs from "./dynamic-filter-saveAs/DynamicFilterSaveAs.vue"
import DynamicFilterSavedFilter from "./dynamic-filter-savedFilter/DynamicFilterSavedFilter.vue"
import Modal from '@/components/modal/Modal.vue';
import TypeChecker from '@/utils/type-checker.js';
import _ from 'lodash';
import Internationalization from '@/utils/internationalization.js'

var eventHub = shared.eventHub;

export default {
  name: 'dynamic-filter-navigate-bar',

  props: {
    applyFilter: {
      type: Boolean
    },
    filterData: {
      type: Array
    },
    localCurrentFilter: {
      type: Object
    }
  },

  components: {
    'leap-dropupdown': LeapDropupdown,
    'dynamic-filter-save-as': DynamicFilterSaveAs,
    'dynamic-filter-saved-filter': DynamicFilterSavedFilter,
    Modal
  },

  data() {
    return {
      isShowAddFilterDetails: false,
      isSavedFilterEmpty: true,
      showComfirmPanel: false,
      navBarFilterData: [],
      showSaveAs: false,
      showSavedFilter: false,
      savedFilterMenuStyle: {},
      currentDropUpOrigin: undefined,
      showModalSavedFilter: false,
      showModalNoFilterResult: false,
      duplicateFilters: [],
      filter: {
        name: '',
        fav: false
      },
    }
  },
  computed: {
    savedFilters: function() {
      return this.$store.getters.getSavedFilters || [];
    },
    //faiz-asyraf.abdul-aziz@hpe.com - to make the history filters order by descending based on modified date
    sortHistoryFilters: function() {
        let historyFilters = CommonUtils.deepClone(this.historyFilters);
        return historyFilters.sort((a,b)=>  {
          return b.modifiedOn - a.modifiedOn;
        });
    },
    //faiz-asyraf.abdul-aziz@hpe.com - get history filters from the Vue X store
    historyFilters: function() {
      return this.$store.getters.getHistoryFilters || [];
    },
    currentAppliedFilter: function(){

      let currentChosenFilter = Internationalization.translate('No Selection');

      for(var key in this.$store.getters.getSavedFilters){
        if(this.$store.getters.getSavedFilters[key].active){
          currentChosenFilter = this.$store.getters.getSavedFilters[key].name;
        }
      }

      return currentChosenFilter;
    },
    isHaveFilterValue: function() {
       //12.10.2017: adib.ghazali@hpe.com - to disable/enable dropdown (file name)
       if(this.$props.localCurrentFilter) {
         return (this.$props.localCurrentFilter.value.length > 0) ? true: false;
       } else {
         return false;
       }
    },
    //for save icon
    isEnableSaveIcon: function() {
      //25 Jan 2018: adib.ghazali@hpe.com - enable when data from saved tab and user did some changes.
      
      //faiz-asyraf.abdul-aziz@hpe.com - enable/disable if any changes on the existing saved filters
      let isEnable = false;

      //check if the filters is empty
      let emptyFilters = this.isEmptyFilters();
      
      //check if the localCurrentFilter has been initialized
      if(this.$props.localCurrentFilter) {
        //get the type of filter
        let typeOf = CommonUtils.deepClone(this.$props.localCurrentFilter.typeOf);
        let currentLocalFilter = CommonUtils.deepClone(this.$props.localCurrentFilter);
        let isFilterChange = false;

        //check if the savedFilters from the have been initialized
        if (this.$store.getters.getSavedFilters) {
          let savedFilters = this.$store.getters.getSavedFilters;
          if (savedFilters) {

            let filterFromStore = {};
            savedFilters.filter(save => {
              if (save.name === currentLocalFilter.name) {
                filterFromStore= CommonUtils.deepClone(save);
              }
            });

            //check if current filters is different with the one on the store
            if (filterFromStore) {
              isFilterChange = _.isEqual(currentLocalFilter.value, filterFromStore.value);
            }
            
          }
        }
        if (typeOf == 'saved' && !emptyFilters && !isFilterChange) {
          isEnable = true;
        
        } 
        
      }

      return isEnable;

    },
    saveIconError() {
      if (this.$props.localCurrentFilter) {
        let typeOf = CommonUtils.deepClone(this.$props.localCurrentFilter.typeOf);
        let emptyFilters = this.isEmptyFilters();
        if (typeOf != 'saved') {
          return 'You need to save as the filter first';
        }
        else if (emptyFilters) {
          return 'The filters can\'t be saved due to contain empty filters';
        } else {
          return 'No changes detected!';
        }
      }
    },
    //faiz-asyraf.abdul-aziz@hpe.com - enable save as button when the filters do not have empty filters
    isEnableCopyIcon: function () {

      let isEnable = false;
      let emptyFilters = this.isEmptyFilters();

      if (this.$props.localCurrentFilter) {

        // let typeOf = CommonUtils.deepClone(this.$props.localCurrentFilter.typeOf);

        if (!emptyFilters) {
          isEnable = true;

        }

      }

      return isEnable;

    },
    //faiz-asyraf.abdul-aziz@hpe.com - Show error message why the save as button is disable
    copyIconError() {
      let emptyFilters = this.isEmptyFilters();

      if (this.$props.localCurrentFilter) {
        if(emptyFilters) {
          return 'The filters can\'t be saved due to contain empty filters';
        }
      }

    }
  },
  created() {
    this.isShowAddFilterDetails = this.applyFilter;
    this.saveAsData = DfUtils.getSaveAsFilterDataModel();
    eventHub.$on('enableApplyFilterBtn', this.enableApplyFilterBtn);
    eventHub.$on('resetHistoryActiveToFalse', this.resetHistoryActiveToFalse);
    eventHub.$on('resetSaveActiveToFalse', this.resetSaveActiveToFalse);
  },
  methods: {
    closePanel() {

      let appliedFilter = this.$store.getters.getAppliedFilter;
      //19 Dec 2017 - adib.ghazali@hpe.com - Defect #3139
      if(TypeChecker.isObject(appliedFilter)) {
        if(TypeChecker.isUndefined(appliedFilter.name)) {
          let histFilters = CommonUtils.deepClone(this.historyFilters);
          let saveFilters = CommonUtils.deepClone(this.savedFilters);

          _.find(saveFilters, function (obj) {
            obj.active = false;
          })
          _.find(histFilters, function (obj) {
            obj.active = false;
          })
          if (histFilters.length > 0) {
            DfServices.saveHistoryFilterRecipe(histFilters);
          }
          if (saveFilters.length > 0) {
            DfServices.saveFilterRecipe(saveFilters);
          }  

          DfServices.saveActiveAttribute(null);

          eventHub.$emit("closeDFNavigationBar");
          eventHub.$emit("closeDFPanel");

        } else {
          let selected = appliedFilter.name;

          if(selected == this.currentAppliedFilter) {

            eventHub.$emit("closeDFPanel");

          } else {

            DfServices.saveActiveAttribute(null);

            let tempSavedFilters = [], idx = null;

            if (appliedFilter.typeOf === 'history') {
              tempSavedFilters = CommonUtils.deepClone(this.historyFilters);
            } else if (appliedFilter.typeOf === 'saved') {
              tempSavedFilters = CommonUtils.deepClone(this.savedFilters);
            } else {
              tempSavedFilters.push(CommonUtils.deepClone(appliedFilter));
            }
            
            _.find(tempSavedFilters, function (obj, index) {
              if (obj.name == selected) {

                idx = index;
                obj.active = true;

              } else {
                obj.active = false;

              }
            }); 

            if (appliedFilter.typeOf === 'history') {
              DfServices.saveHistoryFilterRecipe(tempSavedFilters);
            } else if (appliedFilter.typeOf === 'saved'){
              DfServices.saveFilterRecipe(tempSavedFilters);
            }

            eventHub.$emit('changeFilterSets',tempSavedFilters[idx]);
            eventHub.$emit("closeDFPanel");

          }
          
        }

      }

    },

    removeAllFilter() {
      this.showComfirmPanel = true;
    },

    saveAsToggle(){
      this.showSavedFilter = false;
      this.showSaveAs = !this.showSaveAs;
      this.showSaveAs ? this.currentDropUpOrigin = this.$refs.saveAsToggle : this.currentDropUpOrigin = undefined;
    },

    savedFilterToggle(){
      this.showSaveAs = false;
      this.showSavedFilter = !this.showSavedFilter;
      this.showSavedFilter ? this.currentDropUpOrigin = this.$refs.savedFilterToggle : this.currentDropUpOrigin = undefined;
    },

    // deleteSavedFilter(){
      
    //   var tempSavedFilters = CommonUtils.deepClone(this.savedFilters);

    //   var fltrIdx = tempSavedFilters.findIndex((arr)=>{
    //     if(arr.active){
    //       return true;
    //     } else {
    //       return false;
    //     }
    //   })

    //   if(fltrIdx > -1){

    //     let deletedItem = tempSavedFilters.splice(fltrIdx,1);

    //     DfServices.persistFilterRecipe(deletedItem[0].id,'delete').then((res)=>{

    //       if(tempSavedFilters.length > 0){
    //         let lastIdx = tempSavedFilters.length - 1;

    //         tempSavedFilters[lastIdx].active = true;

    //         eventHub.$emit('changeFilterSets',tempSavedFilters[lastIdx]);

    //       } else {
            
    //         deletedItem[0].active = false;
    //         deletedItem[0].fav = false;
    //         deletedItem[0].name = '无标题';

    //         eventHub.$emit('changeFilterSets',deletedItem[0]);
    //       }

    //       DfServices.saveFilterRecipe(CommonUtils.deepClone(tempSavedFilters));

    //     });
    //   }

    //   this.showSavedFilter = false;
    // },

    cancelRemoveAllFilter() {

      this.showComfirmPanel = false;
    },

    confirmRemoveAllFilter() {

      this.showComfirmPanel = false;
      this.navBarFilterData = [];

      //25 Jan 2018: adib.ghazali@hpe.com - didn't use current filters already
      // DfServices.saveCurrentFilters(null);
      
      eventHub.$emit("deleteAllAddFilterDetails");
      eventHub.$emit("removeAllFilter", this.navBarFilterData);
      eventHub.$emit("closeAddFilterDetails");
      eventHub.$emit("showDFPanel");
      // -- disable Apply Filter btn
      eventHub.$emit("enableApplyFilterBtn", false);

      eventHub.$emit("removeHighlightedItem");
    },

    clickApplyFilter() {
      eventHub.$emit("applyFilter");
      eventHub.$emit("closeDFPanel");
      eventHub.$emit("closeAddFilterDetails");

    },
    resetActive(filterToReset) {
      let filters = CommonUtils.deepClone(filterToReset);
      for (var key in filters) {
        filters[key].active = false;
      }

      DfServices.saveFilterRecipe(CommonUtils.deepClone(filters));
    },
    resetSaveActiveToFalse() {
      let filters = CommonUtils.deepClone(this.savedFilters);
      filters.map(val => {
        val.active = false;
      });

      DfServices.saveFilterRecipe(CommonUtils.deepClone(filters));
    },
    resetHistoryActive(filterToReset) {
      let filters = CommonUtils.deepClone(filterToReset);
      for (var key in filters) {
        filters[key].active = false;
      }

      DfServices.saveHistoryFilterRecipe(CommonUtils.deepClone(filters));
    },
    resetHistoryActiveToFalse() {
      let filters = CommonUtils.deepClone(this.historyFilters);
      filters.map(val => {
        val.active = false;
      });
      DfServices.saveHistoryFilterRecipe(CommonUtils.deepClone(filters));
    },
      
    //faiz-asyraf.abdul-aziz@hpe.com: apply filter new logic to handle the history filter and apply filter
    clickApplyFilterNewLogic() {
      //get current filter value
      let currentLocalCurrentFilter = CommonUtils.deepClone(this.$props.localCurrentFilter);

      //get saved filter value
      let tempSavedFilters = CommonUtils.deepClone(this.savedFilters);

      //status to indicate whether to apply the filter or not
      let applyFilterPermission = false;

      //status to indicate whether to create new history filter or not
      let saveIntoHistoryPermission = false;

      //set the filter typeof to history
      let typeOfFilter = 'history';

      //check whether there is any duplicate filter
      let filterUnique = false;

      //get the local current filter name
      // let changeFilterName = CommonUtils.deepClone(this.$props.localCurrentFilter.name);
      //check the filter type
      if(currentLocalCurrentFilter.typeOf.toLowerCase() === 'saved') {
        // changeFilterName = 'Copy of ' + changeFilterName;
        typeOfFilter = 'saved';
      }

      //check current filter has been change.
      let filterChange = this.checkIfAnyChangeOnTheFilter(typeOfFilter);

      //to check the status of current filter
      if (filterChange === false) {
       applyFilterPermission = true;
      } else if (filterChange){
          applyFilterPermission = true;
          saveIntoHistoryPermission = true;
        
     }

     //check the permission to store filter in the history filter
      if (saveIntoHistoryPermission && applyFilterPermission) {
        //call populateHistoryFilterName to populate the new filter name
        let newFilterName = this.populateHistoryFilterName();

        //check if the filter is from saved filter
        //If true: then set the derivedFromId to the new created history filter
        if (currentLocalCurrentFilter.typeOf =='saved') {
          currentLocalCurrentFilter.derivedFromId = CommonUtils.deepClone(currentLocalCurrentFilter.id);
        }

        //set current filterName to the new populated filter name
        currentLocalCurrentFilter.name = newFilterName;

        //set the type of filter to be history
        currentLocalCurrentFilter.typeOf = 'history';
        let metadata = {
          fileName: this.$store.getters.processSelection.fileName,
          processAnalyticsId: this.$store.getters.processSelection.processAnalyticsId,
          fVal: currentLocalCurrentFilter,
        };

        //clone the history filters
        let historyFilters = CommonUtils.deepClone(this.historyFilters);
        // historyFilters.push(CommonUtils.deepClone(currentLocalCurrentFilter));

        //code to call api to store the new history filter
        DfServices.persistHistoryFilterRecipe(metadata, 'new').then((res) => {
            //remove all the active from current history filters
            for (var key in this.historyFilters) {
              
                historyFilters[key].active = false;
            }

            //set current local filter to be active
            currentLocalCurrentFilter.active = true;
          //get the id of newly created history filter
          currentLocalCurrentFilter.id = res.id;

          //get the latest modified date for the newly created history filter
          currentLocalCurrentFilter.modifiedOn = res.modifiedOn;

          //push the new value of current local filter into current array
          historyFilters.push(CommonUtils.deepClone(currentLocalCurrentFilter));
          //sort the filter by date descending
        //  historyFilters.sort((a, b) => {
        //     return Date.parse(b.modifiedOn) - Date.parse(a.modifiedOn);
        //   });
          //saved the new list of history filter to the vuex store
          DfServices.saveHistoryFilterRecipe(CommonUtils.deepClone(historyFilters));
          this.onApplyFilter(tempSavedFilters, currentLocalCurrentFilter);
        });
      }
      //check the permission to apply the filter
      else if (applyFilterPermission && !saveIntoHistoryPermission) {
        this.onApplyFilter(tempSavedFilters, currentLocalCurrentFilter);
       
      }

    },
    //faiz-asyraf.abdul-aziz@hpe.com - new apply filter logic
    onApplyFilter(tempSavedFilters, currentLocalCurrentFilter ) {
      //clone the history filters
      let historyFilters = CommonUtils.deepClone(this.historyFilters);
      //get the index of current local 
      let index = historyFilters.findIndex(val => val.name === currentLocalCurrentFilter.name);

      //check if the filter type is equal to history
      if (currentLocalCurrentFilter.typeOf != 'saved') {

        //reset active on saved filters
        this.resetActive(tempSavedFilters);

        //reset history filters active status to false except the selected one
        for (var key in this.historyFilters) {
          if (historyFilters[key].name != currentLocalCurrentFilter.name) {
            historyFilters[key].active = false;
          } else {
            historyFilters[key].active = true;
          }
        }
        let metadata = {
          fileName: this.$store.getters.processSelection.fileName,
          processAnalyticsId: this.$store.getters.processSelection.processAnalyticsId,
          fVal: currentLocalCurrentFilter
        };
        //call api to update the filter modifiedOn value, as to sort the filter based on the latest applied
        DfServices.persistHistoryFilterRecipe(metadata, 'update').then((res) => {

          //update the modifiedOn date value on the selected filter from history filter
          historyFilters.map(fil => {
            if (fil.id === res.data.id) {
              fil.modifiedOn = res.data.modifiedOn;
            }
          });
          //update the latest update history filter on vuex store.
          DfServices.saveHistoryFilterRecipe(CommonUtils.deepClone(historyFilters));
        });
      }
      //call event hub to tell about the filter change
      eventHub.$emit("applyFilterChange", currentLocalCurrentFilter);
      //click to apply the filter
      this.clickApplyFilter();
    },

    //faiz-asyraf.abdul-aziz@hpe.com: function to check if any change on the current filter
    //arguments: type of filter, to check the filter falll within which filter list
    checkIfAnyChangeOnTheFilter(typeOfFilter) {
      //clone current local filter
      let currentLocalCurrentFilter = CommonUtils.deepClone(this.$props.localCurrentFilter);

      //variable to store the selected filter
      let selectedFilter = {};

      //check the filter type either saved or history
      if(typeOfFilter.toLowerCase() === 'saved') {
        let savedFilters = CommonUtils.deepClone(this.savedFilters);
      savedFilters.map(val => {
          if (val.name === currentLocalCurrentFilter.name) {

            selectedFilter = CommonUtils.deepClone(val);
          }
        });
      }
      else {
        let historyFilters = CommonUtils.deepClone(this.historyFilters);
        historyFilters.map(val => {
          if (currentLocalCurrentFilter.name === val.name) {
            selectedFilter = _.clone(val);
          }
        });

        
      }
     
      if (_.isEmpty(selectedFilter)) {
          return true;
      }
     let status = true;
      if (_.isEqual(currentLocalCurrentFilter.value, selectedFilter.value)) {
       status = false;
     }
      if (status === false) {
          return false;
          
      } else {
          return true;
        }
      
     
     
    },

    //faiz-asyraf.abdul-aziz@hpe.com - to populate history filter name
    populateHistoryFilterName() {
      let currentLocalCurrentFilter = CommonUtils.deepClone(this.localCurrentFilter);
      let historyFilters = CommonUtils.deepClone(this.historyFilters);
      let selectedFilter = [];
      if(currentLocalCurrentFilter.typeOf.toLowerCase() === 'saved') {
        currentLocalCurrentFilter.name = 'Copy Of ' + currentLocalCurrentFilter.name + ' - v';
      }else {
        if(currentLocalCurrentFilter.name.startsWith(Internationalization.translate('Untitled'))) {
          currentLocalCurrentFilter.name = Internationalization.translate('Untitled');
        }else {
          let tempFilterName = CommonUtils.deepClone(currentLocalCurrentFilter.name);
          let charIndex = tempFilterName.lastIndexOf('v');
          let characterToReplace = tempFilterName.substring(charIndex+1, tempFilterName.length);
          tempFilterName = tempFilterName.replace(characterToReplace, '');
          currentLocalCurrentFilter.name = tempFilterName;
        }
      }
      historyFilters.map(val => {
        if (val.name.startsWith(currentLocalCurrentFilter.name)) {
          selectedFilter.push(val.name);
        }
      });
      // let filterLastCount = selectedFilter.length + 1;
      let filterLastCount = 1;
      //get filter last count
      selectedFilter.sort();
      if (selectedFilter.length > 0) {
        let lastFilterName = selectedFilter[selectedFilter.length - 1];
        let charIndex = (currentLocalCurrentFilter.name.startsWith(Internationalization.translate('Untitled'))) ? lastFilterName.lastIndexOf(' ') :lastFilterName.lastIndexOf('v');
        let lastCount = lastFilterName.substring(charIndex + 1, lastFilterName.length);
        filterLastCount = parseInt(lastCount.trim()) + 1;
      }
     
      //end get filter last count
      // let filterLastCount = selectedFilter.length + 1;
      let tempFilterName = currentLocalCurrentFilter.name + ' ' + filterLastCount;
      // historyFilters.filter(val => {
      //   if (val.name === tempFilterName) {
      //     tempFilterName = currentLocalCurrentFilter.name + ' ' + (filterLastCount+1);
      //   }
      // });
      // currentLocalCurrentFilter.name = currentLocalCurrentFilter.name + ' ' + (selectedFilter.length + 1);
      currentLocalCurrentFilter.name = tempFilterName;
      return currentLocalCurrentFilter.name;
    },
    //12.10.2017: adib.ghazali@hpe.com - to enable/disable 'Apply Filter' button, icon-copy, & icon-reset
    enableApplyFilterBtn(status) {
       this.isShowAddFilterDetails = status;
    },

    onSaveAs(val){

      var tempSavedFilters = CommonUtils.deepClone(this.savedFilters);

      for (var key in tempSavedFilters){
        tempSavedFilters[key].active = false;

        val.fav ? tempSavedFilters[key].fav = false : null;
      }

      tempSavedFilters.push(val);

      DfServices.saveFilterRecipe(CommonUtils.deepClone(tempSavedFilters));
      let historyFilters = CommonUtils.deepClone(this.historyFilters);
      this.resetHistoryActive(historyFilters);

      eventHub.$emit('saveAsFilters',val);
      
      // this.saveAsToggle();
    },
    onSelectSavedFilter(selectedFilter){
      this.savedFilterToggle();

      if(this.applyFilter){
        
        eventHub.$emit('changeFilterSets',selectedFilter);

        if(selectedFilter.value.length == 0){
          eventHub.$emit("showDFPanel");
          eventHub.$emit("removeHighlightedItem");
          this.isShowAddFilterDetails = false;
        } 

      } else {

        selectedFilter.value.length > 0 ? eventHub.$emit('selectFilterSets') : null; 
        eventHub.$emit('changeFilterSets',selectedFilter);
      }   
    },

    onFavouriteSavedFilter(){
      let currentLf = this.savedFilters.find((arr)=>{
        if(arr.id == this.localCurrentFilter.id){
          return true;
        } else {
          return false;
        }
      })

      if(currentLf.fav != this.localCurrentFilter.fav){
        eventHub.$emit('setAsFav');
      }
    },
    //faiz: disable existing function
    // syncUpSavedFilter(applied){
    //   var activeFilterIdx = this.savedFilters.findIndex((arr)=>{
    //     if(arr.active == true){
    //       return true;
    //     } else {
    //       return false;
    //     }
    //   });      

    //   var tempSavedFilters = CommonUtils.deepClone(this.savedFilters);

    //   let arrayData = JSON.stringify(tempSavedFilters[activeFilterIdx]);
    //   let mainData = JSON.stringify(this.localCurrentFilter);

    //   if(arrayData != mainData){

    //     tempSavedFilters[activeFilterIdx] = CommonUtils.deepClone(this.localCurrentFilter);

    //     if(applied){
    //       for(var i = 0; i < tempSavedFilters.length; i++){
    //         if(i != activeFilterIdx){
    //           tempSavedFilters[i].applied = false;
    //         }
    //       }
    //     }

    //     let metadata = {
    //       fileName: this.$store.getters.processSelection.fileName,
    //       processAnalyticsId: this.$store.getters.processSelection.processAnalyticsId,
    //       fVal: tempSavedFilters[activeFilterIdx]
    //     };

    //     DfServices.persistFilterRecipe(metadata,'update').then((res)=>{
    //       // DfServices.saveFilterRecipe(CommonUtils.deepClone(tempSavedFilters));
    //     });
    //   }
    // },

    onCloseSaveAs(){
      this.showSaveAs = false;
    },

    onCloseSavedFilter(){
      this.showSavedFilter = false;
    },

    onCloseModal(modalType) {
      if (modalType === 'Saved') {
        this.showModalSavedFilter = false;
      } else {
        this.showModalNoFilterResult = false;
      }
    },

    saveAsFavourite() {
      this.$data.filter.fav = !this.$data.filter.fav;
    },

    //25 Jan 2018: adib.ghazali@hpe.com - when user click on Save Icon
    onClickSaveIcon() {
      //update the filter name
      let currentLocalCurrentFilter = CommonUtils.deepClone(this.$props.localCurrentFilter);
      let tempSavedFilters = CommonUtils.deepClone(this.savedFilters);
      let notEmptyFilters = this.checkEmptyFilters();

      //remove the empty filter on current filter
      currentLocalCurrentFilter.value = CommonUtils.deepClone(notEmptyFilters);
      
      let metadata = {
        fileName: this.$store.getters.processSelection.fileName,
        processAnalyticsId: this.$store.getters.processSelection.processAnalyticsId,
        fVal: currentLocalCurrentFilter
      };

      DfServices.persistFilterRecipe(metadata, 'update').then((res) => {
        Noty.notifySuccess({
          text: currentLocalCurrentFilter.name + ' updated successfully!'
        });
        for (var key in tempSavedFilters) {
          if (tempSavedFilters[key].name === currentLocalCurrentFilter.name) {
            tempSavedFilters[key] = CommonUtils.deepClone(currentLocalCurrentFilter);
          }
        }
        DfServices.saveFilterRecipe(CommonUtils.deepClone(tempSavedFilters));   
        eventHub.$emit("applyFilterChange", currentLocalCurrentFilter);
        // this.emit(localCurrentFilterChange
        // DfServices.saveFilterRecipe(CommonUtils.deepClone(tempSavedFilters));        
        // eventHub.$emit("applyFilter");
      });
    },

    //faiz-asyraf.abdul-aziz@hpe.com - check if the filters empty and return the status either true/false
    isEmptyFilters() {
      let currentLocalCurrentFilter = CommonUtils.deepClone(this.$props.localCurrentFilter);
      let emptyFilters = 0;
      let duplicateStatus = false;      
      if (currentLocalCurrentFilter) {
        currentLocalCurrentFilter.value.map(filter => {
          if (filter.filterType == 'variant' || filter.filterType == 'touch_points' || filter.filterType == 'activity' || filter.filterType == 'activity_connection') {
            if (filter.value.include.length === 0 && filter.value.exclude.length === 0) {
              // return filter;
              // filters.push(filter);
              emptyFilters++;
            }
          } else if (filter.filterType == 'attribute') {
            let attribute_filters = [];
            filter.value.map(val => {
              //18 April 2018 - Bug #5146
              if(val.fieldType === 'string') {

                if (val.value.include.length > 0) {
                  attribute_filters.push(val);
                }

              } else if(val.fieldType === 'number') {

                if (val.value.length > 0) {
                  attribute_filters.push(val);
                }

              } else if(val.fieldType === 'date') {
                //TODO: in future
              }
              
            });
            
            if (attribute_filters.length === 0) {
              // filters.push(filter);
              emptyFilters++;
            }
          }
        });
      duplicateStatus = (emptyFilters === (currentLocalCurrentFilter.value.length));
      }
      
      // return (duplicateStatus) ? true: false;
      return duplicateStatus;
    },

    checkEmptyFilters() {
      let currentLocalCurrentFilter = CommonUtils.deepClone(this.$props.localCurrentFilter);
      let filters = [];
      // let filtersValue = this.checkFiltersValue();
      if(currentLocalCurrentFilter) {
        currentLocalCurrentFilter.value.map(filter => {
          if (filter.filterType == 'variant' || filter.filterType == 'touch_points' || filter.filterType == 'activity' || filter.filterType == 'activity_connection') {
            if (filter.value.include.length > 0 || filter.value.exclude.length > 0) {
              // return filter;
              filters.push(filter);
            }
          } else if (filter.filterType == 'attribute') {
            let attribute_filters = [];

            filter.value.map(val => {
              //18 April 2018 - Bug #5146
              if(val.fieldType === 'string') {

                if (val.value.include.length > 0) {
                  attribute_filters.push(val);
                }

              } else if(val.fieldType === 'number'){

                if (val.value.length > 0) {
                  attribute_filters.push(val);
                }

              } else if(val.fieldType === 'date') {
                //TODO: in future
              }

            });
            if (attribute_filters.length > 0) {
              filters.push(filter);
            }
          } else if (filter.filterType == 'date_range' || filter.filterType == 'duration') {
            filters.push(filter);
          }
        });
      }
      
      return filters;
    },

  },

  watch: {
    localCurrentFilter: {
      handler(nVal,oVal){
        if(nVal.active){
          if(!nVal.replaced){
            //24 Jan 2018: adib.ghazali@gmail.com - Remove auto saving when data is changed
            // if(nVal.applied){
            //   this.syncUpSavedFilter(true);
            // } else {
            //   this.syncUpSavedFilter();
            // }
          }
        }
      },
      deep: true
    }
  },
  beforeDestroy() {
    eventHub.$off('enableApplyFilterBtn', this.enableApplyFilterBtn);
  }
}