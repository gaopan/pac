//User action api will be here
// i.e: Login, Logout, Save Profile, Edit Profile, get user processes
import processData from './mock-data/process.json'
import loginData from './mock-data/login.json'
import recipesData from './mock-data/recipes.json'
import customerData from './mock-data/customer.json'

import { axios, cookies, axiosHelper } from './api-config.js'

let instance = axiosHelper.createAxios({
  baseURL: '',
  timeout: 30000
})

export default {
	userProcesses: function(){
		return processData;
	},
	userLogin: function(){
		return loginData;
	},
	getRecipes: function() {
		return recipesData
	},
	userCustomers: function(){
		return customerData;
	}
}

