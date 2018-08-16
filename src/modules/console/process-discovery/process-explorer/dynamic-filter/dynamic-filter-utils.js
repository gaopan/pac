import TypeChecker from "@/utils/type-checker.js"
import CommonUtils from "@/utils/common-utils.js";
import DynamicFilterApi from '@/api/process-mining.js';
import q from '@/api/q.js';

import {
  objDtModel,
  arrayDtModel,
  comparatorArrayDtModel,
  attrObjDtModel,
  attrArrayDtModel,
  activityDtModel,
  saveAsFilterModel,
  filterOverallModel,
  emitModel,
  apiCommunicationModel,
  distinctModel,
  continuousModel,
  connectionsModel,
  apiSaveFilterModel,
  apiSaveFilterWithDerivedModel
} from "./dynamic-filter-data-models.js"

export default {
  setGblDfDataModel(addFilterData) {

    let df = new filterOverallModel();

    for (var key in addFilterData) {

      let dtModel = this.getDataModel(addFilterData[key]['filterName']);

      df.model.value.push(dtModel);
    }

    return df.model;
  },
  getDataModel(filterName) {

    let dtModel;

    //13-04-2018: muhammad-azhaziq.bin-mohd-azlan-goh@dxc.com - US1901 Task 5044 - Remove CASE, ACTIVITY
    let arrFilterName = filterName.split('.');

    if (arrFilterName.length > 1) {
      filterName = arrFilterName[arrFilterName.length - 1];
    }

    switch (filterName.replace(' ', '').toLowerCase()) {
      case 'daterange':
        dtModel = new objDtModel(filterName.replace(' ', '_').toLowerCase());
        break;
      case 'variant':
        dtModel = new comparatorArrayDtModel(filterName.replace(' ', '_').toLowerCase());
        break;
      case 'duration':
        dtModel = new objDtModel(filterName.replace(' ', '_').toLowerCase());
        break;
      case 'touchpoints':
        dtModel = new comparatorArrayDtModel(filterName.replace(' ', '_').toLowerCase());
        break;
      case 'activity':
        dtModel = new comparatorArrayDtModel(filterName.replace(' ', '_').toLowerCase());
        break;
      case 'activityname':
        //13-04-2018: muhammad-azhaziq.bin-mohd-azlan-goh@dxc.com - US1901 Task 5044 - Add activity name
        filterName = 'activity';
        dtModel = new comparatorArrayDtModel(filterName.replace(' ', '_').toLowerCase());
      case 'activityconnection':
        dtModel = new comparatorArrayDtModel(filterName.replace(' ', '_').toLowerCase());
        break;
      default:
        dtModel = new arrayDtModel('attribute');
        break;
    }

    if (dtModel) {
      return dtModel.model;
    } else {
      return dtModel;
    }
  },
  getAttrDataModel(fieldType, fieldName) {

    let dtModel;

    //13-04-2018: muhammad-azhaziq.bin-mohd-azlan-goh@dxc.com - US1901 Task 5044 - Remove CASE, ACTIVITY
    let arrFieldName = fieldName.split('.');

    if (arrFieldName.length > 1) {
      fieldName = arrFieldName[arrFieldName.length - 1];
    }

    switch (fieldType.toLowerCase()) {
      case 'string':
        dtModel = new attrArrayDtModel(fieldType.toLowerCase(), fieldName);
        break;
      case 'stringnumber':
        dtModel = new attrArrayDtModel(fieldType.toLowerCase(), fieldName);
        break;
      case 'number':
        dtModel = new attrArrayDtModel(fieldType.toLowerCase(), fieldName);
        break;
      case 'caseid':
        dtModel = new attrArrayDtModel(fieldType.toLowerCase(), fieldName);
        break;
      case 'daterange':
        dtModel = new attrObjDtModel(fieldType.toLowerCase(), fieldName);
        break;
    }

    if (dtModel) {
      return dtModel.model;
    } else {
      return dtModel;
    }
  },
  getSaveAsFilterDataModel() {

    var dtModel = new saveAsFilterModel();

    return dtModel.model;
  },
  // Azhaziq - 17/11/2017 - Add Process Analytic Id
  getEmitModel(metadata, dfVal) {
    let emitDt = new emitModel();

    emitDt.process = metadata.fileName;
    emitDt.recipeId = metadata.recipeId;
    emitDt.customerId = metadata.customerId;
    emitDt.dynamicFilters = dfVal;
    emitDt.processAnalyticsId = metadata.processAnalyticsId

    return emitDt.model;
  },
  transformSavedFilter(filterObj) {

    let df = new filterOverallModel(),
      returnModel = df.model;

    returnModel.name = filterObj.name;
    returnModel.fav = filterObj.isFavorite;
    returnModel.active = filterObj.isFavorite;
    returnModel.applied = filterObj.isFavorite;

    //Defect 3866 - Azhaziq (muhammad-azhaziq.bin-mohd-azlan-goh@dxc.com)
    returnModel.value = filterObj.value.length > 0 ? JSON.parse(filterObj.value) : filterObj.value;

    returnModel.id = filterObj.id;
    //25 Jan 2018: adib.ghazali@hpe.com - add typeOf (saved/history)
    returnModel.typeOf = 'saved';

    return returnModel;
  },
  transformHistoryFilter(filterObj) {
    let df = new filterOverallModel(),
      returnModel = df.model;

    returnModel.name = filterObj.name;
    // returnModel.fav = filterObj.isFavorite;
    // returnModel.active = filterObj.isFavorite;
    // returnModel.applied = filterObj.isFavorite;
    returnModel.fav = false;
    returnModel.active = false;
    returnModel.applied = false;
    returnModel.modifiedOn = filterObj.modifiedOn;
    if (filterObj.derivedFromId) {
      returnModel.derivedFromId = filterObj.derivedFromId;
    }

    //Defect 3866 - Azhaziq (muhammad-azhaziq.bin-mohd-azlan-goh@dxc.com)
    returnModel.value = filterObj.value.length > 0 ? JSON.parse(filterObj.value) : filterObj.value;

    returnModel.id = filterObj.id;
    //25 Jan 2018: adib.ghazali@hpe.com - add typeOf (saved/history)
    returnModel.typeOf = 'history';

    return returnModel;
  },
  filterTypeMapping(filterType) {

    let ftMap = {
      "variant": {
        "groupName": "distinct",
        "acceptedName": "variantName",
      },
      "activity": {
        "groupName": "distinct",
        "acceptedName": undefined,
      },
      "activity_connection": {
        "groupName": "connections",
        "acceptedName": undefined,
      },
      "touch_points": {
        "groupName": "distinct",
        "acceptedName": "activityCount",
      },
      "duration": {
        "groupName": "continuous",
        "acceptedName": "caseDuration",
      },
      "date_range": {
        "groupName": "continuous",
        "acceptedName": undefined,
      },
      "string": {
        "groupName": "distinct",
        "acceptedName": undefined,
      },
      "stringNumber": {
        "groupName": "distinct",
        "acceptedName": undefined,
      },
      "number": {
        "groupName": "distinct",
        "acceptedName": undefined,
      },
      "caseId": {
        "groupName": "distinct",
        "acceptedName": undefined,
      },
      "date": {
        "groupName": "continuous",
        "acceptedName": undefined
      },
      "attribute": {
        "groupName": undefined,
        "acceptedName": undefined,
      }
    }

    return ftMap[filterType];
  },

  // Azhaziq - 17/11/2017 - Add Process Analytic Id
  //Azhaziq - 08-12-2017: Add extra checking for activity to cater c2
  formatDataFiltersForRequest(val) {

    var defer = q.defer();
    let apiCommDt = new apiCommunicationModel();

    apiCommDt.customerId = val.customerId;
    apiCommDt.processName = val.processName;
    apiCommDt.recipeId = val.recipeId;
    apiCommDt.processAnalyticsId = val.processAnalyticsId;

    let activityExists = false,
      activityConnectionExists = false;

    for (var key in val.filters) {
      val.filters[key]['filterType'] == "activity" ? activityExists = true : null;
      val.filters[key]['filterType'] == "activity_connection" ? activityConnectionExists = true : null;
    }

    if (activityExists && activityConnectionExists) {

      DynamicFilterApi.getActivityData(val.customerId, val.processAnalyticsId).then((res) => {

        let activityList = res.data.list;

        DynamicFilterApi.getActivityConnectionData(val.customerId, val.processAnalyticsId).then(res => {
          let activityConnectionList = res.data.list;

          let metadata = {
            'activity': activityList,
            'activity_connection': activityConnectionList
          };

          this.formatDataFiltersForRequestProcessor(val.filters, apiCommDt, metadata);
          defer.resolve(apiCommDt.model);
        });
      });

    } else if (activityExists) {

      DynamicFilterApi.getActivityData(val.customerId, val.processAnalyticsId).then((res) => {
        let activityList = res.data.list;

        let metadata = {
          'activity': activityList
        };

        this.formatDataFiltersForRequestProcessor(val.filters, apiCommDt, metadata);
        defer.resolve(apiCommDt.model);
      });


    } else if (activityConnectionExists) {

      DynamicFilterApi.getActivityConnectionData(val.customerId, val.processAnalyticsId).then(res => {

        let activityConnectionList = res.data.list;

        let metadata = {
          'activity_connection': activityConnectionList
        };

        this.formatDataFiltersForRequestProcessor(val.filters, apiCommDt, metadata);
        defer.resolve(apiCommDt.model);
      });

    } else {

      setTimeout(() => {
        this.formatDataFiltersForRequestProcessor(val.filters, apiCommDt);
        defer.resolve(apiCommDt.model);
      });
    }

    return defer.promise;
  },
  formatDataFiltersForRequestProcessor(filters, apiCommDt, metadata) {
    for (var key in filters) {

      let tempModel = [];

      if (filters[key]['filterType'] != "attribute") {

        if (filters[key]['filterType'] != "activity" && filters[key]['filterType'] != "activity_connection") {
          let filterGroupType = this.filterTypeMapping(filters[key]['filterType']);

          let tempData = {
            name: filterGroupType.acceptedName ? filterGroupType.acceptedName : filters[key]['filterType'],
            value: filters[key].value
          }

          tempModel = this.generatefilterGrouped(filterGroupType.groupName, tempData);

        } else if (filters[key]['filterType'] == "activity") {

          //30 Nov 2017: Azhaziq - Change data model per Jarod request - use id and name
          //04-12-2017: Azhaziq - Adjust logic, check if number use activityId and if string use activityName
          let filterGroupType = this.filterTypeMapping(filters[key]['filterType']);

          let activityList = metadata[filters[key]['filterType']];

          let actIdExists = false;

          if (activityList[0].activity.activityId) {
            actIdExists = true;
          }

          if (actIdExists) {
            filterGroupType.acceptedName = 'activityId'

            for (var key2 in filters[key].value.include) {

              let foundAct = activityList.find(arr => {

                if (arr.activity.activityName == filters[key].value.include[key2]) {
                  return true;
                } else {
                  return false;
                }
              })

              if (foundAct) {
                filters[key].value.include[key2] = parseInt(foundAct.activity.activityId);
              }
            }

            for (var key2 in filters[key].value.exclude) {

              let foundAct = activityList.find(arr => {

                if (arr.activity.activityName == filters[key].value.exclude[key2]) {
                  return true;
                } else {
                  return false;
                }
              })

              if (foundAct) {
                filters[key].value.exclude[key2] = parseInt(foundAct.activity.activityId);
              }
            }

          } else {
            filterGroupType.acceptedName = 'activityName'
          }

          let tempData = {
            name: filterGroupType.acceptedName,
            value: filters[key].value
          }

          tempModel = this.generatefilterGrouped(filterGroupType.groupName, tempData);

        } else if (filters[key]['filterType'] == "activity_connection") {

          let filterGroupType = this.filterTypeMapping(filters[key]['filterType']);

          let activityConnectionList = metadata[filters[key]['filterType']];

          let actIdExists = false;

          if (activityConnectionList[0].activityId) {
            actIdExists = true;
          }

          if (actIdExists) {

            for (var key2 in filters[key].value.include) {

              let foundSourceAct = activityConnectionList.find(arr => {

                if (arr.activityName == filters[key].value.include[key2].source) {
                  return true;
                } else {
                  return false;
                }
              })

              let foundTargetAct = activityConnectionList.find(arr => {

                if (arr.activityName == filters[key].value.include[key2].target) {
                  return true;
                } else {
                  return false;
                }
              })

              if (foundSourceAct) {
                filters[key].value.include[key2].source = parseInt(foundSourceAct.activityId);
              }

              if (foundTargetAct) {
                filters[key].value.include[key2].target = parseInt(foundTargetAct.activityId);
              }
            }

            for (var key2 in filters[key].value.exclude) {

              let foundSourceAct = activityConnectionList.find(arr => {

                if (arr.activityName == filters[key].value.exclude[key2].source) {
                  return true;
                } else {
                  return false;
                }
              })

              let foundTargetAct = activityConnectionList.find(arr => {

                if (arr.activityName == filters[key].value.exclude[key2].target) {
                  return true;
                } else {
                  return false;
                }
              })

              if (foundSourceAct) {
                filters[key].value.exclude[key2].source = parseInt(foundSourceAct.activityId);
              }

              if (foundTargetAct) {
                filters[key].value.exclude[key2].target = parseInt(foundTargetAct.activityId);
              }
            }

          }

          let tempData = {
            name: filterGroupType.acceptedName ? filterGroupType.acceptedName : filters[key]['filterType'],
            value: filters[key].value
          }

          tempModel = this.generatefilterGrouped(filterGroupType.groupName, tempData);
        }

      } else {

        let attrValue = filters[key]['value'];

        let attrList = [];

        for (var attrKey in attrValue) {

          let filterGroupType = this.filterTypeMapping(attrValue[attrKey]['fieldType']);

          let tempData = {
            name: filterGroupType.acceptedName ? filterGroupType.acceptedName : attrValue[attrKey]['field'],
            value: attrValue[attrKey].value
          }

          //17th April 2018 - muhammad-azhaziq.bin-mohd-azlan-goh@dxc.com - US1901 Task 5044 - Add CASE for attribute filter
          tempData.name = "CASE." + tempData.name;

          attrList.push(this.generatefilterGrouped(filterGroupType.groupName, tempData));
        }

        // console.log(CommonUtils.deepClone(attrList));
        tempModel = attrList;
      }

      apiCommDt.filter = tempModel;
    }
  },
  generatefilterGrouped(filterGroupType, filterObj) {
    let rtnVal;
    let tempValue;

    switch (filterGroupType) {
      case 'distinct':

        tempValue = [];

        if (TypeChecker.isObject(filterObj.value)) {

          for (var key in filterObj.value) {

            //If either of include or exclude is empty, move to next item
            if (TypeChecker.isArray(filterObj.value[key]) && filterObj.value[key].length == 0) {
              continue;
            }

            let tempModel = {
              type: filterGroupType,
              data: null
            }

            let distinct = new distinctModel();

            distinct.name = filterObj.name;
            distinct.values = filterObj.value[key];

            if (key == 'include') {
              distinct.comparator = "IN";
            }

            if (key == 'exclude') {
              distinct.comparator = "NOT_IN";
            }

            tempModel.data = distinct.model;

            tempValue.push(tempModel);

          }

        } else {

          //19 Dec 2017 - adib.ghazali@hpe.com - new req. from Jarod: expected float distinct format (Attribute - number)
          let tempModel = {
            type: filterGroupType,
            data: null
          }

          let distinct = new distinctModel();

          distinct.name = filterObj.name;
          distinct.comparator = "IN";

          let arrValues = [];

          for (let key in filterObj.value) {

            let value = filterObj.value[key];

            let arr = [];

            for (let innerKey in value) {

              if (innerKey == "min") {

                let obj = {};

                if (value['inclusive']['min']) {
                  obj.comparator = "GTE";
                } else {
                  obj.comparator = "GT";
                }

                obj.value = value[innerKey];
                arr.push(obj);

              } else if (innerKey == "max") {

                let obj = {};

                if (value['inclusive']['max']) {
                  obj.comparator = "LTE";
                } else {
                  obj.comparator = "LT";
                }

                obj.value = value[innerKey];
                arr.push(obj);

              }

            }

            arrValues.push(arr);

          }

          distinct.values = arrValues;

          tempModel.data = distinct.model;

          tempValue.push(tempModel);

        }

        rtnVal = tempValue;

        break;
      case 'continuous':

        tempValue = [];

        if (TypeChecker.isArray(filterObj.value)) {

          for (var key in filterObj.value) {
            let contDataArray = this.continousGenericObjectDataProcess(filterGroupType, filterObj.name, filterObj.value[key]);
            tempValue = tempValue.concat(contDataArray);
          }

        } else if (TypeChecker.isObject(filterObj.value)) {

          if (!TypeChecker.isUndefined(filterObj.value.include)) {

            for (var key in filterObj.value.include) {

              let tempModel = {
                type: filterGroupType,
                data: null
              }

              let continuous = new continuousModel();

              continuous.name = filterObj.name;
              continuous.value = parseInt(filterObj.value.include[key]);
              continuous.comparator = "EQ";

              tempModel.data = continuous.model;

              tempValue.push(tempModel);
            }

          } else if (filterObj.name == "date_range") {

            let name = [];

            switch (filterObj.value['way']) {
              case 'started':
                name.push('caseStart', 'caseStart');
                break;
              case 'completed':
                name.push('caseEnd', 'caseEnd');
                break;
              case 'intersection':
                name.push('caseStart', 'caseEnd');
                break;
            }

            for (var i = 0; i < name.length; i++) {

              let tempModel = {
                type: filterGroupType,
                data: null
              }

              let continuous = new continuousModel();

              continuous.name = name[i];

              if (i == 0) {

                if (filterObj.value['way'] != 'intersection') {

                  continuous.comparator = "GTE";
                  //24 Nov 2017: adib.ghazali@gmail.com - convert to epoch time
                  let start = new Date(filterObj.value['startDate']);
                  continuous.value = start.getTime();

                } else {

                  continuous.comparator = "LT";
                  //24 Nov 2017: adib.ghazali@gmail.com - convert to epoch time
                  let end = new Date(filterObj.value['endDate']);
                  continuous.value = end.getTime();

                }
              }

              if (i == 1) {

                if (filterObj.value['way'] != 'intersection') {

                  continuous.comparator = "LT";
                  //24 Nov 2017: adib.ghazali@gmail.com - convert to epoch time
                  let end = new Date(filterObj.value['endDate']);
                  continuous.value = end.getTime();

                } else {

                  continuous.comparator = "GTE";
                  //24 Nov 2017: adib.ghazali@gmail.com - convert to epoch time
                  let start = new Date(filterObj.value['startDate']);
                  continuous.value = start.getTime();

                }
              }

              tempModel.data = continuous.model;
              tempValue.push(tempModel);
            }

          } else {
            let contDataArray = this.continousGenericObjectDataProcess(filterGroupType, filterObj.name, filterObj.value);
            tempValue = tempValue.concat(contDataArray);
          }
        }

        rtnVal = tempValue;

        break;
      case 'connections':
        tempValue = [];

        for (var key in filterObj.value.exclude) {

          let tempModel = {
            type: filterGroupType,
            data: null
          }

          let connections = new connectionsModel();

          connections.source = filterObj.value.exclude[key].source;
          connections.target = filterObj.value.exclude[key].target;
          connections.comparator = "NOT_IN";

          tempModel.data = connections.model;

          tempValue.push(tempModel);
        }

        for (var key in filterObj.value.include) {

          let tempModel = {
            type: filterGroupType,
            data: null
          }

          let connections = new connectionsModel();

          connections.source = filterObj.value.include[key].source;
          connections.target = filterObj.value.include[key].target;
          connections.comparator = "IN";

          tempModel.data = connections.model;

          tempValue.push(tempModel);
        }

        rtnVal = tempValue;

        break;
    }

    return rtnVal;
  },
  continousGenericObjectDataProcess(type, name, value) {

    let tempArray = [];

    for (var key in value) {

      if (key == 'inclusive') {
        continue;
      }

      let tempModel = {
        type: type,
        data: null
      }

      let continuous = new continuousModel();

      continuous.name = name;

      //24 Nov 2017: adib.ghazali@gmail.com - convert to epoch time
      let epochTime = new Date(value[key]);
      continuous.value = epochTime.getTime();

      if (key == "start" || key == "min") {

        if (!TypeChecker.isUndefined(value['inclusive'])) {

          if (value['inclusive'][key]) {
            continuous.comparator = "GTE";
          } else {
            continuous.comparator = "GT";
          }

        } else {
          continuous.comparator = "GTE";
        }

      } else if (key == "end" || key == "max") {

        if (!TypeChecker.isUndefined(value['inclusive'])) {

          if (value['inclusive'][key]) {
            continuous.comparator = "LTE";
          } else {
            continuous.comparator = "LT";
          }

        } else {
          continuous.comparator = "LTE";
        }
      }

      tempModel.data = continuous.model;

      tempArray.push(tempModel);
    }

    return tempArray;
  },
  formatGlobalFilters: function(filters) {

    //Used by process explorer each page
    var formated = {},
      dataFilters = formated.dataFilters = {},
      viewFilters = formated.viewFilters = {};

    viewFilters.viewType = filters.viewType;

    dataFilters.processName = filters.process;
    dataFilters.filters = Object.assign({}, filters.dynamicFilters);
    dataFilters.customerId = filters.customerId;
    dataFilters.recipeId = filters.recipeId;
    dataFilters.processAnalyticsId = filters.processAnalyticsId;

    return formated;
  },
  checkIfChanged: function(newFilters, oldFilters) {

    //Used by process explorer each page
    var newDataStr = CommonUtils.toString(newFilters.dataFilters),
      newViewStr = CommonUtils.toString(newFilters.viewFilters),
      oldDataStr = CommonUtils.toString(oldFilters.dataFilters),
      oldViewStr = CommonUtils.toString(oldFilters.viewFilters);

    return {
      data: newDataStr != oldDataStr,
      view: newViewStr != oldViewStr
    };
  },
  filterDataToString(filterData) {

    //Used by process explorer each page

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
  includeExcludeManipulation(incomingData, existingData, type) {
    //Muhammad Azhaziq (muhammad-azhaziq.bin-mohd-azlan-goh) - 23/2/2018: Uncomment includeExist and excludeExist

    let includeExist, excludeExist;

    for (var key in existingData) {

      if (key == "include") {
        includeExist = existingData[key].findIndex((arr) => {
          if (arr == incomingData) {
            return true;
          } else {
            return false;
          }
        })
      }

      if (key == "exclude") {
        excludeExist = existingData[key].findIndex((arr) => {
          if (arr == incomingData) {
            return true;
          } else {
            return false;
          }
        })
      }
    }

    if (type == "include") {

      if (includeExist == -1 && incomingData) {
        existingData[type].push(incomingData);
      }

      if (excludeExist > -1) {
        existingData["exclude"].splice(excludeExist, 1);
      }

    } else if (type == "exclude") {

      if (includeExist > -1) {
        existingData["include"].splice(includeExist, 1);
      }

      if (excludeExist == -1 && incomingData) {
        existingData[type].push(incomingData);
      }
    }

    return existingData;
  },
  savedFilterTransform(type, data) {

    var transformedData = {};

    switch (type) {
      case 'feApi':

        var dtModel = new apiSaveFilterModel();

        dtModel.name = data.fVal.name;
        dtModel.value = data.fVal.value;
        dtModel.isFavorite = data.fVal.fav;

        transformedData = dtModel.model;

        break;
      case 'apiFe':
        break;
    }

    return transformedData;
  },
  historyFilterTransform(type, data) {

    var transformedData = {};
    var dtModel = {};
    switch (type) {
      case 'feApi':
        if (data.fVal.derivedFromId) {
          dtModel = new apiSaveFilterWithDerivedModel();
          dtModel.derivedFromId = data.fVal.derivedFromId;
        } else {
          dtModel = new apiSaveFilterModel();
        }


        dtModel.name = data.fVal.name;
        dtModel.value = data.fVal.value;
        dtModel.isFavorite = data.fVal.fav;
        transformedData = dtModel.model;
        break;
      case 'apiFe':
        break;
    }

    return transformedData;
  },
  getFilterLabel(filterName){
  	let map = {
  		'date_range': '日期范围',
  		'variant': '分支路径',
  		'touch_points': '接触点',
  		'activity': '活动',
  		'activity_connection': '活动连接',
  		'duration': '持续时间',
  		'attribute': '字段'
  	};
  	return map[filterName];
  }
}
