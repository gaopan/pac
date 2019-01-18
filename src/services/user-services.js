import CookiesManager from '../utils/cookies-manager.js'
import Store from '../store'
import { axios, cookies } from '../api/api-config.js'
import AccountApi from '../api/account.js'
import UserApi from '../api/customization/user.js'
import TypeChecker from '../utils/type-checker.js'

//global variable declaration in this file
const storageKey = 'knight-sq-logined-user';
const tokenKey = 'knight-sq-token';
const tokenCookieOpt = {
  path: '/',
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
        var innerProps = ["firstName", "lastName", "email", "role"];
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

function securitize2(user) {
  if (!TypeChecker.isObject(user)) {
    return null;
  }
  var _user = {},
    props = ["accessToken", "authType", "firstName", "lastName", "email", "role", "id"];
  for (var key in user) {
    if (user.hasOwnProperty(key) && props.indexOf(key) > -1) {
      _user[key] = user[key];
    }
  }
  return _user;
}

let service = {
  setCurrentUser(user, cb) {

    let auth = user.authType + ' ' + user.accessToken;

    CookiesManager.set(storageKey, securitize2(user));
    CookiesManager.set(tokenKey, user.accessToken, tokenCookieOpt);

    axios.defaults.headers.common['Authorization'] = auth;

    this.inflateUserRoleCheck(user);

    UserApi.getUser(user.id).then(res => {
      user.companies = res.data.companyId;
      Store.dispatch('setUserProfile', user);
      setTimeout(function() {
        if (TypeChecker.isFunction(cb)) {
          cb();
        }
      }, 0);
    });
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
      if (!TypeChecker.isObject(userCookie) || !userCookie.id) {
        Store.dispatch('setUserProfile', null);
        if (TypeChecker.isFunction(cb)) {
          cb.call(this);
        }
      } else {
        let auth = userCookie.authType + " " + userCookie.accessToken;
        axios.defaults.headers.common['Authorization'] = auth;
        service.inflateUserRoleCheck(userCookie);
        UserApi.getUser(userCookie.id).then(res => {
          userCookie.companies = res.data.companyId;
          Store.dispatch('setUserProfile', userCookie);
          setTimeout(function() {
            if (TypeChecker.isFunction(cb)) {
              cb();
            }
          }, 0);
        });
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
    var role = userProfile.role;
    userProfile.isAdmin = role == 'admin';
    userProfile.isBoss = role == 'boss';
    userProfile.isAA = role == 'aa';
  }
}

export default service;
