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

	addReport(data){
		return instance.post('reports', data);
	},
	getAllReports(){
		return instance.get('reports');
	},
	getReportDetail(reportId){
		return instance.get(`reports/${reportId}`);
	},
	updateReport(reportId, data){
		return instance.put(`reports/${reportId}`, data);
	},
	getReportByCompanyId(companyId){
		return instance.get(`reports/companies/${companyId}`);
	},
	deleteReport(reportId){
		return instance.delete(`reports/${reportId}`);
	},
	companyModulesByMonths(companyId, months){
		let url = `reportmodules/companies/${companyId}`;
		return instance.post(url, months);
	},
	updateModuleByMonth(companyId, month, data){
		let url = `reportmodules/companies/${companyId}/months/${month}`;
		return instance.put(url, data);
	},
	addModuleByMonth(companyId, month, data) {
		let url = `reportmodules/companies/${companyId}/months/${month}`;
		return instance.post(url, data);
	},
	addStatistics(data){
		let url = `statistics`;
		return instance.post(url, data);
	},
	getAllStatistics(){
		let url = `statistics`;
		return instance.get(url);
	},
	updateStatistics(id, data){
		let url = `statistics/${id}`;
		return instance.put(url, data);
	},
	deleteStatistics(id){
		let url = `statistics/${id}`;
		return instance.delete(url);
	}

}