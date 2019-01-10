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
	deleteProject(projectId){
		return instance.delete(`projects/${projectId}`);
	},
	project(projectId){
		return instance.get(`projects/${projectId}`);
	},
	addProject(data){
		return instance.post('projects', data);
	}
}