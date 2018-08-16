import ProcessAnalyticsApi from '@/api/process-discovery/process-analytics.js'
import ProcessMiningApi from '@/api/process-mining.js'
import TypeChecker from '@/utils/type-checker.js'
import StringUtils from '@/utils/string-utils.js'

function AnalysisDashboardDataReactor() {
  this._fnAwareTotalDescription = null;
  this._fnAwareCaseDistributionByMonthYear = null;

  this._caseDistriubtionFields = ['invoiceType', 'companyCode', 'channel', 'documentType'];
  this._fnAwareCaseDistributionByFields = null;

  this._fnAwareCaseDistributionByVendorAndDiscrepancy = null;

  this._fnAwareOrderValueDistributionByCurrency = null;

  this._fnOnAllRequestsEnd = null;
  this._fnOnRequestError = null;
}

AnalysisDashboardDataReactor.prototype.totalDescription = function(fnAwareTotalDescription) {
  this._fnAwareTotalDescription = fnAwareTotalDescription;
  return this;
};

AnalysisDashboardDataReactor.prototype.caseDistributionByMonthYear = function(fnAwareCaseDistributionByMonthYear) {
  this._fnAwareCaseDistributionByMonthYear = fnAwareCaseDistributionByMonthYear;
  return this;
};

AnalysisDashboardDataReactor.prototype.caseDistributionByFields = function(fields, fnAwareCaseDistributionByFields) {
  this._caseDistriubtionFields = fields;
  this._fnAwareCaseDistributionByFields = fnAwareCaseDistributionByFields;
  return this;
};

AnalysisDashboardDataReactor.prototype.caseDistributionByVendorAndDiscrepancy = function(fnAwareCaseDistributionByVendorAndDiscrepancy) {
  this._fnAwareCaseDistributionByVendorAndDiscrepancy = fnAwareCaseDistributionByVendorAndDiscrepancy;
  return this;
};

AnalysisDashboardDataReactor.prototype.orderValueDistributionByCurrency = function(fnAwareOrderValueDistributionByCurrency) {
  this._fnAwareOrderValueDistributionByCurrency = fnAwareOrderValueDistributionByCurrency;
  return this;
};

AnalysisDashboardDataReactor.prototype.success = function(fnOnEnd) {
  this._fnOnAllRequestsEnd = fnOnEnd;
  return this;
};

AnalysisDashboardDataReactor.prototype.error = function(fnOnError) {
  this._fnOnRequestError = fnOnError;
  return this;
};

