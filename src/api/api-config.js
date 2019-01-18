//This is where all the api related config resides on
// i.e: Cookies management, axios global config
import axios from 'axios'
import cookies from '../utils/cookies-manager.js'
import TypeChecker from '../utils/type-checker.js'
import router from '../router'
import store from '../store'
import StoreManager from '../utils/store-manager.js'
import CookiesManager from '../utils/cookies-manager.js'

let CancelToken = axios.CancelToken
let serviceVariantConfigs = {};

let common = {
  newCancelToken: function(fnAwareCancelFunc) {
    return new CancelToken(function(c) {
      if (TypeChecker.isFunction(fnAwareCancelFunc)) {
        fnAwareCancelFunc.call(this, c);
      }
    });
  },
  getServiceVariantConfig: function(serviceKey) {
    if(serviceVariantConfigs[serviceKey]) return serviceVariantConfigs[serviceKey];
    let serviceVariantConfig = serviceVariantConfigs[serviceKey] = {
      list: null,
      forAll: false,
      suffix: '1',
      endpoints: {}
    };
    let storeManager = new StoreManager('local');
    let serviceVariant = storeManager.getStorage(serviceKey);

    if (TypeChecker.isArrayString(serviceVariant)) {
      serviceVariantConfig.list = JSON.parse(serviceVariant);
      if (serviceVariantConfig.list.length == 0) {
        serviceVariantConfig.forAll = true;
      }
    }

    return serviceVariantConfig;
  },
  getEndpointVariantConfig: function(serviceKey, endpointKey){
    let serviceVariantConfig = this.getServiceVariantConfig(serviceKey);
    if(serviceVariantConfig[endpointKey]) return serviceVariantConfig[endpointKey];

    let endpointVariantConfig = serviceVariantConfig[endpointKey] = {
      prefix: "/" + serviceKey
    };

    if(serviceVariantConfig.forAll || (TypeChecker.isArray(serviceVariantConfig.list) && serviceVariantConfig.list.indexOf(endpointKey) > -1)) {
      endpointVariantConfig.prefix += serviceVariantConfig.suffix;
    }

    return endpointVariantConfig;
  }

};


let axiosHelper = {
  createAxios: function(obj) {
    if (obj.baseURL) {
      let instance = axios.create({
        baseURL: obj.baseURL,
        timeout: obj.timeout ? obj.timeout : 30000
      });
      instance.interceptors.response.use(function(res) {
        return res;
      }, function(err) {
        if(!err.response) {
          console.error("Network issue.");
          router.replace('/passport/login');
          return;
        }
        if (err.response.status == 401) {
          // UserServices.clearCurrentUser();
          const storageKey2 = 'knight-sq-logined-user';
          const tokenKey = 'knight-sq-token';
          const tokenCookieOpt = {
            path: '/',
            secure: false
          };
          CookiesManager.del(storageKey2);
          CookiesManager.del(tokenKey, { path: tokenCookieOpt.path });
          delete axios.defaults.headers.common['Authorization'];
          store.dispatch('setUserProfile', null);

          // router redirrect
          router.replace('/passport/login');

        } else {
          return Promise.reject(err);
        }
      });
      return instance;
    }
  }
}


export { axios, cookies, common, axiosHelper }
