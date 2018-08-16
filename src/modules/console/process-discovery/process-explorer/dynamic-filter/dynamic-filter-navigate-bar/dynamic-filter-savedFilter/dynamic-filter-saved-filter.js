import shared from "@/shared.js";
import CommonUtils from "@/utils/common-utils.js";
import LeapDropupdown from "@/components/leap-dropupdown/LeapDropupdown.vue"
import DfServices from "../../dynamic-filter-services.js"
import DatetimeUtils from '@/utils/datetime-utils.js';
import moment from 'moment';
import Store from '@/store';
import Internationalization from '@/utils/internationalization.js'
var eventHub = shared.eventHub;

export default {
	name: 'dynamic-filter-saved-filter',
	props: ['saveAsOrigin','savedFilters','applyFilter', 'historyFilters'],
	components: {
    	'leap-dropupdown': LeapDropupdown
  	},
  	data(){
  		return{}
    },
    filters: {
      convertDateTime(epochVal) {

        let datetime = new Date(epochVal);

        let formattedDate = DatetimeUtils.getFullDate(datetime, 'dd.MM.yyyy');

        return `${formattedDate} ${datetime.getHours()}:${datetime.getMinutes()}:${datetime.getSeconds()}`;

      }
    },
  	methods: {
      selectSavedFilter(idx){
        let tempSavedFilters = CommonUtils.deepClone(this.savedFilters);
        let tempHistoryFilters = CommonUtils.deepClone(this.historyFilters);

        tempSavedFilters[idx].active = true;

        for(var key in tempSavedFilters){
          if(tempSavedFilters[key].name != tempSavedFilters[idx].name){
            tempSavedFilters[key].active = false;
          } 
        }

        for (var key in tempHistoryFilters) {
            tempHistoryFilters[key].active = false;
        }

        DfServices.saveFilterRecipe(CommonUtils.deepClone(tempSavedFilters));
        DfServices.saveHistoryFilterRecipe(CommonUtils.deepClone(tempHistoryFilters));
        this.$emit('selectSavedFilter',tempSavedFilters[idx]);
      },

      //faiz-asyraf.abdul-aziz@hpe.com - to handle select for history filter
      selectSavedFilterHistory(idx) {
        let tempSavedFilters = CommonUtils.deepClone(this.savedFilters);
        let tempHistoryFilters = CommonUtils.deepClone(this.historyFilters);

        tempHistoryFilters[idx].active = true;

        for (var key in tempHistoryFilters) {
          if (tempHistoryFilters[key].name != tempHistoryFilters[idx].name) {
            tempHistoryFilters[key].active = false;
          }
        }

        for (var key in tempSavedFilters) {
          tempSavedFilters[key].active = false;
        }

        DfServices.saveFilterRecipe(CommonUtils.deepClone(tempSavedFilters));
        DfServices.saveHistoryFilterRecipe(CommonUtils.deepClone(tempHistoryFilters));
        this.$emit('selectSavedFilter', tempHistoryFilters[idx]);
      },
      favouriteSavedFilter(filter){

        var activeFilterIdx = this.savedFilters.findIndex((arr)=>{
          if(arr.id == filter.id){
            return true;
          } else {
            return false;
          }
        });

        // //Code refactor - findIndex() not supported in IE
        // var activeFilterIdx = -1;

        // this.savedFilters.some(function(arr, i){
        //   if(arr.id == filter.id) {
        //     activeFilterIdx = i;
        //     return true;
        //   } else {
        //     return false;
        //   }
        // })
        // //End code refactor

        var tempSavedFilters = CommonUtils.deepClone(this.savedFilters);
        tempSavedFilters[activeFilterIdx].fav = !tempSavedFilters[activeFilterIdx].fav;

        //Azhaziq - 14/11/2017: Defect 2323 - Move the logic from navigate to savedFilter component
        //If change from false to true, make sure only one true
        if(tempSavedFilters[activeFilterIdx].fav){

          for(var key in tempSavedFilters){
            if(tempSavedFilters[key].id != tempSavedFilters[activeFilterIdx].id){
              tempSavedFilters[key].fav = false;
            } 
          }
        }

        let metadata = {
          fileName: this.$store.getters.processSelection.fileName,
          processAnalyticsId: this.$store.getters.processSelection.processAnalyticsId,
          fVal: tempSavedFilters[activeFilterIdx]
        };

        DfServices.persistFilterRecipe(metadata,'update').then((res)=>{
          DfServices.saveFilterRecipe(CommonUtils.deepClone(tempSavedFilters));
          this.$emit('favouriteSavedFilter');
        });
      },
      closeSavedFilter(){
        this.$emit('closeSavedFilter');
      },
      //faiz-asyraf.abdul-aziz@hpe.com - to delete the filters
      deleteFilter(filter, type) {
        //if type is saved, saved filters will be primary and history will be secondary and vice versa
        let primaryFilters = (type === 'Saved' ? CommonUtils.deepClone(this.savedFilters) : CommonUtils.deepClone(this.historyFilters));
        let secondaryFilters = (type === 'Saved' ? CommonUtils.deepClone(this.historyFilters) : CommonUtils.deepClone(this.savedFilters));
       let appliedFilter = this.$store.getters.getAppliedFilter;

        var fltrIdx = primaryFilters.findIndex((arr) => {
          if (arr.id == filter.id) {
            return true;
          } else {
            return false;
          }
        })
        if (fltrIdx > -1) {

          let deletedItem = primaryFilters.splice(fltrIdx, 1);
          if(type == 'Saved') {
            DfServices.persistFilterRecipe(deletedItem[0].id, 'delete').then((res) => {
              let newSecondaryFilter = secondaryFilters.filter(val => {
                if(val.derivedFromId) {
                  if(val.derivedFromId === filter.id) {
                    // return
                    DfServices.persistHistoryFilterRecipe(val.id, 'delete').then((res) => {});
                  }else {
                    return val;
                  }
                }else {
                  return val;
                }
              });
              if (primaryFilters.length > 0) {
                let lastIdx = primaryFilters.length - 1;
                if (appliedFilter.id === deletedItem[0].id) {
                  primaryFilters[lastIdx].active = true;
                  primaryFilters = CommonUtils.deepClone(this.setActiveFilter(primaryFilters, lastIdx));

                  if (secondaryFilters.length > 0) {
                    secondaryFilters = CommonUtils.deepClone(this.resetFilterStatus(secondaryFilters));
                  }
                  this.normalDelete(primaryFilters, lastIdx);
                }
              

              } else {
                deletedItem[0] = CommonUtils.deepClone(this.resetTheFilterData(deletedItem[0]));
                this.deleteTheLastOne(deletedItem[0]);
               
              }

              DfServices.saveFilterRecipe(CommonUtils.deepClone(primaryFilters));
              DfServices.saveHistoryFilterRecipe(CommonUtils.deepClone(newSecondaryFilter));

            });
          }
          else {
            DfServices.persistHistoryFilterRecipe(deletedItem[0].id, 'delete').then((res) => {
              if (primaryFilters.length > 0) {
                let lastIdx = primaryFilters.length - 1;
                if (appliedFilter.id === deletedItem[0].id) {
                  primaryFilters[lastIdx].active = true;
                  primaryFilters = CommonUtils.deepClone(this.setActiveFilter(primaryFilters, lastIdx));

                  if (secondaryFilters.length > 0) {
                    secondaryFilters = CommonUtils.deepClone(this.resetFilterStatus(secondaryFilters));
                  }
                  this.normalDelete(primaryFilters, lastIdx);
                }

              } else {
                deletedItem[0] = CommonUtils.deepClone(this.resetTheFilterData(deletedItem[0]));

                this.deleteTheLastOne(deletedItem[0]);
                
              }
              DfServices.saveHistoryFilterRecipe(CommonUtils.deepClone(primaryFilters));
              DfServices.saveFilterRecipe(CommonUtils.deepClone(secondaryFilters));

            });
          }
          
        }
      },
      //faiz-asyraf.abdul-aziz@hpe.com - to set active filters
      setActiveFilter(filters, lastIdx) {
        filters.map((val, index) => {
          if (lastIdx === index) {
            val.active = true;
          }
          else {
            val.active = false;
          }
        });

        return filters;
      },
       //faiz-asyraf.abdul-aziz@hpe.com - reset filter status
      resetFilterStatus(filters) {
        filters.map(val => {
          val.active = false;
        });

        return filters;
      },
       //faiz-asyraf.abdul-aziz@hpe.com - reset filter data
      resetTheFilterData(deletedItem) {
        deletedItem.active = false;
        deletedItem.fav = false;
        deletedItem.value = [];
        deletedItem.id = '';
        deletedItem.derivedFromId = '';
        deletedItem.modifiedOn = '';
        deletedItem.applied = false;
        deletedItem.recipeId = '';
        deletedItem.typeOf = '';
        deletedItem.name = Internationalization.translate('无标题');
        
        return deletedItem;
      },
       //faiz-asyraf.abdul-aziz@hpe.com - do the normal deletion
      normalDelete(primaryFilters, lastIdx) {
        eventHub.$emit('changeFilterSets', primaryFilters[lastIdx]);
        eventHub.$emit("applyDeleteFilter", []);
        eventHub.$emit("deleteAllAddFilterDetails");
        // eventHub.$emit("removeAllFilter", []);
        DfServices.saveActiveAttribute(null);
      },

       //faiz-asyraf.abdul-aziz@hpe.com - delete the last filters
      deleteTheLastOne(deletedItem) {
        eventHub.$emit('changeFilterSets', deletedItem);
        this.closeSavedFilter();
        eventHub.$emit("applyDeleteFilter", []);
        eventHub.$emit("deleteAllAddFilterDetails");
        DfServices.saveActiveAttribute(null);
        eventHub.$emit("showDFPanel");
        eventHub.$emit("removeAllFilter", []);
        eventHub.$emit("showDFPanel");
        eventHub.$emit("showDFFilterPanel");
      }
    },

}