AnalysisDashboardDataReactor.prototype.parse = function(customerId, processId, filters) {
  let vm = this;

  var fnParseForTotalDescription = function(data) {
    if (TypeChecker.isFunction(vm._fnAwareTotalDescription)) {
      var _data = {
        startDate: (data.overall && data.overall.startDate) ? data.overall.startDate : null,
        endDate: (data.overall && data.overall.endDate) ? data.overall.endDate : null,
        invoiceCount: (data.overall && data.overall.caseCount) ? data.overall.caseCount : 0,
        averageDuration: (data.overall && data.overall.averageDuration) ? data.overall.averageDuration : 0
      };
      vm._fnAwareTotalDescription.call(vm, _data);
    }
  };

  var fnParseForCaseDistributionByMonthYear = function(data) {
    if (TypeChecker.isFunction(vm._fnAwareCaseDistributionByMonthYear)) {
      vm._fnAwareCaseDistributionByMonthYear.call(vm, data.caseCountByMonthYear || []);
    }
  };

  var fnParseForCaseDistributionByFields = function(data) {
    if (TypeChecker.isFunction(vm._fnAwareCaseDistributionByFields) && TypeChecker.isArray(vm._caseDistriubtionFields) && vm._caseDistriubtionFields.length > 0) {
      let oCaseCountByFields = {},
        oCycleTimeByFields = {};
      vm._caseDistriubtionFields.forEach(field => {
        oCaseCountByFields[field] = data['caseCountBy' + StringUtils.capitalize(field)] || [];
        oCycleTimeByFields[field] = data['averageDurationBy' + StringUtils.capitalize(field)] || [];
      });
      let _data = {};
      for (let key in oCaseCountByFields) {
        if (oCaseCountByFields.hasOwnProperty(key)) {
          _data[key] = [];
          var aValue = oCaseCountByFields[key];
          aValue.forEach(oItem => {
            _data[key].push({
              name: oItem.name,
              caseCount: oItem.caseCount,
              cycleTime: 0
            });
          });
        }
      }
      for (let key in oCycleTimeByFields) {
        if (oCycleTimeByFields.hasOwnProperty(key)) {
          if (!_data[key]) {
            _data[key] = [];
          }
          var aValue = oCycleTimeByFields[key];
          aValue.forEach(oItem => {
            // find the existed item in _data[key]
            var oExistedItem = null;
            _data[key].every(oTheItem => {
              if (oTheItem.name == oItem.name) {
                oExistedItem = oTheItem;
                return false;
              }
              return true;
            });
            if (oExistedItem) {
              oExistedItem.cycleTime = oItem.avgDuration;
            } else {
              _data[key].push({
                name: oItem.name,
                caseCount: 0,
                cycleTime: oItem.avgDuration
              });
            }
          });
        }
      }
      if (_data['channel']) {
        _data['submissionChannel'] = _data['channel'];
        delete _data['channel'];
      }
      vm._fnAwareCaseDistributionByFields.call(vm, _data);
    }
  }

  var fnParseForCaseDistributionByVendorAndDiscrepancy = function(data) {
    if (TypeChecker.isFunction(vm._fnAwareCaseDistributionByVendorAndDiscrepancy)) {
      var _data = { vendor: [], discrepancy: [] };
      var aVendorCaseCount = data.caseCountByVendor || [];
      var aVendorCycleTime = data.averageDurationByVendor || [];
      var aDiscrepencyCaseCount = data.caseCountByDiscrepancy || [];
      var aDiscrepencyCycleTime = data.averageDurationByDiscrepancy || [];
      var nTotalCaseCount = (data.overall && data.overall.caseCount) ? data.overall.caseCount : 0;

      aVendorCaseCount.forEach(oItem => {
        _data.vendor.push({
          name: oItem.name,
          caseCount: oItem.caseCount,
          cycleTime: 0,
          percentage: nTotalCaseCount == 0 ? 0 : (oItem.caseCount * 100 / nTotalCaseCount)
        });
      });

      aVendorCycleTime.forEach(oItem => {
        // find the existed item
        var oExistedItem = null;
        _data.vendor.every(oTheItem => {
          if (oTheItem.name == oItem.name) {
            oExistedItem = oTheItem;
            return false;
          }
          return true;
        });
        if (oExistedItem) {
          oExistedItem.cycleTime = oItem.avgDuration;
        } else {
          _data.vendor.push({
            name: oItem.name,
            caseCount: 0,
            cycleTime: oItem.avgDuration,
            percentage: 0
          });
        }
      });

      aDiscrepencyCaseCount.forEach(oItem => {
        _data.discrepancy.push({
          name: oItem.name,
          caseCount: oItem.caseCount,
          cycleTime: 0,
          percentage: nTotalCaseCount == 0 ? 0 : (oItem.caseCount * 100 / nTotalCaseCount)
        });
      });

      aDiscrepencyCycleTime.forEach(oItem => {
        // find the existed item
        var oExistedItem = null;
        _data.discrepancy.every(oTheItem => {
          if (oTheItem.name == oItem.name) {
            oExistedItem = oTheItem;
            return false;
          }
          return true;
        });
        if (oExistedItem) {
          oExistedItem.cycleTime = oItem.avgDuration;
        } else {
          _data.discrepancy.push({
            name: oItem.name,
            caseCount: 0,
            cycleTime: oItem.avgDuration,
            percentage: 0
          });
        }
      });

      vm._fnAwareCaseDistributionByVendorAndDiscrepancy.call(vm, _data);
    }
  };

  var fnParseForOrderValueDistributionByCurrency = function(data) {
    if (TypeChecker.isFunction(vm._fnAwareOrderValueDistributionByCurrency)) {
      var _data = {};
      _data.netAmount = (data.orderValueByCurrency && data.orderValueByCurrency.netAmount) ? data.orderValueByCurrency.netAmount : [];
      _data.grossAmount = (data.orderValueByCurrency && data.orderValueByCurrency.grossAmount) ? data.orderValueByCurrency.grossAmount : [];
      vm._fnAwareOrderValueDistributionByCurrency.call(vm, _data);
    }
  };

  ProcessMiningApi.filterAnalysis(customerId, processId, filters).then(res => {
    let theData = res.data;
    if(!TypeChecker.isObject(theData)) {
      theData = {};
    }
    fnParseForTotalDescription(theData);
    fnParseForCaseDistributionByMonthYear(theData);
    fnParseForCaseDistributionByFields(theData);
    fnParseForCaseDistributionByVendorAndDiscrepancy(theData);
    fnParseForOrderValueDistributionByCurrency(theData);

    if (TypeChecker.isFunction(vm._fnOnAllRequestsEnd)) {
      vm._fnOnAllRequestsEnd.call(vm);
    }
  }, err => {
    let theData = {};
    fnParseForTotalDescription(theData);
    fnParseForCaseDistributionByMonthYear(theData);
    fnParseForCaseDistributionByFields(theData);
    fnParseForCaseDistributionByVendorAndDiscrepancy(theData);
    fnParseForOrderValueDistributionByCurrency(theData);
    if (TypeChecker.isFunction(vm._fnOnRequestError)) {
      vm._fnOnRequestError.call(vm, err);
    }
  });
};

