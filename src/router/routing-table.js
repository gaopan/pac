import TypeChecker from '../utils/type-checker.js'

function configMeta(sRbacMatrixKey, bSelectionRequired, oCustomOpts) {
  bSelectionRequired = !!bSelectionRequired;
  sRbacMatrixKey = sRbacMatrixKey || "Marketing Page";
  let metaConfig = {
    requireSelection: bSelectionRequired,
    rbacMatrixKey: sRbacMatrixKey
  };
  if (TypeChecker.isObject(oCustomOpts)) {
    for (var key in oCustomOpts) {
      if (oCustomOpts.hasOwnProperty(key)) {
        metaConfig[key] = oCustomOpts[key];
      }
    }
  }
  return metaConfig;
}

let routerTable = {
  // mode: 'history',
  routes: [{
    path: '/console',
    name: 'Console',
    components: {
      default: () =>
        import ('@/modules/console/Console.vue')
    },
    meta: configMeta("Customization Dashboard", false),
    redirect: "/console/cust",
    children: [{
      path: 'cust',
      name: 'Customization',
      components: {
        default: () =>
          import ('@/modules/console/customization/Customization.vue')
      },
      meta: configMeta("Customization Dashboard", false),
      children: [{
        name: 'Customization Company',
        path: 'company',
        components: {
          default: () => import('@/modules/console/customization/company/Company.vue')
        },
        meta: configMeta("Customization Company", false)
      }, {
        name: 'Customization Project',
        path: 'project/:company',
        components: {
          default: () => import('@/modules/console/customization/project/Project.vue')
        },
        meta: configMeta("Customization Project", false),
        children: [{
          name: 'Customization Project Overview',
          path: 'overview',
          components: {
            default: () =>
              import ('@/modules/console/customization/project/overview/Overview.vue')
          },
          meta: configMeta('Customization Project', false)
        }, {
          name: 'Customization Project Task',
          path: 'task/:projectId',
          components: {
            default: () =>
              import ('@/modules/console/customization/task/Task.vue')
          },
          meta: configMeta('Customization Project', false)
        }]
      }, {
        name: 'Customization Dashboard',
        path: 'monthly/:company',
        components: {
          default: () =>
            import ('@/modules/console/customization/dashboard/Dashboard.vue')
        },
        meta: configMeta("Customization Dashboard", false),
        children: [{
          name: 'Customization Dashboard Overview',
          path: 'overview',
          components: {
            default: () =>
              import ('@/modules/console/customization/dashboard/overview/Overview.vue')
          },
          meta: configMeta('Customization Dashboard', false)
        },{
          name: 'Customization Dashboard Report',
          path: 'report',
          components: {
            default: () =>
              import ('@/modules/console/customization/dashboard/report/Report.vue')
          },
          meta: configMeta('Customization Dashboard', false)
        }]
      }, {
        name: 'Statistic Dashboard',
        path: 'statistic/:type',
        components: {
          default: () =>
            import ('@/modules/console/customization/statistic-dashboard/StatisticDashboard.vue')
        },
        meta: configMeta("Customization Dashboard", false)
      }]
    }]
  }, {
    path: '/passport',
    name: 'Passport',
    components: {
      default: () =>
        import ('@/modules/passport/Passport.vue')
    },
    redirect: '/passport/login',
    meta: configMeta("Login", false),
    children: [{
      path: 'login',
      name: 'Login',
      components: {
        default: () =>
          import ('@/modules/passport/login/Login.vue')
      },
      meta: configMeta("Login", false)
    }]
  }]
}

export default routerTable
