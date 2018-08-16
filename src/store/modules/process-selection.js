//TODO: Need to overhaul
import UserAPI from '../../api/user.js'

// initial state
const state = {
  processSelected: null,
  processes: null
}

// getters
const getters = {
  processSelection: state => state.processSelected,
  processes: state => state.processes
}

// actions
const actions = {
  setProcessSelection ({commit},prs){
    commit('SET_PROCESS_SELECTION', prs)
  },
  setProcesses ({commit}){
    commit('SET_PROCESSES', UserAPI.userProcesses())
  }
}

// mutations
const mutations = {
  SET_PROCESS_SELECTION(state, prs){
    state.processSelected = prs
  },
  SET_PROCESSES(state, prd){
    state.processes = prd
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}