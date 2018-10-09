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
    meta: configMeta("Selection", false),
    redirect: "/console/selection",
    children: [{
      path: 'selection',
      name: 'Selection',
      components: {
        default: () =>
          import ('@/modules/console/selection/Selection.vue')
      },
      meta: configMeta("Selection", false)
    }, {
      path: 'pd',
      name: 'Process Discovery',
      components: {
        default: () =>
          import ('@/modules/console/process-discovery/ProcessDiscovery.vue')
      },
      meta: configMeta("Selection", false),
      children: [{
        path: 'pe',
        name: 'Process Explorer',
        components: {
          default: () =>
            import ('@/modules/console/process-discovery/process-explorer/ProcessExplorer.vue')
        },
        meta: configMeta("Process Discovery/Process Explorer", true),
        children: [{
          path: 'pf',
          name: 'Process Flow',
          components: {
            default: () =>
              import ('@/modules/console/process-discovery/process-explorer/process-flow/ProcessFlow.vue')
          },
          meta: configMeta("Process Discovery/Process Explorer", true)
        }, {
          path: 'pc',
          name: 'Process Comparison',
          components: {
            default: () =>
              import ('@/modules/console/process-discovery/process-explorer/process-comparison/ProcessComparison.vue')
          },
          meta: configMeta("Process Discovery/Process Explorer", true)
        }, {
          path: 'pa',
          name: 'Process Analysis',
          components: {
            default: () =>
              import ('@/modules/console/process-discovery/process-explorer/analysis/Analysis.vue')
          },
          meta: configMeta("Process Discovery/Process Explorer", true)
        }]
      }]
    }, {
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
