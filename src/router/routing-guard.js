import store from '../store'
import TypeChecker from '../utils/type-checker.js'
import UserService from '@/services/user-services.js'
import RbacMatrix from './rbac-matrix.js'

function componentRule(to, from, next) {

  var theQuery = {};
  let userProfile = store.getters.userProfile;

  for (var key in from.query) {
    if (from.query.hasOwnProperty(key)) {
      theQuery[key] = from.query[key];
    }
  }
  if (to.name == 'Customization Dashboard' || to.name == 'Customization Project' || to.name == 'Statistic Dashboard') {
    if (!to.params.companyId) {
      if (userProfile.isAdmin || userProfile.isBoss) {
        next({ path: `/console/cust/main` });
      } else if (userProfile.isAA) {
        next({ path: `/passport/login` });
      }
      return;
    }
  }
  if (to.name == 'Customization') {
    if (userProfile.isAdmin || userProfile.isBoss) {
      next({ path: `/console/cust/main` });
    } else if (userProfile.isAA) {
      next({ path: `/console/cust/monthly/${to.params.companyId}/input` });
    } else {
      next();
    }
  } else if (to.name == 'Customization Dashboard') {
    if (userProfile.isAdmin || userProfile.isBoss) {
      next({ path: `/console/cust/monthly/${to.params.companyId}/review` });
    } else if (userProfile.isAA) {
      next({ path: `/console/cust/monthly/${to.params.companyId}/input` });
    } else {
      next();
    }
  } else if (to.name == 'Customization Project') {
    if (userProfile.isAdmin || userProfile.isBoss) {
      next({ path: `/console/cust/project/${to.params.companyId}/review` });
    } else if (userProfile.isAA) {
      next({ path: `/console/cust/project/${to.params.companyId}/input` });
    } else {
      next();
    }
  } else if (to.name == 'Statistic Dashboard') {
    if (userProfile.isAdmin || userProfile.isBoss) {
      next({ path: `/console/cust/statistic/${to.params.companyId}/review` });
    } else if (userProfile.isAA) {
      next({ path: `/console/cust/statistic/${to.params.companyId}/input` });
    } else {
      next();
    }
  } else {
    next();
  }
}

function initStore(cb) {
  let _callback = function() {
    cb();
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

  if (TypeChecker.isObject(store.getters.userProfile) && TypeChecker.isString(store.getters.userProfile.role)) {
    userRoleType = store.getters.userProfile.role.toLowerCase();
  }

  let foundRoleInRequiredRoles = false;
  if (aRolesRequired.length == 0) {
    foundRoleInRequiredRoles = true;
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

function routingGuard(to, from, next) {
  let handler = function() {

    if (to.matched.length == 0) {
      next({ path: '/passport/login' });
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

    componentRule(to, from, next);
  }
  if (to.path.indexOf('/passport') == 0) {
    UserService.clearCurrentUser();
    handler();
  } else {
    initStore(handler);
  }
}

export default routingGuard;
