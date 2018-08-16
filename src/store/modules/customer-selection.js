import UserAPI from '../../api/user.js'

// initial state
const state = {
  customerSelected: null,
  customers: null
}

// getters
const getters = {
  customerSelection: state => state.customerSelected,
  customers: state => state.customers
}

// actions
const actions = {
  setCustomerSelection ({commit},custs){
    commit('SET_CUSTOMER_SELECTION', custs)
  },
  setCustomers ({commit}){
    commit('SET_CUSTOMERS', UserAPI.userCustomers())
  }
}

// mutations
const mutations = {
  SET_CUSTOMER_SELECTION(state, custs){
    state.customerSelected = custs
  },
  SET_CUSTOMERS(state, custd){
    state.customers = custd
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}