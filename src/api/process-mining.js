import { axios, cookies, common, axiosHelper } from './api-config.js'
import TypeChecker from '@/utils/type-checker.js'

import MockData from './mock-data/process-mining.js'

let baseUrl = process.env.baseUrl;

let serviceKey = 'process-mining';

let urlPrefix = function(customerId){
  return '';
}

export default {
  filterProcessDefinition(customerId, processAnalyticsId, filters, order, fnAwareCancelFunc, isTest) {
    let endpointKey = '/process_mining/process_definition/:process_name/process_definition_filter';
    let endpointVariantConfig = common.getEndpointVariantConfig(serviceKey, endpointKey);
    let baseURL = baseUrl + urlPrefix(customerId) + '/process_mining/process_definition';
    let longRequestInstance = axiosHelper.createAxios({
      baseURL: baseURL,
      timeout: 90000000
    });
    let url = '/' + processAnalyticsId + '/process_definition_filter';
    let params = { order: order };
    let cancelToken = common.newCancelToken(fnAwareCancelFunc);
    if (isTest) {
      params.test_api = 1;
    }
    return longRequestInstance.post(url, filters, { params: params, cancelToken: cancelToken });
  },
  filterTopTenVariants(customerId, processAnalyticsId, filters, fnAwareCancelFunc) {
    let endpointKey = '/process_mining/process_definition/:process_name/top10_variants_filter';
    let endpointVariantConfig = common.getEndpointVariantConfig(serviceKey, endpointKey);
    let baseURL = baseUrl + urlPrefix(customerId) + '/process_mining/process_definition';
    let longRequestInstance = axiosHelper.createAxios({
      baseURL: baseURL,
      timeout: 90000000
    });
    let url = '/' + processAnalyticsId + '/top10_variants_filter';
    let cancelToken = common.newCancelToken(fnAwareCancelFunc);
    return longRequestInstance.post(url, filters, { cancelToken: cancelToken });
  },
  getRankedVariantsOrderBy(customerId, processAnalyticsId, filters, globalFilter) {
    let endpointKey = '/process_mining/process_definition/:process_name/ranked_variants';
    let endpointVariantConfig = common.getEndpointVariantConfig(serviceKey, endpointKey);
    let baseURL = baseUrl + urlPrefix(customerId) + '/process_mining/process_definition';
    let longRequestInstance = axiosHelper.createAxios({
      baseURL: baseURL,
      timeout: 90000000
    });
    let url = '/' + processAnalyticsId + '/ranked_variants';
    filters.old = true;
    return longRequestInstance.post(url, globalFilter, { params: filters });
  },
  searchVariant(customerId, processAnalyticsId, filters, globalFilter){
    let endpointKey = '/process_mining/process_definition/:process_name/variant_search';
    let endpointVariantConfig = common.getEndpointVariantConfig(serviceKey, endpointKey);
    let baseURL = baseUrl + urlPrefix(customerId) + '/process_mining/process_definition';
    let longRequestInstance = axiosHelper.createAxios({
      baseURL: baseURL,
      timeout: 90000000
    });
    let url = '/' + processAnalyticsId + '/variant_search';
    filters.old = true;
    return longRequestInstance.post(url, globalFilter, { params: filters });
  },
  getDailyCases(customerId, processAnalyticsId, filters, globalFilter) {
    let endpointKey = '/process_mining/process_definition/:process_name/daily_cases';
    let endpointVariantConfig = common.getEndpointVariantConfig(serviceKey, endpointKey);
    let baseURL = baseUrl + urlPrefix(customerId) + '/process_mining/process_definition';
    let longRequestInstance = axiosHelper.createAxios({
      baseURL: baseURL,
      timeout: 90000000
    });
    let url = '/' + processAnalyticsId + '/daily_cases';
    return longRequestInstance.post(url, globalFilter, { params: filters });
  },
  getVariantCases(customerId, processAnalyticsId, filters, globalFilter) {
    let endpointKey = '/process_mining/process_definition/:process_name/variant_cases';
    let endpointVariantConfig = common.getEndpointVariantConfig(serviceKey, endpointKey);
    let baseURL = baseUrl + urlPrefix(customerId) + '/process_mining/process_definition';
    let longRequestInstance = axiosHelper.createAxios({
      baseURL: baseURL,
      timeout: 90000000
    });
    let url = '/' + processAnalyticsId + '/variant_cases';
    filters.old = true;
    return longRequestInstance.post(url, globalFilter, { params: filters });
  },
  getCaseSearch(customerId, processAnalyticsId, filters, globalFilter) {
    let endpointKey = '/process_mining/process_definition/:process_name/case_search';
    let endpointVariantConfig = common.getEndpointVariantConfig(serviceKey, endpointKey);
    let baseURL = baseUrl + urlPrefix(customerId) + '/process_mining/process_definition';
    let longRequestInstance = axiosHelper.createAxios({
      baseURL: baseURL,
      timeout: 90000000
    });
    let url = '/' + processAnalyticsId + '/case_search';
    filters.old = true;
    return longRequestInstance.post(url, globalFilter, { params: filters });
  },
  getCaseDetail(customerId, processAnalyticsId, filters) {
    let endpointKey = '/process_mining/process_definition/:process_name/case_detail';
    let endpointVariantConfig = common.getEndpointVariantConfig(serviceKey, endpointKey);
    let baseURL = baseUrl + urlPrefix(customerId) + '/process_mining/process_definition';
    let longRequestInstance = axiosHelper.createAxios({
      baseURL: baseURL,
      timeout: 90000000
    });
    let url = '/' + processAnalyticsId + '/case_detail';
    return longRequestInstance.get(url, { params: filters }, filters);
  },
  filterKpiAggregator(customerId, customerName, processAnalyticsId, filters, order, fnAwareCancelFunc, isTest) {
    let endpointKey = '/process_mining/process_definition/:process_name/kpi/aggregator_filter';
    let endpointVariantConfig = common.getEndpointVariantConfig(serviceKey, endpointKey);
    let baseURL = baseUrl + urlPrefix(customerId) + '/process_mining/process_definition';
    let longRequestInstance = axiosHelper.createAxios({
      baseURL: baseURL,
      timeout: 90000000
    });
    let url = '/' + processAnalyticsId + '/kpi/aggregator_filter';
    let params = { order: order };
    let cancelToken = common.newCancelToken(fnAwareCancelFunc);
    if (isTest) {
      params.test_api = 1;
    }
    return longRequestInstance.post(url, filters, { params: params, cancelToken: cancelToken });
  },
  filterKpiDetail(customerId, customerName, processAnalyticsId, filters, order, fnAwareCancelFunc, isTest) {
    let endpointKey = '/process_mining/process_definition/:process_name/kpi/detail_filter';
    let endpointVariantConfig = common.getEndpointVariantConfig(serviceKey, endpointKey);
    let baseURL = baseUrl + urlPrefix(customerId) + '/process_mining/process_definition';
    let longRequestInstance = axiosHelper.createAxios({
      baseURL: baseURL,
      timeout: 90000000
    });
    let url = '/' + processAnalyticsId + '/kpi/detail_filter';
    let params = { order: order };
    let cancelToken = common.newCancelToken(fnAwareCancelFunc);
    if (isTest) {
      params.test_api = 1;
    }
    return longRequestInstance.post(url, filters, { params: params, cancelToken: cancelToken });
  },
  filterAnalysis: function(customerId, processAnalyticsId, filters, fnAwareCancelFunc) {
    let endpointKey = '/process_mining/process_definition/:process_name/analysis';
    let endpointVariantConfig = common.getEndpointVariantConfig(serviceKey, endpointKey);
    let baseURL = baseUrl + urlPrefix(customerId) + '/process_mining/process_definition';
    let longRequestInstance = axiosHelper.createAxios({
      baseURL: baseURL,
      timeout: 90000000
    });
    let url = '/' + processAnalyticsId + '/analysis';
    let cancelToken = common.newCancelToken(fnAwareCancelFunc);
    return longRequestInstance.post(url, filters, { cancelToken: cancelToken });
  },
  analysisOverview: function(customerId, processAnalyticsId, filters, order, fnAwareCancelFunc){
    // debugger;
    let endpointKey = '/process_mining/process_definition/:process_name/analysis_overview';
    let endpointVariantConfig = common.getEndpointVariantConfig(serviceKey, endpointKey);
    let baseURL = baseUrl + urlPrefix(customerId) + '/process_mining/process_definition';
    let longRequestInstance = axiosHelper.createAxios({
      baseURL: baseURL,
      timeout: 90000000
    });
    let url = '/' + processAnalyticsId + '/analysis_overview';
    let cancelToken = common.newCancelToken(fnAwareCancelFunc);
    let params = {rank: order};
    return longRequestInstance.post(url, filters, {params: params, cancelToken: cancelToken});
  },
  filterAnalysisDashboard: function(customerId, processAnalyticsId, filters, order, fnAwareCancelFunc){
    // debugger;
    let endpointKey = '/process_mining/process_definition/:process_name/analysis';
    let endpointVariantConfig = common.getEndpointVariantConfig(serviceKey, endpointKey);
    let baseURL = baseUrl + urlPrefix(customerId) + '/process_mining/process_definition';
    let longRequestInstance = axiosHelper.createAxios({
      baseURL: baseURL,
      timeout: 90000000
    });
    let url = '/' + processAnalyticsId + '/analysis';
    let cancelToken = common.newCancelToken(fnAwareCancelFunc);
    let params = {rank: order};
    return longRequestInstance.post(url, filters, { params: params, cancelToken: cancelToken });
  },
  getLastDashboardViewType:function(customerId, processAnalyticsId){
    let instance = axiosHelper.createAxios({
      baseURL: baseUrl + urlPrefix(customerId) + '/onboarding-api',
      timeout: 30000
    });
    let url = '/dashboard_config/' + processAnalyticsId ;
    return instance.get(url);        
  },
  getTouchPointData: function(customerId, processAnalyticsId) {
    let endpointKey = '/dynamic_filter/:process_name/touch_points';
    let endpointVariantConfig = common.getEndpointVariantConfig(serviceKey, endpointKey);
    let baseURL = baseUrl + urlPrefix(customerId) + '/dynamic_filter';
    let theInstance = axiosHelper.createAxios({
      baseURL: baseURL,
      timeout: 90000
    });
    let url = '/' + processAnalyticsId + '/touch_points';

    return theInstance.get(url);
  },
  getSavedFilter(customerId, processId) {

    let endpointKey = '/user_filter/:process_id/saved';
    let endpointVariantConfig = common.getEndpointVariantConfig(serviceKey, endpointKey);
    let baseURL = baseUrl + urlPrefix(customerId) + '/user_filter';
    let theInstance = axiosHelper.createAxios({
      baseURL: baseURL,
      timeout: 90000
    });

    let url = `/${processId}/saved`;

    return theInstance.get(url);

  },
  setSavedFilter(customerId, processId, data) {

    let endpointKey = '/user_filter/:process_id/saved';
    let endpointVariantConfig = common.getEndpointVariantConfig(serviceKey, endpointKey);
    let baseURL = baseUrl + urlPrefix(customerId) + '/user_filter';
    let theInstance = axiosHelper.createAxios({
      baseURL: baseURL,
      timeout: 90000
    });

    return theInstance.post(`/${processId}/saved`, data);

  },
  updateSavedFilter(customerId, processId, filterId, data) {

    let endpointKey = '/user_filter/:process_id/saved/:filterId';
    let endpointVariantConfig = common.getEndpointVariantConfig(serviceKey, endpointKey);
    let baseURL = baseUrl + urlPrefix(customerId) + '/user_filter';
    let theInstance = axiosHelper.createAxios({
      baseURL: baseURL,
      timeout: 90000
    });

    let url = `/${processId}/saved/${filterId}`;

    return theInstance.put(url, data);

  },
  deleteSavedFilter(customerId, processId, filterId) {

    let endpointKey = '/user_filter/:process_id/saved/:filter_id';
    let endpointVariantConfig = common.getEndpointVariantConfig(serviceKey, endpointKey);
    let baseURL = baseUrl + urlPrefix(customerId) + '/user_filter';
    let theInstance = axiosHelper.createAxios({
      baseURL: baseURL,
      timeout: 90000
    });

    let url = `/${processId}/saved/${filterId}`;

    return theInstance.delete(url);

  },
  getHistoryFilter(customerId, processId) {

    let endpointKey = '/user_filter/:process_id/history';
    let endpointVariantConfig = common.getEndpointVariantConfig(serviceKey, endpointKey);
    let baseURL = baseUrl + urlPrefix(customerId) + '/user_filter';
    let theInstance = axiosHelper.createAxios({
      baseURL: baseURL,
      timeout: 90000
    });

    let url = `/${processId}/history`;

    return theInstance.get(url);

  },
  createHistoryFilter(customerId, processId, data) {

    let endpointKey = '/user_filter/:process_id/history';
    let endpointVariantConfig = common.getEndpointVariantConfig(serviceKey, endpointKey);
    let baseURL = baseUrl + urlPrefix(customerId) + '/user_filter';
    let theInstance = axiosHelper.createAxios({
      baseURL: baseURL,
      timeout: 90000
    });

    return theInstance.post(`/${processId}/history`, data);

  },
  updateHistoryFilter(customerId, processId, filterId, data) {
    
    let endpointKey = '/user_filter/:process_id/history/:filterId';
    let endpointVariantConfig = common.getEndpointVariantConfig(serviceKey, endpointKey);
    let baseURL = baseUrl + urlPrefix(customerId) + '/user_filter';
    let theInstance = axiosHelper.createAxios({
      baseURL: baseURL,
      timeout: 90000
    });

    let url = `/${processId}/history/${filterId}`;

    return theInstance.put(url, data);

  },
  deleteHistoryFilter(customerId, processId, filterId) {

    let endpointKey = '/user_filter/:process_id/history/:filter_id';
    let endpointVariantConfig = common.getEndpointVariantConfig(serviceKey, endpointKey);
    let baseURL = baseUrl + urlPrefix(customerId) + '/user_filter';
    let theInstance = axiosHelper.createAxios({
      baseURL: baseURL,
      timeout: 90000
    });

    let url = `/${processId}/history/${filterId}`;

    return theInstance.delete(url);

  },
  getDurationData(customerId, pName) {
    let endpointKey = '/dynamic_filter/:process_name/duration';
    let endpointVariantConfig = common.getEndpointVariantConfig(serviceKey, endpointKey);
    let baseURL = baseUrl + urlPrefix(customerId) + '/dynamic_filter';
    let theInstance = axiosHelper.createAxios({
      baseURL: baseURL,
      timeout: 90000
    });
    let url = '/' + pName + '/duration';
    return theInstance.get(url);
  },
  getActivityConnectionData(customerId, pName) {
    let endpointKey = '/dynamic_filter/:process_name/activity_connection';
    let endpointVariantConfig = common.getEndpointVariantConfig(serviceKey, endpointKey);
    let baseURL = baseUrl + urlPrefix(customerId) + '/dynamic_filter';
    let theInstance = axiosHelper.createAxios({
      baseURL: baseURL,
      timeout: 90000
    });
    let url = '/' + pName + '/activity_connection';
    return theInstance.get(url);
  },
  getAttributesList(customerId, processName) {
    let endpointKey = '/dynamic_filter/:process_name/attribute';
    let endpointVariantConfig = common.getEndpointVariantConfig(serviceKey, endpointKey);
    let baseURL = baseUrl + urlPrefix(customerId) + '/dynamic_filter';
    let theInstance = axiosHelper.createAxios({
      baseURL: baseURL,
      timeout: 90000
    });
    let url = '/' + processName + '/attribute';
    return theInstance.get(url);
  },
  getAttribute(customerId, processName, filterBy) {
    let endpointKey = '/dynamic_filter/:process_name/attribute';
    let endpointVariantConfig = common.getEndpointVariantConfig(serviceKey, endpointKey);
    let baseURL = baseUrl + urlPrefix(customerId) + '/dynamic_filter';
    let theInstance = axiosHelper.createAxios({
      baseURL: baseURL,
      timeout: 90000
    });
    let url = '/' + processName + '/attribute/' + filterBy;

    return theInstance.get(url);
  },
  getVariantsData(customerId, processName) {
    let endpointKey = '/dynamic_filter/:process_name/variant';
    let endpointVariantConfig = common.getEndpointVariantConfig(serviceKey, endpointKey);
    let baseURL = baseUrl + urlPrefix(customerId) + '/dynamic_filter';
    let theInstance = axiosHelper.createAxios({
      baseURL: baseURL,
      timeout: 90000
    });
    let url = '/' + processName + '/variant';
    return theInstance.get(url);
  },
  getActivityData(customerId, processName) {
    let endpointKey = '/dynamic_filter/:process_name/activity';
    let endpointVariantConfig = common.getEndpointVariantConfig(serviceKey, endpointKey);
    let baseURL = baseUrl + urlPrefix(customerId) + '/dynamic_filter';
    let theInstance = axiosHelper.createAxios({
      baseURL: baseURL,
      timeout: 90000
    });
    let url = '/' + processName + '/activity';
    return theInstance.get(url);
  },
  getRangeData(customerId, processAnalyticsId) {
    let endpointKey = '/dynamic_filter/:process_name/date_range';
    let endpointVariantConfig = common.getEndpointVariantConfig(serviceKey, endpointKey);
    let baseURL = baseUrl + urlPrefix(customerId) + '/dynamic_filter';
    let theInstance = axiosHelper.createAxios({
      baseURL: baseURL,
      timeout: 90000
    });
    let url = '/' + processAnalyticsId + '/date_range';
    return theInstance.get(url);
  }

}
