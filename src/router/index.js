import Vue from 'vue'
import Router from 'vue-router'
import RouterTable from './routing-table.js'
import RoutingGuard from './routing-guard.js'

Vue.use(Router)

const router = new Router(RouterTable);

//Comment this to disable routing guard
router.beforeResolve(RoutingGuard);

export default router