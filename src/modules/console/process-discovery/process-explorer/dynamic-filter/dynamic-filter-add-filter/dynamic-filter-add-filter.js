import shared from "@/shared.js"
import CommonUtils from "@/utils/common-utils.js"
import TypeChecker from "@/utils/type-checker.js"
import NotyOperation from '@/utils/noty-operation.js'

import DFNavigateBar from "../dynamic-filter-navigate-bar/dynamic-filter-navigate-bar.vue"
import Activity from "./activity/activity.vue"
import ActivityConnection from "./activity-connection/activity-connection.vue"
import DateRange from "./date-range/date-range.vue"
import Duration from "./duration/duration.vue"
import TouchPoints from "./touch-points/touch-points.vue"
import Variants from "./variants/variants.vue"
import Attribute from "./attribute/attribute.vue"

import DfServices from "../dynamic-filter-services.js"
import DfUtils from "../dynamic-filter-utils.js"

var eventHub = shared.eventHub;

export default {
  name: 'dynamic-add-filter',

  props: {
    isShowAddFilterDetails: {
      type: Boolean
    },
    isEnableAttributeTab: {
      type: Boolean,
      required: true
    }
  },

  data() {
    return {
      addFilterNavItems: [],
      addFilterOptions: [],
      addFilterData: [], //when click apply filter
      addFilterNavItemsNum: 0,
      nowItemIndex: 0,
      localCurrentFilter: null,
      changedFilterSet: false,
      showFilters: false,
      currentGlobalFilterStatus: true,
      filtersDetailData: {}
    }
  },

  components: {
    'df-navigate-bar': DFNavigateBar,
    'df-date-range': DateRange,
    'df-variants': Variants,
    'df-duration': Duration,
    'df-touch-points': TouchPoints,
    'df-acitvity': Activity,
    'df-acitvity-connection': ActivityConnection,
    'df-attribute': Attribute
  },

  watch: {
    addFilterNavItemsNum: {
      handler(number, oldData) {
        if (number == 0) {
          //12-10-2017 - adib.ghazali@hpe.com 
          // -- show filter selection panel when no active selected filter
          eventHub.$emit("showDFPanel");
          eventHub.$emit('showDFPanelChangeItem');
          // -- reset highlightedItem  
          eventHub.$emit("removeHighlightedItem");
          // -- disable Apply Filter btn
          eventHub.$emit("enableApplyFilterBtn", false);
        }
      },
      deep: true
    }
  },
  created() {
    var vm = this;
    eventHub.$on("showAddFilterDetails", this.initAddFilterNavItems);
    eventHub.$on("tile-window-resized", this.windowResized);
    eventHub.$on("showThisAddFilterDetails", this.showThisAddFilterDetails);
    eventHub.$on("deleteSpecificAttribute", this.deleteSpecificAttribute);
    eventHub.$on("deleteThisAddFilterDetails", this.deleteFilterItem);
    eventHub.$on("deleteAllAddFilterDetails", this.deleteAllFilterItem);
    eventHub.$on("updateFilterValue", this.onUpdateFilterValue);
    eventHub.$on("applyDeleteFilter", this.onApplyDeleteFilterValue);
    //applyFilterChange
    eventHub.$on("applyFilterChange", this.onApplyFilterChangeFilterValue);
    eventHub.$on("applyFilter", this.onApplyFilterValue);
    eventHub.$on("changeFilterSets", this.onChangeFilterSets);
    eventHub.$on("saveAsFilters", this.onSaveAsFilters);
    eventHub.$on('setAsFav', this.onSetAsFav);
    eventHub.$on("apply-global-filters", this.onApplyGlobalFilters);
    eventHub.$on("global-filters-status", this.onGlobalFiltersStatus);
    eventHub.$on('setGlobalFilter', this.onSetGlobalFilter);
    eventHub.$on("end-mini-loader", this.onEndMiniLoader);
    eventHub.$on("closeDFNavigationBar", this.onCloseDFNavigationBar);

    setTimeout(function() {
      vm.windowResized();
    }, 100);
  },
  methods: {
    getFilterDetailData(args) {
      //2017-12-7: fangzheng-qing.liao@hpe.com
      //eg: get activity details data at the first time open the activity filter panel
      this.filtersDetailData[args.name] = args.value;
    },

    initAddFilterNavItems(args) {
      this.addFilterNavItems = [];
      for (var i = 0; i < args.length; i++) {
        var formatItem = {};
        formatItem.index = i;
        formatItem.key = args[i];
        formatItem.label = DfUtils.getFilterLabel(formatItem.key.toLowerCase().replace(' ', '_'));
        formatItem.icon = 'ellipsis';
        formatItem.click = false;
        if (i == 0) {
          formatItem.icon = 'trash';
          formatItem.click = true;
        }
        this.addFilterNavItems.push(formatItem);
      }
      this.addFilterNavItemsNum = this.addFilterNavItems.length;
      this.nowItemIndex = 0;
      this.changeAddFilterOptions();
      this.refreshAddFilterData();
    },

    deleteSpecificAttribute(props) {
      //25-10-2017: adib.ghazali@hpe.com
      //action after delete attribute (if length > 1) on info bar
      let filterIndex = props.filterIndex,
        attribute = props.attribute;

      this.addFilterData[filterIndex].options.splice(attribute.index, 1);

      //remove deleted attribute in localCurrentFilter
      this.localCurrentFilter.value.find(lcl => {
        if (lcl.filterType == 'attribute') {
          lcl.value.find((val, index) => {
            if (val) {
              if (val.field == attribute.name) {
                lcl.value.splice(index, 1);
              }
            }
          });
        }
      });

      //update appliedFilter with current localCurrentFilter
      DfServices.saveAppliedFilters(CommonUtils.deepClone(this.localCurrentFilter));

      this.$emit('propagateFilter');

    },

    deleteFilterItem(index) {
      var k = 0;
      var existItems = [];
      for (var i = 0; i < this.addFilterNavItems.length; i++) {
        if (i != index) {
          existItems[k] = this.addFilterNavItems[i].key;
          k++;
        }
      }
      this.addFilterNavItems = [];
      for (var i = 0; i < existItems.length; i++) {
        var formatItem = {};
        formatItem.index = i;
        formatItem.key = existItems[i];
        formatItem.label = DfUtils.getFilterLabel(formatItem.key.toLowerCase().replace(' ', '_'));
        formatItem.icon = 'ellipsis';
        formatItem.click = false;
        if (i == 0) {
          formatItem.icon = 'trash';
          formatItem.click = true;
        }
        this.addFilterNavItems.push(formatItem);
      }
      this.nowItemIndex = 0;
      //Liao Fang - 4/1/2018: Fix bug 3409
      if (this.isShowAddFilterDetails) {
        this.addFilterNavItemsNum = this.addFilterNavItems.length;
      }
      this.changeAddFilterOptions();
      this.refreshAddFilterData();
    },

    deleteAllFilterItem() {
      this.addFilterNavItems = [];
      this.changeAddFilterOptions();
      this.refreshAddFilterData();
    },

    addFilterItem(item) {
      var existItems = [];
      for (var i = 0; i < this.addFilterNavItems.length; i++) {
        existItems[i] = this.addFilterNavItems[i].key;
      }

      //Azhaziq - 17-10-2017: Add item from outside of dynamic filter
      var existItem = existItems.find((arrItem) => {
        if (arrItem == item) {
          return true;
        } else {
          return false;
        }
      })

      if (!existItem) {
        existItems[existItems.length] = item;
      }

      this.addFilterNavItems = [];
      for (var i = 0; i < existItems.length; i++) {
        var formatItem = {};
        formatItem.index = i;
        formatItem.key = existItems[i];
        formatItem.label = DfUtils.getFilterLabel(formatItem.key.toLowerCase().replace(' ', '_'));
        formatItem.icon = 'ellipsis';
        formatItem.click = false;
        if (i == existItems.length - 1) {
          formatItem.icon = 'trash';
          formatItem.click = true;
        }
        this.addFilterNavItems.push(formatItem);
      }
      this.nowItemIndex = existItems.length - 1;
      this.addFilterNavItemsNum = this.addFilterNavItems.length;
      this.changeAddFilterOptions();
      this.refreshAddFilterData();
    },

    refreshAddFilterData(persistChange) {
      this.addFilterData = [];

      for (var i = 0; i < this.addFilterNavItems.length; i++) {
        var addFilterDataDetails = {};
        addFilterDataDetails.index = this.addFilterNavItems[i].index;
        addFilterDataDetails.filterName = this.addFilterNavItems[i].key;
        this.addFilterData[i] = addFilterDataDetails;
      }

      // 27-9-2017 - Azhaziq - Data Model Generation
      // Update 04-10-2017 - Azhaziq
      // If no local data create new default data filter model
      // If have do checking, if the new added filter exists in localCurrent filter, make the copy to the new array
      if (this.localCurrentFilter == null) {
        this.localCurrentFilter = DfUtils.setGblDfDataModel(this.addFilterData);
      } else {
        let newLocalCurrentFilter = [];

        for (var i = 0; i < this.addFilterData.length; i++) {
          var exists = this.localCurrentFilter.value.find((data) => {

            var filterName = this.addFilterData[i]['filterName'].replace(' ', '_').toLowerCase();

            if (data.filterType == filterName) {
              return true;
            } else {
              return false;
            }
          })

          if (exists) {
            newLocalCurrentFilter.push(exists);
          } else {
            var newDt = DfUtils.getDataModel(this.addFilterData[i]['filterName']);
            newLocalCurrentFilter.push(newDt);
          }
        }

        this.localCurrentFilter.value = newLocalCurrentFilter;

      }

    },

    changeAddFilterOptions() {

      this.addFilterOptions = ['Date Range', 'Variant', 'Duration', 'Touch Points', 'Activity', 'Activity Connection'];

      if (this.$props.isEnableAttributeTab) {
        //12 Feb 2018: adib.ghazali@hpe.com - US #1980 - Show/Hide Attribute filter
        this.addFilterOptions.push('Attribute');
      }

      var existOptions = [];
      for (var i = 0; i < this.addFilterNavItems.length; i++) {
        existOptions[i] = this.addFilterNavItems[i].key;
      }
      var k = 0;
      var deleteOptionIndex = [];
      for (var i = 0; i < this.addFilterOptions.length; i++) {
        for (var j = 0; j < existOptions.length; j++) {
          if (this.addFilterOptions[i] == existOptions[j]) {
            deleteOptionIndex[k] = i - deleteOptionIndex.length;
            k++;
          }
        }
      }
      for (var i = 0; i < deleteOptionIndex.length; i++) {
        this.addFilterOptions.splice(deleteOptionIndex[i], 1)
      }
    },

    itemChange(index) {
      let vm = this;
      this.addFilterNavItems[this.nowItemIndex].icon = 'ellipsis';
      this.addFilterNavItems[this.nowItemIndex].click = false;
      setTimeout(function() {
        vm.addFilterNavItems[index].icon = 'trash';
        vm.addFilterNavItems[index].click = true;
      }, 100);
      this.nowItemIndex = index;
    },

    showThisAddFilterDetails(props) {
      var vm = this;
      //Azhaziq - 8/11/2017: Bug fix on show applied data once the user remove tab, close filter and open filter back without applying filter
      let appliedFilter = this.$store.getters.getAppliedFilter;
      if (appliedFilter.value.length > 0) {
        // 2017-12-5 Liao Fang: always ignore currentFilters , just use appliedFilter
        if (this.localCurrentFilter.value.length == 0) {
          this.onChangeFilterSets(appliedFilter);
          //Liao Fang - 4/1/2018: Fix bug 3409
          setTimeout(function() {
            if (vm.addFilterNavItems.length > 1) {
              vm.itemChange(props.index);
            }
          }, 50);
        } else {
          //16 Nov 2017: adib.ghazali@hpe.com - to open specific attribute tab from df-info-bar; if click on 'FILTER' remain 
          if (props.attribute) {
            //7 Dec 2017: adib.ghazali@hpe.com - setActiveAttribute
            DfServices.saveActiveAttribute(props.attribute);
          }

          this.onChangeFilterSets(appliedFilter);
          //Azhaziq - 5/12/2017: Fix bug on double chart been rendered
          setTimeout(function() {
            if (vm.addFilterNavItems.length > 1) {
              vm.itemChange(props.index);
            }
          }, 50);
        }
      } else {
        eventHub.$emit("showDFPanel");
      }
    },

    windowResized(args) {
      var k = document.getElementsByClassName("m-console")[0].parentNode.clientHeight - 70;
      $('.dynamic-filter-details-container').css('height', k);
      $('.addFilterPanel').css('height', k - 35)
    },

    getLocalSectionData(type) {
      var arrItem = {};
      if (this.localCurrentFilter) {
        this.localCurrentFilter.value.every((data) => {
          if (data.filterType == type) {
            arrItem = data;
            return false;
          } else {
            return true;
          }
        })
      }

      return arrItem;
    },

    onUpdateFilterValue(val, outer) {

      //This is a function where we updating the localCurrentFilter obj if the tab child change data
      //TODO: Need to refactor this, currently is exhaustive coding
      let arrIdx = -1;
      if (this.localCurrentFilter) {
        this.localCurrentFilter.value.every((arr, index) => {
          if (arr.filterType === val.filterType) {
            arrIdx = index;
            return false;
          } else {
            return true;
          }
        })
      }

      if (arrIdx > -1) {
        let lcf = this.localCurrentFilter.value[arrIdx];
        if (outer) {
          //Outer dynamic filter -> inner dynamic filter
          if (lcf.filterType != 'attribute') {
            //Standard filter - THIS IS FOR NON-ATTRIBUTE FILTER !!! DO NOT BUTTERSPREAD WITH ATTRIBUTE
            if (!TypeChecker.isUndefined(val.value.include) || !TypeChecker.isUndefined(val.value.exclude)) {
              //This is comparator array type value

              //Azhaziq - Defect 3432 

              //1st Round: Check incoming include, with existing exclude and include
              //If not found in existing include push value, else do nothing
              //If found in existing exclude pop value, else fo nothing
              var lcfValue = CommonUtils.deepClone(lcf.value);
              var valInclude = CommonUtils.deepClone(val.value.include[0]);
              lcfValue = DfUtils.includeExcludeManipulation(valInclude, lcfValue, "include");

              //2nd Round: Check incoming exclude, with existing exclude and include
              //If found in existing include push pop value, else do nothing
              //If not found in existing exclude push value, else fo nothing
              var valExclude = CommonUtils.deepClone(val.value.exclude[0]);
              lcfValue = DfUtils.includeExcludeManipulation(valExclude, lcfValue, "exclude");

              this.localCurrentFilter.value[arrIdx].value = lcfValue;

            } else if (!TypeChecker.isUndefined(val.value.startDate) || !TypeChecker.isUndefined(val.value.endDate)) {
              //This is date type value
              lcf.value = Object.assign({}, val.value);

            } else if (TypeChecker.isArray(val.value)) {
              //This is array object
              lcf.value = val.value.slice();

            } else if (TypeChecker.isObject(val.value)) {
              //This is any object
              lcf.value = Object.assign({}, val.value);

            } else {
              //This is string || number
              lcf.value = val.value;
            }

          } else {
            //Attribute filter - THIS IS FOR ATTRIBUTE !!! DO NOT BUTTERSPREAD WITH NON  ATTRIBUTE
            for (var key in val.value) {

              let attrExistsIdx = lcf.value.findIndex((arr) => {
                if (arr.field == val.value[key].field) {
                  return true;
                } else {
                  return false;
                }
              })

              if (attrExistsIdx > -1) {

                if (!TypeChecker.isUndefined(val.value[key].value.include) || !TypeChecker.isUndefined(val.value[key].value.exclude)) {


                  //Azhaziq: Add reading exclude value and assigning the value back to localcurrentfilter from the includeExcludeManipulation function
                  //This is comparator array type value
                  //1st Round: Check incoming include, with existing exclude and include
                  //If not found in existing include push value, else do nothing
                  //If found in existing exclude pop value, else fo nothing
                  var lcfValue = CommonUtils.deepClone(lcf.value[attrExistsIdx].value);
                  var valInclude = CommonUtils.deepClone(val.value[key].value.include[0])
                  lcfValue = DfUtils.includeExcludeManipulation(valInclude, lcfValue, "include");

                  //2nd Round: Check incoming exclude, with existing exclude and include
                  //If found in existing include push pop value, else do nothing
                  //If not found in existing exclude push value, else fo nothing
                  var valExclude = CommonUtils.deepClone(val.value[key].value.exclude[0])
                  lcfValue = DfUtils.includeExcludeManipulation(valExclude, lcfValue, "exclude");

                  lcf.value[attrExistsIdx].value = lcfValue;

                } else if (!TypeChecker.isUndefined(val.value[key].value.startDate) || !TypeChecker.isUndefined(val.value[key].value.endDate)) {
                  //This is date type value
                  lcf.value[attrExistsIdx].value = Object.assign({}, val.value[key].value);

                } else if (TypeChecker.isArray(val.value[key].value)) {
                  //This is array object
                  lcf.value[attrExistsIdx].value = val.value[key].value.slice();

                } else if (TypeChecker.isObject(val.value[key].value)) {
                  //This is any object
                  lcf.value[attrExistsIdx].value = Object.assign({}, val.value[key].value);

                } else {
                  //This is string || number
                  lcf.value[attrExistsIdx].value = val.value[key].value;
                }

              } else {
                lcf.value.push(val.value[key]);
              }

            }
          }

        } else {
          //Inner dynamic filter -> Outer dynamic filter
          this.localCurrentFilter.value[arrIdx].value = CommonUtils.deepClone(val.value);
        }
      }

    },
    //Faiz: 25/1/2018 -> function to remove empty filter from apply to the data
    onApplyFilterChangeFilterValue(currentLocalCurrentFilter) {
      let filtersData = [];
      let newNavItems = [];

      currentLocalCurrentFilter.value.map((val, index) => {
        let f = {
          filterName: val.filterType,
          index: index,
          label: DfUtils.getFilterLabel(val.filterType)
        };
        filtersData.push(f);
      });

      this.addFilterNavItems.map(item => {
        filtersData.map(filter => {
          let convertedFilterName = filter.filterName.replace("_", " ");
          if (item.key.toLowerCase() === convertedFilterName) {
            let _item = CommonUtils.deepClone(item);
            _item.label = filter.label;
            newNavItems.push(_item);
            // deleteNavItems.push(item.index);
          }
        });
      });
      this.addFilterNavItems = CommonUtils.deepClone(newNavItems);
      this.localCurrentFilter = CommonUtils.deepClone(currentLocalCurrentFilter);
      // this.nowItemIndex = addFilterNavItems.length - 1;
      // this.addFilterNavItems[0].click = true;
      // this.addFilterNavItemsNum = this.addFilterNavItems.length;
      // this.changeAddFilterOptions();
      // this.refreshAddFilterData();
    },
    onApplyFilterValue() {
      //This is apply filter value for add/change filter
      //TODO: Only apply filter that is not empty
      if (this.localCurrentFilter && (this.localCurrentFilter.value.length != 0 || this.localCurrentFilter.recipeId.length != 0)) {
        this.localCurrentFilter.applied = true;
        let currentFilter = CommonUtils.deepClone(this.localCurrentFilter);
        DfServices.saveAppliedFilters(currentFilter);
      } else {

        DfServices.saveAppliedFilters(null);
      }

      this.$emit('propagateFilter');


    },
    onApplyDeleteFilterValue(val) {
      //This is apply filter value for delete filter

      let appliedFilter = CommonUtils.deepClone(this.$store.getters.getAppliedFilter);

      if (val.length == 0) {
        DfServices.saveAppliedFilters({});
      } else {

        let newAppliedFilter = [];

        for (var key in val) {

          let filterName = val[key]['filterName'].replace(' ', '_').toLowerCase();

          let exists = appliedFilter.value.find((arr) => {
            if (arr.filterType == filterName) {
              return true;
            } else {
              return false;
            }
          })

          exists ? newAppliedFilter.push(exists) : null;
        }
        appliedFilter.value = newAppliedFilter;

        DfServices.saveAppliedFilters(appliedFilter);
      }

      this.$emit('propagateFilter');
    },
    onChangeFilterSets(args) {

      this.deleteAllFilterItem();
      this.localCurrentFilter.replaced = true;

      setTimeout(() => {
        for (var key in args.value) {
          let filterTypeStrArr = args.value[key].filterType.split('_');
          let transformedFilterTypeStr = ''

          for (let value of filterTypeStrArr) {
            let firstLetter = value.charAt(0).toUpperCase();

            transformedFilterTypeStr += firstLetter + value.slice(1) + ' ';
          }

          transformedFilterTypeStr = transformedFilterTypeStr.trim();

          this.addFilterItem(transformedFilterTypeStr);
          this.onUpdateFilterValue(args.value[key]);
        }

        for (var key in this.localCurrentFilter) {

          if (key != "value") {
            this.localCurrentFilter[key] = args[key];
          }
        }

        this.localCurrentFilter.replaced = false;

        let idxAttr = null,
          isHaveAttr = false;

        this.addFilterData.find((obj, index) => {
          if (obj.filterName.toLowerCase() == 'attribute') {
            idxAttr = index;
            isHaveAttr = true;
          }
        });

        if (isHaveAttr) {
          //19 Dec 2017 - adib.ghazali@hpe.com - Defect #3139

          let currentAttr = CommonUtils.deepClone(this.addFilterData[idxAttr]);

          currentAttr.options = [];

          this.localCurrentFilter.value.find(lcl => {
            if (lcl.filterType == currentAttr.filterName.toLowerCase()) {
              lcl.value.find((val, index) => {
                currentAttr.options.push({
                  name: (val.fieldType == 'date') ? `${val.field}Date` : val.field,
                  index: index
                });

                let getActiveAttribute = DfServices.getActiveAttribute();

                if (TypeChecker.isNull(getActiveAttribute)) {
                  DfServices.saveActiveAttribute(val.field);
                }

              });
            }
          });

          this.addFilterData[idxAttr] = currentAttr;

        }
      }, 0)
    },
    onApplyGlobalFilters(args) {

      console.log(args);

      if (this.localCurrentFilter == null) {
        this.localCurrentFilter = DfUtils.setGblDfDataModel();
      }

      if (args['src'] == "comparison") {

        //For comparison call, we only update recipeId
        // So no update on filter value, there for straight away save the localCurrentFilter and trigger apply filter value
        this.localCurrentFilter.recipeId = args['recipeId'];
        this.onApplyFilterValue();

      } else if (args['src'] == "analysis" || args['src'] == "processGraph") {

        switch (args['dataFilters']['filterType']) {
          case 'date_range':
            this.addFilterItem('Date Range');
            break;
          case 'variants':
            this.addFilterItem('Variants');
            break;
          case 'duration':
            this.addFilterItem('Duration');
            break;
          case 'touchpoints':
            this.addFilterItem('Touchpoints');
            break;
          case 'activity':
            this.addFilterItem('Activity');
            break;
          case 'activity_connection':
            this.addFilterItem('Activity Connection');
            break;
          case 'attribute':
            this.addFilterItem('Attribute');
            break;
        }

        this.onUpdateFilterValue(args['dataFilters'], true);
        eventHub.$emit('applyFilterOuter', this.addFilterData);
        this.onApplyFilterValue();
      }
    },
    onSaveAsFilters(args) {
      this.localCurrentFilter.name = args.name;
      this.localCurrentFilter.fav = args.fav;
      this.localCurrentFilter.active = args.active;
      this.localCurrentFilter.id = args.id;
      this.localCurrentFilter.typeOf = args.typeOf;
    },
    onSetAsFav() {
      this.localCurrentFilter.fav = !this.localCurrentFilter.fav;
    },
    onSetGlobalFilter(args) {
      if (this.localCurrentFilter == null) {
        this.localCurrentFilter = DfUtils.setGblDfDataModel();
      }

      for (var key in args.value) {
        let filterTypeStrArr = args.value[key].filterType.split('_');
        let transformedFilterTypeStr = ''

        for (let value of filterTypeStrArr) {
          let firstLetter = value.charAt(0).toUpperCase();

          transformedFilterTypeStr += firstLetter + value.slice(1) + ' ';
        }

        transformedFilterTypeStr = transformedFilterTypeStr.trim();
        this.addFilterItem(transformedFilterTypeStr);
        this.onUpdateFilterValue(args.value[key]);
      }

      if (!this.localCurrentFilter.active) {
        for (var key in this.localCurrentFilter) {
          if (key != "value") {
            this.localCurrentFilter[key] = args[key];
          }
        }
      }

      //26-10-2017 -- To display at the info bar (attribute)
      if (args.value != 0) {
        this.addFilterData.find(filter => {

          if (filter.filterName == 'Attribute') {
            filter.options = [];

            this.localCurrentFilter.value.find(lcl => {
              if (lcl.filterType == filter.filterName.toLowerCase()) {
                lcl.value.find((val, index) => {
                  filter.options.push({
                    name: (val.fieldType == 'date') ? `${val.field}Date` : val.field,
                    index: index
                  });
                });
              }
            });
          }
        });
      } else {
        this.addFilterData = [];
      }

      eventHub.$emit('applyFilterOuter', this.addFilterData);
    },
    onGlobalFiltersStatus(args) {
      this.currentGlobalFilterStatus = args;
    },
    onEndMiniLoader() {

      let prevAppliedFilter = this.$store.getters.getPrevAppliedFilter
      if (!this.currentGlobalFilterStatus && prevAppliedFilter) {

        NotyOperation.notifyError({ text: 'Filter request failed. Reverting to previous filter' });
        //Filter Request Failed
        DfServices.revertAppliedFilters();
        this.$emit('propagateFilter');
      }
    },

    onCloseDFNavigationBar() {
      //19 Dec 2017 - adib.ghazali@hpe.com - Defect #3139
      //reset back to 'No selection' is previos savedFilters is null

      this.addFilterData = [];
      this.addFilterNavItems = [];
      this.addFilterOptions = [];
      this.filtersDetailData = {};
      this.nowItemIndex = 0;
      this.localCurrentFilter = DfUtils.setGblDfDataModel();

      eventHub.$emit("removeHighlightedItem");
      eventHub.$emit("enableApplyFilterBtn", false);

    }
  },
  beforeDestroy() {}
}
