//TODO: Need to overhaul

import CookiesManager from '../utils/cookies-manager.js'
import Store from '../store'
import router from '../router'
import userData from '../api/user.js'
import ProcessApi from '@/api/admin/process.js'
import TypeChecker from '@/utils/type-checker.js'

//global variable declaration in this file
const storageKey = 'logined-process';

export default {
  setProcessSelection(pSelection, cb) {
    //Store current selection only in cookie
    CookiesManager.set(storageKey, pSelection);
    Store.dispatch('setProcessSelection', pSelection);
    if (TypeChecker.isFunction(cb)) {
      cb.call(this);
    }
  },
  initProcessSelection(cb) {

    let pSelectionCookie = CookiesManager.get(storageKey);

    if (pSelectionCookie) {
      Store.dispatch('setProcessSelection', pSelectionCookie);
      if (TypeChecker.isFunction(cb)) {
        cb.call(this);
      }
    } else {
      Store.dispatch('setProcessSelection', null);
      if (TypeChecker.isFunction(cb)) {
        cb.call(this);
      }
    }
  },
  clearProcessSelection() {
    CookiesManager.del(storageKey);
    Store.dispatch('setProcessSelection', null);
  }
}
