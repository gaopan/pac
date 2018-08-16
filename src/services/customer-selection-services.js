import CookiesManager from '../utils/cookies-manager.js'
import Store from '../store'
import router from '../router'
import userData from '../api/user.js'
import TypeChecker from '../utils/type-checker.js'
import CommonUtils from '../utils/common-utils.js'
import CompanyApi from '../api/admin/company.js'

//global variable declaration in this file
const storageKey = 'logined-customer';

function inflateLogoUrl(selection, cb) {
  CompanyApi.getCustomerLogoUrl(selection.logoUrl).then(res => {
    selection.logoUrl = res.data;
    if (TypeChecker.isFunction(cb)) {
      cb.call(this, selection);
    }
  }, err => {
    selection.logoUrl = null;
    console.error(err);
  });
}

export default {
  setCustomerSelection(cSelection, cb) {

    //Store current selection only in cookie
    CookiesManager.set(storageKey, cSelection);

    if (TypeChecker.isString(cSelection.logoUrl) && cSelection.logoUrl.length > 0) {
      inflateLogoUrl(cSelection, function(selection) {
        Store.dispatch('setCustomerSelection', selection);
        if (TypeChecker.isFunction(cb)) {
          cb.call(this);
        }
      });
    } else {
      if (TypeChecker.isFunction(cb)) {
        cb.call(this);
      }
    }
  },
  initCustomerSelection(isDev) {

    let cSelectionCookie = CookiesManager.get(storageKey);
    if (cSelectionCookie) {
      if (TypeChecker.isString(cSelectionCookie.logoUrl) && cSelectionCookie.logoUrl.length > 0) {
        inflateLogoUrl(CommonUtils.deepClone(cSelectionCookie), function(selection) {
          Store.dispatch('setCustomerSelection', selection);

          //TODO: When there is API we will extend this to fetch based on user id
          Store.dispatch('setCustomers', selection);
        });
      }
      Store.dispatch('setCustomerSelection', cSelectionCookie);

      //TODO: When there is API we will extend this to fetch based on user id
      Store.dispatch('setCustomers', cSelectionCookie);
    } else {

      if (isDev) {
        let mockData = userData.userCustomers();

        Store.dispatch('setCustomerSelection', mockData[0]);
        Store.dispatch('setCustomer', mockData);
      } else {

        Store.dispatch('setCustomerSelection', null);
        Store.dispatch('setCustomers', null);
      }

    }

    return cSelectionCookie;
  },
  clearCustomerSelection() {
    CookiesManager.del(storageKey);
    Store.dispatch('setCustomerSelection', null);
  }
}
