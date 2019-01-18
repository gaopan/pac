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
	projects(){
		return instance.get('projects');
	},
	userProjects(userId){
		return instance.get(`projects/user/${userId}`);
	},
	getProjectsByCompanyId(companyId){
		return instance.get(`projects/companies/${companyId}`);
	},
	deleteProject(projectId){
		return instance.delete(`projects/${projectId}`);
	},
	project(projectId){
		return instance.get(`projects/${projectId}`);
	},
  updateProject(projectId, data){
    return instance.put(`projects/${projectId}`, data);
  },
	addProject(data){
		return instance.post('projects', data);
	},
	allTasks(){
		return instance.get(`monthlytasks`);
	},
  addTask(data){
    return instance.post(`monthlytasks`, data);
  },
  updateTask(taskId, data){
    return instance.put(`monthlytasks/${taskId}`, data);
  }
}