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
	companies(){
		return instance.get('companies');
	},
	userCompanies(userId){
		return instance.get(`companies/user/${userId}`);
	},
	deleteCompany(companyId){
		return instance.delete(`companies/${companyId}`);
	},
	company(companyId){
		return instance.get(`companies/${companyId}`);
	},
	addCompany(data){
		return instance.post('companies', data);
	}

}