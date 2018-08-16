// initial state
const state = {
  savedFilters: null,
  historyFilters: null, 
  globalFilter: null,
  appliedFilter: null,
  prevAppliedFilter: null,
  activeAttribute: null,
  attributesList: null
}

// getters
const getters = {
  getSavedFilters: state => state.savedFilters,
  //faiz-asyraf.abdul-aziz@hpe.com - get the history filters from VueX store
  getHistoryFilters: state => state.historyFilters,
  getGlobalFilter: state => state.globalFilter,
  getAppliedFilter: state => state.appliedFilter,
  getPrevAppliedFilter: state => state.prevAppliedFilter,
  getActiveAttribute: state => state.activeAttribute,
  getAttributesList: state => state.attributesList
}

// actions
const actions = {
  setSavedFilters({commit},fltr){
    commit('SET_SAVED_FILTERS',fltr);
  },
  //faiz-asyraf.abdul-aziz@hpe.com - set history filters
  setHistoryFilters({ commit }, fltr) {
    commit('SET_HISTORY_FILTERS', fltr);
  },
  
  setGlobalFilters({commit},fltr){
    commit('SET_GLOBAL_FILTERS',fltr);
  },

  setAppliedFilters({commit},fltr){
    commit('SET_APPLIED_FILTERS',fltr);
  },

  setPrevAppliedFilters({commit},fltr){
    commit('SET_PREV_APPLIED_FILTERS',fltr);
  },

  setActiveAttribute({commit},fltr){
    commit('SET_ACTIVE_ATTRIBUTE',fltr);
  },

  setAttributesList({commit},fltr) {
    commit('SET_ATTRIBUTES_LIST', fltr);
  }
}

// mutations
const mutations = {
  SET_SAVED_FILTERS(state, fltr){
    state.savedFilters = fltr
  },
  //faiz-asyraf.abdul-aziz@hpe.com - to mutate the history filters
  SET_HISTORY_FILTERS(state, fltr) {
    state.historyFilters = fltr
  },

  SET_GLOBAL_FILTERS(state, fltr){
    state.globalFilter = fltr
  },

  SET_APPLIED_FILTERS(state, fltr){
    state.appliedFilter = fltr
  },

  SET_PREV_APPLIED_FILTERS(state,fltr){
    state.prevAppliedFilter = fltr
  },

  SET_ACTIVE_ATTRIBUTE(state, fltr) {
    state.activeAttribute = fltr;
  },

  SET_ATTRIBUTES_LIST(state, fltr) {
    state.attributesList = fltr;
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}