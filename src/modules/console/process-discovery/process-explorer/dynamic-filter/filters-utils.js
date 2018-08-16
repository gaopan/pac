import TypeChecker from "@/utils/type-checker.js"
import commonUtils from "@/utils/common-utils.js"

export default {
  getFilterDataModel() {
    //26-07-2017: Azhaziq - Add vendor, processActivity
    let filter = new Object();

    filter = {
      sessionId: null,
      recipeId: "",
      dataFilters: {
        companyCode: {
          selected: [],
          options: []
        },
        documentType: {
          selected: [],
          options: []
        },
        invoiceType: {
          selected: [],
          options: []
        },
        channel: {
          selected: [],
          options: []
        },
        dateRange: {
          selected: {
            startDate: null,
            endDate: null
          },
          eventLogRange: {
            startDate: '',
            endDate: ''
          }
        },
        vendor: {
          selected: []
        },
        processActivity: {
          selected: []
        }
      },
    }

    return filter;
  },
  getSelectedFilterDataModel(data) {
    //26-07-2017: Azhaziq - Add vendor, processActivity
    let selectedFilterDataModel = new Object();

    selectedFilterDataModel = {
      dataFilters: {
        companyCode: [],
        documentType: [],
        invoiceType: [],
        channel: [],
        dateRange: {
          startDate: null,
          endDate: null, 
        },
        vendor: [],
        processActivity: []
      },
    }

    if(data){

      for (var prop in data) {
        if (!TypeChecker.isUndefined(selectedFilterDataModel[prop])) {

          if (TypeChecker.isString(data[prop])) {
            selectedFilterDataModel[prop] = data[prop];
          } else if (TypeChecker.isObject(data[prop])) {
            selectedFilterDataModel[prop] = Object.assign({}, data[prop]);
          } else if (TypeChecker.isArray(data[prop])) {
            selectedFilterDataModel[prop] = data[prop].slice();
          }
        }
      }

      for (var prop in data.dataFilters) {
        if (!TypeChecker.isUndefined(selectedFilterDataModel.dataFilters[prop])) {
          if (TypeChecker.isArray(data.dataFilters[prop])) {
            selectedFilterDataModel.dataFilters[prop] = data.dataFilters[prop].slice();
          } else if (TypeChecker.isObject(data.dataFilters[prop])) {

            //Special to cater date Range
            if (TypeChecker.isUndefined(selectedFilterDataModel.dataFilters[prop].selected)) {
              selectedFilterDataModel.dataFilters[prop] = Object.assign({}, data.dataFilters[prop]);
            } else {
              selectedFilterDataModel.dataFilters[prop] = Object.assign({}, data.dataFilters[prop]);
            }

          } else if (TypeChecker.isString(data.dataFilters[prop])) {
            selectedFilterDataModel.dataFilters[prop] = data.dataFilters[prop];
          }
        }
      }
    }

    return selectedFilterDataModel;
  },
  requestFilterPrep(filterData) {
    let arrFields = [];

    for (var prop in filterData) {

      if (TypeChecker.isArray(filterData[prop])) {

        if (filterData[prop].length != 0) {

          let obj = {
            field: prop,
            value: filterData[prop].toString()
          }

          arrFields.push(obj);
        }

      } else {

        if (!TypeChecker.isUndefined(filterData[prop]) && filterData[prop]) {

          if (prop == 'dateRange') {
            // Updated by Gao, Pan  check if startDate has valid value, then add it to filter fields
            if (filterData[prop].startDate) {
              let obj = {
                field: "startDate",
                value: filterData[prop].startDate
              }
              arrFields.push(obj);
            }
            // Updated by Gao, Pan  check if endDate has valid value, then add it to filter fields
            if (filterData[prop].endDate) {
              let obj = {
                field: "endDate",
                value: filterData[prop].endDate
              }

              arrFields.push(obj);
            }
          }
        }
      }
    }

    let body = {
      "customerId": "custId0001",
      "recipeId": filterData.recipeId,
      "processName": filterData.process,
      "filterFields": arrFields
    }

    return body;
  },
  filterDataToString(filterData) {
    function arrToStr(arr) {
      var res = '[',
        itemArr = [];
      arr.forEach(function(item) {
        if (TypeChecker.isObject(item)) {
          itemArr.push(objToStr(item));
        } else if (TypeChecker.isArray(item)) {
          itemArr.push(arrToStr(item));
        } else {
          itemArr.push(item);
        }
      });
      return res + itemArr.join(',') + ']';
    }

    function objToStr(obj) {
      var keys = Object.keys(obj);
      keys.sort(function(a, b) {
        return a.localeCompare(b);
      });
      var res = '{',
        fieldArr = [];
      keys.forEach(function(key) {
        if (obj.hasOwnProperty(key)) {
          if (TypeChecker.isObject(obj[key])) {
            fieldArr.push(key + ":" + objToStr(obj[key]));
          } else if (TypeChecker.isArray(obj[key])) {
            fieldArr.push(key + ":" + arrToStr(obj[key]));
          } else {
            fieldArr.push(key + ":" + obj[key]);
          }
        }
      });
      return res + fieldArr.join(',') + '}';
    }

    if (!filterData) {
      return filterData;
    }
    return objToStr(filterData);
  },
  formatGlobalFilters: function(filters) {
    var formated = {},
      dataFilters = formated.dataFilters = {},
      viewFilters = formated.viewFilters = {};

    viewFilters.viewType = filters.viewType;

    dataFilters.processName = filters.process;
    dataFilters.recipeId = filters.recipeId;
    dataFilters.filters = Object.assign({}, filters.dataFilters);

    return formated;
  },
  formatDataFiltersForRequest: function(dataFilters) {
    var filterData = Object.assign({}, dataFilters.filters);
    filterData.process = dataFilters.processName;
    filterData.recipeId = dataFilters.recipeId;
    return this.requestFilterPrep(filterData);
  },
  checkIfChanged: function(newFilters, oldFilters) {

    var newDataStr = commonUtils.toString(newFilters.dataFilters),
      newViewStr = commonUtils.toString(newFilters.viewFilters),
      oldDataStr = commonUtils.toString(oldFilters.dataFilters),
      oldViewStr = commonUtils.toString(oldFilters.viewFilters);

    return {
      data: newDataStr != oldDataStr,
      view: newViewStr != oldViewStr
    };
  }
}
