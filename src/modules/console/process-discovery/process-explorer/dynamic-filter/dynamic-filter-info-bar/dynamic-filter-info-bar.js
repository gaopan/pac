import shared from "@/shared.js"
import { mapGetters } from 'vuex'
import DfServices from "../dynamic-filter-services.js"
import CommonUtils from "@/utils/common-utils.js";

var eventHub = shared.eventHub;

export default {
  name: 'dynamic-filter-info-bar',
  data() {
    return {
      isShowDFPanel: false,
      showFilterActionOptions: false,
      filterOptions: []
    }
  },
  currentAppliedFilter: function() {

    let currentChosenFilter = 'No Selection';

    for (var key in this.$store.getters.getSavedFilters) {
      if (this.$store.getters.getSavedFilters[key].active) {
        currentChosenFilter = this.$store.getters.getSavedFilters[key].name;
      }
    }

    return currentChosenFilter;
  },
  created() {
    eventHub.$on("removeAllFilter", this.getFilterOptions);
    eventHub.$on("applyFilterOuter", this.getFilterOptions);
  },
  methods: {
    showDFPanel() {

      this.isShowDFPanel = true;
      if (this.filterOptions.length > 0) {
        this.showThisAddFilterDetails(0);
      } else {
        eventHub.$emit("showDFPanel");
        eventHub.$emit('showDFPanelChangeItem')
      }

    },

    getFilterOptions(args) {
      this.showFilterActionOptions = true;

      let data = JSON.parse(JSON.stringify(args));

      this.filterOptions = data;

      if (this.filterOptions.length == 0) {
        this.showFilterActionOptions = false;
      }
    },

    showThisAddFilterDetails(index, attribute) {

      let emitObj = {};
      emitObj.index = index;

      if (attribute) {
        emitObj.attribute = attribute.name;
      }

      eventHub.$emit("showThisAddFilterDetails", emitObj);
    },

    deleteAllAddFilterDetails() {

      eventHub.$emit("deleteAllAddFilterDetails");

      for (var i = 0; i < this.filterOptions.length; i++) {
        this.filterOptions = [];
      }

      this.showFilterActionOptions = false;

      //11-10-2017: Azhaziq - Add Emit to apply deletion
      eventHub.$emit("applyDeleteFilter", this.filterOptions);

      //12.10.2017: adib.ghazali@hpe.com
      // -- remove highlighted item when clicking 'clear all'  
      eventHub.$emit("removeHighlightedItem", this.filterOptions);
      // -- disable Apply Filter btn
      eventHub.$emit("enableApplyFilterBtn", false);

      //7 Dec 2017: adib.ghazali@hpe.com - set activeAttribute to null 
      DfServices.saveActiveAttribute(null);

      //23 Jan 2018: adib.ghazali@hpe.com - US #3738 - reset currentAppliedFilter name to Untitled after Clear All
      this.fnResetNameToUntitled();

    },

    deleteThisAddFilterDetails(filter, attribute) {
      let filterName = filter.filterName,
        filterIndex = filter.index;

      if (filterName == 'Attribute') {

        if (filter.options.length == 1) {

          this.updateFilterData(filterIndex);
          //7 Dec 2017: adib.ghazali@hpe.com - set activeAttribute to null 
          DfServices.saveActiveAttribute(null);

        } else {

          this.filterOptions[filterIndex].options.splice(attribute.index, 1);
          eventHub.$emit("deleteSpecificAttribute", {
            filterIndex: filterIndex,
            attribute: attribute
          });

          let getActiveAttribute = DfServices.getActiveAttribute();

          //7 Dec 2017: adib.ghazali@hpe.com - update activeAttribute when removed attribute is currently active
          if(getActiveAttribute.toLowerCase() == attribute.name) { 

            let sizeCurrentLast = this.filterOptions[filterIndex].options.length - 1;

            let nextActiveAttribute = this.filterOptions[filterIndex].options[sizeCurrentLast];

            DfServices.saveActiveAttribute(nextActiveAttribute.name);

          }

        }

      } else {

        this.updateFilterData(filterIndex);
      }
    },

    updateFilterData(filterIndex) {

      for (var i = filterIndex; i < this.filterOptions.length; i++) {
        this.filterOptions[i].index--;
      }

      this.filterOptions.splice(filterIndex, 1);
      //11-10-2017: Azhaziq - Add Emit to apply deletion
      //14-11-2017：Liao Fang - when delete the last filter, the same as clear all filters
      if (this.filterOptions.length == 0) {
        this.deleteAllAddFilterDetails()
      } else {
        eventHub.$emit("deleteThisAddFilterDetails", filterIndex);
        eventHub.$emit("applyDeleteFilter", this.filterOptions);
      }

    },

    fnShowHideOptionName(filterOption) {
      
      //8 Jan 2018: adib.ghazali@hpe.com - (Defect #3457) Hide LI when attribute.options is 0
      if(filterOption.filterName != 'Attribute') {
        return true;
      } else {

        //16-04-2018 - muhammad-azhaziq.bin-mohd-azlan-goh@dxc.com - add more condition to avoid 'length' undefined
        return (filterOption.options && filterOption.options.length > 0) ? true : false;
      }

    },

    fnResetNameToUntitled() {
      //23 Jan 2018: adib.ghazali@hpe.com - US #3738 - reset currentAppliedFilter name to Untitled after Clear All

      let tempSavedFilters = CommonUtils.deepClone(this.$store.getters.getSavedFilters);

      tempSavedFilters.find(obj => {
        obj.active = false;
      });

      DfServices.saveFilterRecipe(CommonUtils.deepClone(tempSavedFilters));

    }

  },
  filters: {
    camelToTitleCase: function(val) {
      let result = val.replace(/([A-Z])/g, " $1");
      return result.charAt(0).toUpperCase() + result.slice(1);
    }
  }
}
