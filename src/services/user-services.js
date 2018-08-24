import CookiesManager from '../utils/cookies-manager.js'
import Store from '../store'
import userData from '../api/user.js'
import { axios, cookies } from '../api/api-config.js'
import AccountApi from '../api/account.js'
import TypeChecker from '../utils/type-checker.js'

//global variable declaration in this file
const storageKey = 'logined-user';
const tokenKey = 'LEAP-token';
const tokenCookieOpt = {
  path: '/services/api/v1',
  secure: false
};

/* Change Log: 
 * 3/6/2017 - Change by muhammad-azhaziq.bin-mohd-azlan-goh@hpe.com (Azhaziq)
 * Desc: Remove current user. Services in vue is not singleton. To achieve singleton used Vuex
 *
 *
 *
 */

function securitize(user) {
  if (!TypeChecker.isObject(user)) {
    return null;
  }
  var _user = { userFe: {} },
    props = ["accessToken", "authType"];
  for (var key in user) {
    if (user.hasOwnProperty(key) && props.indexOf(key) > -1) {
      _user[key] = user[key];
    } else if (key == "userFe") {
      if (TypeChecker.isObject(user.userFe)) {
        var innerProps = ["firstName", "lastName", "email", "roleType"];
        for (var k in user.userFe) {
          if (user.userFe.hasOwnProperty(k) && innerProps.indexOf(k) > -1) {
            _user.userFe[k] = user.userFe[k];
          }
        }
      }
    }
  }
  return _user;
}

let service = {
  setCurrentUser(user, cb) {

    let auth = user.authType + ' ' + user.accessToken;

    delete user.userFe.processIdList;

    CookiesManager.set(storageKey, securitize(user));
    CookiesManager.set(tokenKey, user.accessToken, tokenCookieOpt);

    axios.defaults.headers.common['Authorization'] = auth;

    this.inflateUserRoleCheck(user);
    Store.dispatch('setUserProfile', user);

    setTimeout(function() {
      if (TypeChecker.isFunction(cb)) {
        cb();
      }
    }, 0);
  },
  initUser(cb) {
    // console.log(Store.getters.userProfile);
    if (TypeChecker.isObject(Store.getters.userProfile)) {
      if (TypeChecker.isFunction(cb)) {
        cb();
      }
      return;
    }
    let userCookie = CookiesManager.get(storageKey);

    if (userCookie) {
      if (!TypeChecker.isObject(userCookie.userFe)) {
        Store.dispatch('setUserProfile', null);
        if (TypeChecker.isFunction(cb)) {
          cb.call(this);
        }
      } else {
        let auth = userCookie.authType + " " + userCookie.accessToken;
        axios.defaults.headers.common['Authorization'] = auth;
        service.inflateUserRoleCheck(userCookie);
        Store.dispatch('setUserProfile', userCookie);
        setTimeout(function() {
          if (TypeChecker.isFunction(cb)) {
            cb.call(this);
          }
        }, 0);
      }
    } else {
      if (TypeChecker.isFunction(cb)) {
        cb.call(this);
      }
    }
  },
  clearCurrentUser() {
    CookiesManager.del(storageKey);
    CookiesManager.del(tokenKey, { path: tokenCookieOpt.path });
    delete axios.defaults.headers.common['Authorization'];
    Store.dispatch('setUserProfile', null);
  },
  inflateUserRoleCheck(userProfile) {
    var roleType = userProfile.userFe.roleType;
    userProfile.isSales = roleType == 'Sales';
    userProfile.isLeapAdmin = roleType == 'admin';
    userProfile.isBoss = roleType == 'boss';
    userProfile.isAA = roleType == 'aa';
    userProfile.isLeapPractitioner = roleType == 'LEAP_Practitioner';
    userProfile.isCustomerLeadership = roleType == 'Customer_Leadership';
    userProfile.isCustomerPractitioner = roleType == 'Customer_Practitioner';
    userProfile.isCustomerGeneralParticipant = roleType == 'Customer_General_Participant';
    userProfile.isLeapRaaSAdmin = roleType == 'LEAP_RaaS_Admin';
    userProfile.isLeapRaaSOperator = roleType == 'LEAP_RaaS_Operator';
    userProfile.isCustomerRaaSOperator = roleType == 'Customer_RaaS_Operator';
    userProfile.isLeapSupport = roleType == 'LEAP_Support';
    userProfile.isLeapAccountOwner = roleType == 'LEAP_Account_Owner';
  }
}

export default service;
