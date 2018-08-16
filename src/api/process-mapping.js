import { axios, cookies, axiosHelper } from './api-config.js'

import q from './q.js'

let baseUrl = process.env.baseUrl;

let urlPrefix = function(customerId) {
  return `/api-gateway/${customerId}`;
}

export default {
  getProcessMappingInfoPromise(customerId, customerName, sourceId, targetId) {
    let baseURL = baseUrl + urlPrefix(customerId) + '/process-mining-service/api/v1/process_mapping';
    let longRequestInstance = axiosHelper.createAxios({
      baseURL: baseURL,
      timeout: 90000000
    });
    let url = '';
    return longRequestInstance.get(url, { params: { sourceId: sourceId, targetId: targetId } })
  },
  saveProcessMapping(customerId, customerName, body) {
    let baseURL = baseUrl + urlPrefix(customerId) + '/process-mining-service/api/v1/process_mapping';
    let longRequestInstance = axiosHelper.createAxios({
      baseURL: baseURL,
      timeout: 90000000
    });
    let url = '';
    return longRequestInstance.post(url, body);
  },
  updateProcessMapping(customerId, customerName, body) {
    let baseURL = baseUrl + urlPrefix(customerId) + '/process-mining-service/api/v1/process_mapping';
    let longRequestInstance = axiosHelper.createAxios({
      baseURL: baseURL,
      timeout: 90000000
    });
    let url = '';
    return longRequestInstance.put(url, body);
  }

}
