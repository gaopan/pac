import {
  axios,
  cookies,
  axiosHelper
} from '../api-config.js'


let baseUrl = process.env.baseUrl;

let instance = axiosHelper.createAxios({
  baseURL: (baseUrl + '/'),
  timeout: 30000
});

export default {
	getReportOverview(){
		return instance.get('get_reports_overview');
	},
	getReportDetail(data){
		return instance.post('get_reports_detail', data);
	},
	saveReport(data){
		return instance.post('new_or_update_report', data);
	},
	deleteReport(data){
		return instance.post('delete_reports', data);
	}
}