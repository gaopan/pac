import Vue from 'vue'
import Vuex from 'vuex'
import * as actions from './actions.js'
import * as getters from './getters.js'

import userProfiles from './modules/user-profiles.js'
import processSelection from './modules/process-selection.js'
import customerSelection from './modules/customer-selection.js'
import dynamicFilters from './modules/dynamic-filters.js'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  actions: actions,
  getters: getters,
  modules: {
  	userProfiles, processSelection, customerSelection, dynamicFilters
  },
  strict: debug,
  // plugins: debug ? [createLogger()] : []
  plugins: []
})
