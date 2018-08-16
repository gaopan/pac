import { axios, axiosHelper } from '../api-config.js'

let baseUrl = process.env.baseUrl;
// let baseUrl = 'http://ec4t01164.itcs.entsvcs.net:8080';

let instance = axiosHelper.createAxios({
  baseURL: baseUrl + '/',
  timeout: 60000
});

export default {
  createProcess(p){
    let url = 'process';
    return instance.post(url, p);
  },
  getProcessStats() {
    let url = 'process/stats';
    return instance.get(url);
  },
  getProcesses() {
    let url = 'process_list';
    return instance.get(url);
  },
  getProcess(processId){
    let url = '/process/' + processId;
    return instance.get(url);
  },
  editProcess(method, params) {
    let url = '/process/' + params.processId;
    return instance[method](url, params);
  },
  updateProcess(process) {
    let url = '/process/' + process.processId;
    return instance.put(url, process);
  },
  deleteProcess(process) {
    let url = '/process/' + process.processId;
    return instance.put(url, process);
  },
  getProcessByUser(userId) {
    let url = 'process/user/' + userId;
    return instance.get(url);
  },
  getProcessByCustomer(customerId) {
    let url = `process/processes/${customerId}`;
    return instance.get(url);
  }
}
