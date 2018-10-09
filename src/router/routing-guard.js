import store from '../store'
import TypeChecker from '../utils/type-checker.js'
import UserService from '@/services/user-services.js'
import ProcessSelectionService from '@/services/process-selection-services.js'
import CustomerSelectionService from '@/services/customer-selection-services.js'
import RbacMatrix from './rbac-matrix.js'

function componentRule(to, from, next) {

  var theQuery = {};
  let userProfile = store.getters.userProfile;

  for (var key in from.query) {
    if (from.query.hasOwnProperty(key)) {
      theQuery[key] = from.query[key];
    }
  }
  if (to.name == 'Process Discovery') {

    let selection = store.getters.processSelection;

    if (TypeChecker.isObject(selection)) {
      next({ path: '/console/pd/pe/pf', query: theQuery });
    } else {
      next({ path: '/console/selection' });
    }

  } else if(to.name == 'Customization') {
    if(userProfile.isAdmin || userProfile.isBoss) {
      next({path: '/console/cust/company'});
    }
  } else if(to.name == 'Customization Dashboard'){
    if(userProfile.isAdmin || userProfile.isBoss) {
      next({path: `/console/cust/monthly/${to.params.company}/report`});
    } else if(userProfile.isAA) {
      next({path: `/console/cust/monthly/${to.params.company}/overview`});
    } else {
      next();
    }
  }else {
    next();
  }
}

function initStore(cb) {
  let _callback = function() {

    let _cb = function() {
      if (store.getters.customerSelection == null) {
        CustomerSelectionService.initCustomerSelection();
      }
      cb();
    }
    if (store.getters.processSelection == null) {
      ProcessSelectionService.initProcessSelection(_cb);
    } else {
      _cb();
    }

  }
  if (store.getters.userProfile == null) {
    UserService.initUser(_callback);
  } else {
    _callback();
  }
}

function validateAccessByRoles(route, aRolesRequired) {
  let valid = true;

  let userRoleType = null;
  if (TypeChecker.isObject(store.getters.userProfile) && TypeChecker.isObject(store.getters.userProfile.userFe) && TypeChecker.isString(store.getters.userProfile.userFe.roleType)) {
    userRoleType = store.getters.userProfile.userFe.roleType.toLowerCase();
  }
  // that will be valid if any one role is in the user's role list
  // Emily make the change 2018.JAN.30th
  let foundRoleInRequiredRoles = false;
  if (aRolesRequired.length == 0) {
    foundRoleInRequiredRoles=true;
    return valid;
  }

  aRolesRequired.every(function(role) {
    if (userRoleType == role) {
      foundRoleInRequiredRoles = true;
      return false;
    }
    return true;
  });

  return valid && foundRoleInRequiredRoles;
}

function validateAccessForProcessSelection(route) {
  let valid = true;

  if (route.meta.requireSelection) {
    if (!TypeChecker.isObject(store.getters.processSelection)) {
      valid = false;
    }
  }

  return valid;
}

function routingGuard(to, from, next) {
  let handler = function() {

    if (to.matched.length == 0) {
      if (from.matched.length == 0) {
        next({ path: '/passport/login' });
      } else {
        next({ path: from.path });
      }
      console.warn("No Matched route found for: ");
      console.warn(to);
      return;
    }

    let oRbacConfig = RbacMatrix[to.meta.rbacMatrixKey];

    if (!oRbacConfig) {
      console.error("No RBAC configuration for route: " + to.name);
      return;
    }

    let aRolesRequired = oRbacConfig.rolesRequired;
    let isValid = validateAccessByRoles(to, aRolesRequired);

    if (!isValid) {
      next({ path: '/passport/login' });
      return;
    }

    isValid = validateAccessForProcessSelection(to);
    if (!isValid) {
      next({ path: '/console/selection' });
      return;
    }

    componentRule(to, from, next);
  }
  if (to.path.indexOf('/passport') == 0) {
    UserService.clearCurrentUser();
    CustomerSelectionService.clearCustomerSelection();
    ProcessSelectionService.clearProcessSelection();
    handler();
  } else {
    initStore(handler);
  }
}

export default routingGuard;
