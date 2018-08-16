import { axios, cookies, common, axiosHelper } from './api-config.js'
import TypeChecker from '@/utils/type-checker.js'

let baseUrl = process.env.baseUrl;

let instance = axiosHelper.createAxios({
  baseURL: (baseUrl + '/api-gateway'),
  timeout: 60000
});

let urlPrefix = function(customerId, processId){
	return `/${customerId}/process-analytics/api/v1/process/${processId}`;
}

export default {
	getDetail(customerId, processId, isTest){
		let url = urlPrefix(customerId, processId);
    let params = {};
    if (TypeChecker.isBoolean(isTest) && isTest) {
      params.test_api = 1;
    }
    return instance.get(url, { params: params});
	},
	detail(customerId, processId, filters, isTest){
		let url = urlPrefix(customerId, processId);
    let params = {};
    if (TypeChecker.isBoolean(isTest) && isTest) {
      params.test_api = 1;
    }
    return instance.post(url, filters, { params: params});
	},
  description(customerId, processId, filters, isTest) {
    let url = urlPrefix(customerId, processId) + '/filter/description';
    let params = {};
    if (TypeChecker.isBoolean(isTest) && isTest) {
      params.test_api = 1;
    }
    return instance.post(url, filters, { params: params});
  },
  caseCountByMonthYear(customerId, processId, filters, isTest){
  	let url = urlPrefix(customerId, processId) + '/dashboard/filter/case_count_by_month_year';
    let params = {};
    if (TypeChecker.isBoolean(isTest) && isTest) {
      params.test_api = 1;
    }
    return instance.post(url, filters, { params: params});
  },
  getSupportedFields(customerId, processId, isTest){
  	let url = urlPrefix(customerId, processId) + '/field';
    let params = {};
    if (TypeChecker.isBoolean(isTest) && isTest) {
      params.test_api = 1;
    }
    return instance.get(url, { params: params});
  },
  // type: list or range
  fieldValues(customerId, processId, filters, fieldName, type, isTest){
  	let url = urlPrefix(customerId, processId) + `/field/${fieldName}/filter`;
    let params = {};
    if (TypeChecker.isBoolean(isTest) && isTest) {
      params.test_api = 1;
    }
    if(TypeChecker.isString(type)) {
    	params.type = type;
    }
    return instance.post(url, filters, { params: params});
  },
  caseCountBy(customerId, processId, filters, field, isTest){
  	let url = urlPrefix(customerId, processId) + '/dashboard/filter/case_count_by';
    let params = {};
    if(TypeChecker.isString(field)) {
    	params.field = field;
    }
    if (TypeChecker.isBoolean(isTest) && isTest) {
      params.test_api = 1;
    }
    return instance.post(url, filters, { params: params});
  },
  caseCountByDiscrepancy(customerId, processId, filters, isTest){
  	let url = urlPrefix(customerId, processId) + '/dashboard/filter/case_count_by_discrepancy';
    let params = {};
    if (TypeChecker.isBoolean(isTest) && isTest) {
      params.test_api = 1;
    }
    return instance.post(url, filters, { params: params});
  },
  averageDurationBy(customerId, processId, filters, field, isTest){
  	let url = urlPrefix(customerId, processId) + '/dashboard/filter/average_duration_by';
    let params = {};
    if(TypeChecker.isString(field)) {
    	params.field = field;
    }
    if (TypeChecker.isBoolean(isTest) && isTest) {
      params.test_api = 1;
    }
    return instance.post(url, filters, { params: params});
  },
  chart(customerId, processId, filters, isTest){
  	let url = urlPrefix(customerId, processId) + '/dashboard/filter/chart';
    let params = {};
    if (TypeChecker.isBoolean(isTest) && isTest) {
      params.test_api = 1;
    }
    return instance.post(url, filters, { params: params});
  }
}
