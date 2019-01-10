import Vue from 'vue'
import ProjectApi from '@/api/customization/project.js'
import ProjectData from '../project.data.js'
import CommonUtils from '@/utils/common-utils.js'

export default {
  data() {
    return {
      projects: null
    };
  },
  created(){
  	let projs = [], pd = CommonUtils.deepClone(ProjectData);
  	pd.projects.forEach(proj => {
  		proj.tasks = [];
  		pd.monthlyTasks.forEach(task => {
  			task.items = [];
  			if(task.projectId == proj.id) {
  				proj.tasks.push(task);
  			}

  			pd.taskItems.forEach(item => {
  				if(item.taskId == task.id) {
  					task.items.push(item);
  				}
  			});
  		});

  		projs.push(proj);
  	});
  	this.projects = projs;
  },
  methods: {
    toViewTask(project) {
      this.$router.push('/console/cust/project/' + this.$route.params.company + '/task/' + project.id);
    }
  }
}
