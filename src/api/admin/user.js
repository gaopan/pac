import { axios, axiosHelper } from '../api-config.js'

let baseUrl = process.env.baseUrl;
// let baseUrl = 'http://ec4t01164.itcs.entsvcs.net:8080';

let instance = axiosHelper.createAxios({
  baseURL: baseUrl + '/admin-console-api/api/v1',
  timeout: 30000
});

export default {
  createUser(data, sendNotification) {
    let url = 'account/users?sendNotification=' + sendNotification;
    return instance.post(url, data);
  },
  getUserStats() {
    let url = 'account/users/stats';
    return instance.get(url);
  },
  getListOFCompany() {
    let url = 'customers';
    return instance.get(url);
  },
  getCompanyIdByName(data) {
    let url = 'process/processes/' + data;
    return instance.get(url, data);
  },
  getRoleByUserType(data) {
    let url = 'account/roles/' + data;
    return instance.get(url, data);
  },
  getProcess() {
    let url = 'process';
    return instance.get(url);
  },
  getProcessById(id) {
    let url = 'process/' + id;
    return instance.get(url);
  },
  getUserIdByName(data) {
    let url = 'customers/' + data;
    return instance.get(url, data);
  },
  getUserProcess(params) {
    let url = '/account/userprocess/' + params.id;
    // let url = '/account/userprocess/' + params.id;
    return instance.get(url);
  },
  getUserList() {
    let url = '/account/users';
    return instance.get(url);
  },
  getUser(params) { //get all users
    let url = '/account/users/' + params.id;
    return instance.get(url);
  },
  getEditedUserData(method, params) { //edit a user info 
    let url = '/account/users/' + params.id;
    return instance[method](url, params);
  },

  getUserStats() {
    let url = '/account/users/stats';
    return instance.get(url);
  },
  getCustomersStats() {
    let url = '/customers/stats';
    return instance.get(url);
  },
  getAllUser() {
    let url = '/account/users';
    return instance.get(url);
  },
  getUserByUserId(userId) {
    let url = '/account/users/' + userId;
    return instance.get(url)
  },
  updateUserInfo(userId, user) {
    let url = '/account/users/' + userId;
    return instance.put(url, user);
  },
  updateUserStatus(userId, status, enableLight) {
    let url = "/account/approvall/" + userId + "/" + status + "/" + enableLight;
    return instance.put(url);
  },
  getUserByCustomerId(customerId) {
    let url = "account/usercustomer/" + customerId;
    return instance.get(url);
  },
  getUserSmartLook(data) {
    let url = '/account/users/smartLook/' + data;
    return instance.get(url);
  },
  informSmartLook(data, boolean) {
    let url = '/account/users/smartLook/' + data + '?smartLook=' + boolean;
    return instance.post(url);
  },
  getRoleTypeList(userType){
    let url = '/account/usertype/'+userType;
    return instance.get(url);
  }
}
