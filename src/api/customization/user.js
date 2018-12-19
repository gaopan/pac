import {
  axios,
  cookies,
  axiosHelper
} from '../api-config.js'


let baseUrl = process.env.baseUrl;

let instance = axiosHelper.createAxios({
  baseURL: (baseUrl + '/protected'),
  timeout: 30000
});

export default {
	deleteUser(userId){
		return instance.delete(`users/${userId}`);
	},
	updateUser(userId, data){
		return instance.put(`users/${userId}`, data);
	},
	getUser(userId){
		return instance.get(`users/${userId}`);
	},
	getUserByEmail(email){
		return instance.get(`users/email/${email}`);
	},
	users(){
		return instance.get('users');
	},
	addUser(data){
		return instance.post('users', data);
	}
}