import { axios, axiosHelper } from '../api-config.js'

let baseUrl = process.env.baseUrl;

let instance = axiosHelper.createAxios({
  baseURL: baseUrl + '/',
  timeout: 30000
});

export default {
  createCustomer(data) {
    let url = 'customers';
    return instance.post(url, data);
  },

  manageCustomer(data) {
    let url = 'customer';
    return instance.get(url);
  },
  deleteCustomer(params) {
    let url = 'customers/' + params;
    return instance.delete(url);
  },
  updateCustomer(params) {
    let url = 'customers/' + params.id;
    return instance.put(url, params);
  },
  getCustomersStats() {
    let url = 'customers/stats';
    return instance.get(url);
  },
  getCustomer(customerId) {
    let url = 'customers/' + customerId;
    return instance.get(url);
  },
  getCustomers() {
    let url = 'customers';
    return instance.get(url);
  },
  getCustomerLogoUrl(data) {
    let url = 'customers/logo/' + data;
    return instance.get(url, {
      responseType: 'arraybuffer',
      transformResponse: [function(res){
        return 'data:image/png;base64,' + new Buffer(res, 'binary').toString('base64');
      }]
    });
  },
  sendSupportEmail(data){
     let url = 'support';
     return instance.post(url,data)
  }
}
