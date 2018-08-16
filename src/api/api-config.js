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
        if (err.response.status == 401) {
          // FilterServices.clear();
          const storageKey1 = 'globalFilters-data';
          const sm = new StoreManager('session');
          sm.deleteStorage(storageKey1);
          store.dispatch('setSavedFilters', null);

          // UserServices.clearCurrentUser();
          const storageKey2 = 'logined-user';
          const tokenKey = 'LEAP-token';
          const tokenCookieOpt = {
            path: '/services/api/v1',
            secure: false
          };
          CookiesManager.del(storageKey2);
          CookiesManager.del(tokenKey, { path: tokenCookieOpt.path });
          delete axios.defaults.headers.common['Authorization'];
          store.dispatch('setUserProfile', null);

          // ProcessSelectionService.clearProcessSelection();
          const storageKey3 = 'logined-process';
          CookiesManager.del(storageKey3);
          store.dispatch('setProcessSelection', null);

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