AnalysisDashboardDataReactor.prototype.react = function(customerId, processId, filters) {
  let vm = this;
  let caseStartPromise, caseEndPromise, descriptionPromise, fieldsPromise, caseCountByMonthYearPromise,
    caseCountByFieldsPromises = {},
    cycleTimeByFieldsPromises = {},
    caseDistributionByVendorAndDiscrepancyPromises = { vendor: {}, discrepancy: null, description: null },
    orderValueDistributionByCurrencyPromises = { netAmount: null, grossAmount: null };
  // total description
  var fnTotalDescription = function() {
    if (TypeChecker.isFunction(vm._fnAwareTotalDescription)) {
      let aCaseStartValues, aCaseEndValues, oDescription;
      if (!caseStartPromise) {
        caseStartPromise = new Promise((resolve, reject) => {
          ProcessAnalyticsApi.fieldValues(customerId, processId, filters, 'caseStart', 'range').then(res => {

            aCaseStartValues = res.data;
            resolve(res);
          }, err => {
            reject(err);
          });
        });
      }

      if (!caseEndPromise) {
        caseEndPromise = new Promise((resolve, reject) => {
          ProcessAnalyticsApi.fieldValues(customerId, processId, filters, 'caseEnd', 'range').then(res => {

            aCaseEndValues = res.data;
            resolve(res);
          }, err => {
            reject(err);
          });
        });
      }

      if (!descriptionPromise) {
        descriptionPromise = new Promise((resolve, reject) => {
          ProcessAnalyticsApi.description(customerId, processId, filters).then(res => {

            oDescription = res.data;
            resolve(res);
          }, err => {
            reject(err);
          });
        });
      }

      return Promise.all([caseStartPromise, caseEndPromise, descriptionPromise]).then(() => {
        var data = {};
        if (TypeChecker.isArray(aCaseStartValues) && aCaseStartValues.length > 1) {
          data.startDate = aCaseStartValues.reverse()[aCaseStartValues.length - 1];
        }
        if (TypeChecker.isArray(aCaseEndValues) && aCaseEndValues.length > 1) {
          data.endDate = aCaseEndValues.sort()[aCaseEndValues.length - 1];
        }
        if (TypeChecker.isObject(oDescription)) {
          data.invoiceCount = oDescription.caseCount;
          data.averageDuration = oDescription.averageDuration;
        }
        vm._fnAwareTotalDescription.call(vm, data);
      }, err => {
        console.error(err);
      });
    }
    return null;
  };

  // case distribution by month year
  var fnCaseDistributionByMonthYear = function() {
    if (TypeChecker.isFunction(vm._fnAwareCaseDistributionByMonthYear)) {
      let aCaseCountByMonthYear;
      if (!caseCountByMonthYearPromise) {
        caseCountByMonthYearPromise = new Promise((resolve, reject) => {
          ProcessAnalyticsApi.caseCountByMonthYear(customerId, processId, filters).then(res => {

            aCaseCountByMonthYear = res.data;
            resolve(res);
          }, err => {
            reject(err);
          });
        });
      }

      caseCountByMonthYearPromise.then(() => {
        if (TypeChecker.isArray(aCaseCountByMonthYear)) {
          vm._fnAwareCaseDistributionByMonthYear.call(vm, aCaseCountByMonthYear);
        }
      }, err => {
        console.error(err);
      });

      return caseCountByMonthYearPromise;
    }
    return null;
  };

  // case distribution by fields
  var fnCaseDistributionByFields = function() {
    if (TypeChecker.isFunction(vm._fnAwareCaseDistributionByFields) && TypeChecker.isArray(vm._caseDistriubtionFields) && vm._caseDistriubtionFields.length > 0) {
      let targetsToWatch = [],
        oCaseCountByFields = {},
        oCycleTimeByFields = {};
      vm._caseDistriubtionFields.forEach((field) => {
        if (!caseCountByFieldsPromises[field]) {
          caseCountByFieldsPromises[field] = new Promise((resolve, reject) => {
            ProcessAnalyticsApi.caseCountBy(customerId, processId, filters, field).then(res => {

              oCaseCountByFields[field] = res.data;
              resolve(res);
            }, err => {
              reject(err)
            });
          });
          targetsToWatch.push(caseCountByFieldsPromises[field]);
        }

        if (!cycleTimeByFieldsPromises[field]) {
          cycleTimeByFieldsPromises[field] = new Promise((resolve, reject) => {
            ProcessAnalyticsApi.averageDurationBy(customerId, processId, filters, field).then(res => {

              oCycleTimeByFields[field] = res.data;
              resolve(res);
            }, err => {
              reject(err);
            });
          });
          targetsToWatch.push(cycleTimeByFieldsPromises[field]);
        }
      });

      return Promise.all(targetsToWatch).then(() => {
        let data = {};
        for (let key in oCaseCountByFields) {
          if (oCaseCountByFields.hasOwnProperty(key)) {
            data[key] = [];
            var aValue = oCaseCountByFields[key];
            aValue.forEach(oItem => {
              data[key].push({
                name: oItem.name,
                caseCount: oItem.caseCount,
                cycleTime: 0
              });
            });
          }
        }
        for (let key in oCycleTimeByFields) {
          if (oCycleTimeByFields.hasOwnProperty(key)) {
            if (!data[key]) {
              data[key] = [];
            }
            var aValue = oCycleTimeByFields[key];
            aValue.forEach(oItem => {
              // find the existed item in data[key]
              var oExistedItem = null;
              data[key].every(oTheItem => {
                if (oTheItem.name == oItem.name) {
                  oExistedItem = oTheItem;
                  return false;
                }
                return true;
              });
              if (oExistedItem) {
                oExistedItem.cycleTime = oItem.avgDuration;
              } else {
                data[key].push({
                  name: oItem.name,
                  caseCount: 0,
                  cycleTime: oItem.avgDuration
                });
              }
            });
          }
        }
        if (data['channel']) {
          data['submissionChannel'] = data['channel'];
          delete data['channel'];
        }
        vm._fnAwareCaseDistributionByFields.call(vm, data);
      }, err => {
        console.error(err);
      });
    }
    return null;
  };

  // case distribution by vender and discrepancy
  var fnCaseDistributionByVendorAndDiscrepancy = function() {
    if (TypeChecker.isFunction(vm._fnAwareCaseDistributionByVendorAndDiscrepancy)) {
      let oCaseDistributionByVendorAndDiscrepancy = { vendor: {}, discrepancy: {}, description: null };
      if (caseCountByFieldsPromises.vendor) {
        caseDistributionByVendorAndDiscrepancyPromises.vendor.caseCount = new Promise((resolve, reject) => {
          Promise.resolve(caseCountByFieldsPromises.vendor).then(res => {
            oCaseDistributionByVendorAndDiscrepancy.vendor.caseCount = res.data;
            resolve(res);
          }, err => {
            reject(err);
          });
        });
      } else if (!caseDistributionByVendorAndDiscrepancyPromises.vendor.caseCount) {
        caseDistributionByVendorAndDiscrepancyPromises.vendor.caseCount = new Promise((resolve, reject) => {
          ProcessAnalyticsApi.caseCountBy(customerId, processId, filters, 'vendor').then(res => {

            oCaseDistributionByVendorAndDiscrepancy.vendor.caseCount = res.data;
            resolve(res);
          }, err => {
            reject(err);
          });
        });
      }

      if (cycleTimeByFieldsPromises.vendor) {
        caseDistributionByVendorAndDiscrepancyPromises.vendor.cycleTime = new Promise((resolve, reject) => {
          Promise.resolve(cycleTimeByFieldsPromises.vendor).then(res => {
            oCaseDistributionByVendorAndDiscrepancy.vendor.cycleTime = res.data;
            resolve(res);
          }, err => {
            reject(err);
          });
        });
      } else if (!caseDistributionByVendorAndDiscrepancyPromises.vendor.cycleTime) {
        caseDistributionByVendorAndDiscrepancyPromises.vendor.cycleTime = new Promise((resolve, reject) => {
          ProcessAnalyticsApi.averageDurationBy(customerId, processId, filters, 'vendor').then(res => {

            oCaseDistributionByVendorAndDiscrepancy.vendor.cycleTime = res.data;
            resolve(res);
          }, err => {
            reject(err);
          });
        });
      }

      if (!caseDistributionByVendorAndDiscrepancyPromises.discrepancy) {
        caseDistributionByVendorAndDiscrepancyPromises.discrepancy = new Promise((resolve, reject) => {
          ProcessAnalyticsApi.caseCountByDiscrepancy(customerId, processId, filters).then(res => {
            oCaseDistributionByVendorAndDiscrepancy.discrepancy = res.data;
            resolve(res);
          }, err => {
            reject(err);
          });
        });
      }

      if (descriptionPromise) {
        caseDistributionByVendorAndDiscrepancyPromises.description = new Promise((resolve, reject) => {
          Promise.resolve(descriptionPromise).then(res => {
            oCaseDistributionByVendorAndDiscrepancy.description = res.data;
            resolve(res);
          }, err => {
            reject(err);
          });
        });
      }

      return Promise.all([caseDistributionByVendorAndDiscrepancyPromises.vendor.caseCount,
        caseDistributionByVendorAndDiscrepancyPromises.vendor.cycleTime,
        caseDistributionByVendorAndDiscrepancyPromises.discrepancy,
        caseDistributionByVendorAndDiscrepancyPromises.description
      ]).then(() => {
        var data = { vendor: [], discrepancy: [] };
        var aVendorCaseCount = oCaseDistributionByVendorAndDiscrepancy.vendor.caseCount;
        var aVendorCycleTime = oCaseDistributionByVendorAndDiscrepancy.vendor.cycleTime;
        var aDiscrepency = oCaseDistributionByVendorAndDiscrepancy.discrepancy;
        var nTotalCaseCount = oCaseDistributionByVendorAndDiscrepancy.description.caseCount;

        aVendorCaseCount.forEach(oItem => {
          data.vendor.push({
            name: oItem.name,
            caseCount: oItem.caseCount,
            cycleTime: 0,
            percentage: nTotalCaseCount == 0 ? 0 : (oItem.caseCount * 100 / nTotalCaseCount)
          });
        });

        aVendorCycleTime.forEach(oItem => {
          // find the existed item
          var oExistedItem = null;
          data.vendor.every(oTheItem => {
            if (oTheItem.name == oItem.name) {
              oExistedItem = oTheItem;
              return false;
            }
            return true;
          });
          if (oExistedItem) {
            oExistedItem.cycleTime = oItem.avgDuration;
          } else {
            data.vendor.push({
              name: oItem.name,
              caseCount: 0,
              cycleTime: oItem.avgDuration,
              percentage: 0
            });
          }
        });

        data.discrepancy = aDiscrepency.map(d => {
          return {
            name: d.discrepancy,
            caseCount: d.numberOfCases,
            cycleTime: d.cycleTime,
            percentage: nTotalCaseCount == 0 ? 0 : (d.numberOfCases * 100 / nTotalCaseCount)
          }
        });

        vm._fnAwareCaseDistributionByVendorAndDiscrepancy.call(vm, data);
      }, err => {
        console.error(err);
      });
    }
    return null;
  };

  // order value distribution by currency
  var fnOrderValueDistributionByCurrency = function() {
    if (TypeChecker.isFunction(vm._fnAwareOrderValueDistributionByCurrency)) {
      let aGrossAmount, aNetAmount;
      if (!orderValueDistributionByCurrencyPromises.grossAmount) {
        orderValueDistributionByCurrencyPromises.grossAmount = new Promise((resolve, reject) => {
          ProcessAnalyticsApi.chart(customerId, processId, {
            "groupBy": ["currencyCode"],
            "aggregateOn": [{ "field": "grossAmount", "method": "SUM", "as": "sum" }],
            "filter": filters
          }).then(res => {

            aGrossAmount = res.data;
            resolve(res);
          }, err => {
            reject(err);
          });
        });
      }
      if (!orderValueDistributionByCurrencyPromises.netAmount) {
        orderValueDistributionByCurrencyPromises.netAmount = new Promise((resolve, reject) => {
          ProcessAnalyticsApi.chart(customerId, processId, {
            "groupBy": ["currencyCode"],
            "aggregateOn": [{ "field": "netAmount", "method": "SUM", "as": "sum" }],
            "filter": filters
          }).then(res => {

            aNetAmount = res.data;
            resolve(res);
          }, err => {
            reject(err);
          });
        });
      }

      return Promise.all([orderValueDistributionByCurrencyPromises.grossAmount, orderValueDistributionByCurrencyPromises.netAmount]).then(() => {
        var data = {};
        data.netAmount = aNetAmount;
        data.grossAmount = aGrossAmount;
        vm._fnAwareOrderValueDistributionByCurrency.call(vm, data);
      }, err => {
        console.error(err);
      });
    }
    return null;
  };

  let overallPromises = [];
  let pDescription = fnTotalDescription();
  if (pDescription) overallPromises.push(pDescription);

  let pCaseDistributionByMonthYear = fnCaseDistributionByMonthYear();
  if (pCaseDistributionByMonthYear) overallPromises.push(pCaseDistributionByMonthYear);

  let pCaseDistributionByFields = fnCaseDistributionByFields();
  if (pCaseDistributionByFields) overallPromises.push(pCaseDistributionByFields);

  let pCaseDistriubtionByVendorAndDiscrepancy = fnCaseDistributionByVendorAndDiscrepancy();
  if (pCaseDistriubtionByVendorAndDiscrepancy) overallPromises.push(pCaseDistriubtionByVendorAndDiscrepancy);

  let pOrderValueDistributionByCurrency = fnOrderValueDistributionByCurrency();
  if (pOrderValueDistributionByCurrency) overallPromises.push(pOrderValueDistributionByCurrency);

  Promise.all(overallPromises).then(() => {
    if (TypeChecker.isFunction(vm._fnOnAllRequestsEnd)) {
      vm._fnOnAllRequestsEnd.call(vm);
    }
  }, err => {
    if (TypeChecker.isFunction(vm._fnOnRequestError)) {
      vm._fnOnRequestError.call(vm, err);
    }
  });

};

export default AnalysisDashboardDataReactor
