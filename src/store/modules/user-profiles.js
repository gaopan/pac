import cookie from '../../utils/cookies-manager.js' 

// initial state
const state = {
  userProfile: null
}

// getters
const getters = {
  userProfile: state => state.userProfile
}

// actions
const actions = {
  setUserProfile ({commit},up){
    commit('SET_USER_PROFILE', up)
  }
}

// mutations
const mutations = {
  SET_USER_PROFILE(state, up){
    state.userProfile = up
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}