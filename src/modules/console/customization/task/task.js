import ProjectData from '../project/project.data.js'
import CommonUtils from '@/utils/common-utils.js'

let pd = CommonUtils.deepClone(ProjectData)

export default {
  data() {
    return {
      project: null,
      tasks: null
    };
  },
  created() {
    this.projectId = this.$route.params.projectId;

    pd.projects.every(proj => {
      if (proj.id == this.projectId) {
        proj.tasks = [];
        this.project = proj;
        return false;
      }
      return true;
    });

    if (this.project) {
      pd.monthlyTasks.forEach(task => {
        if (task.projectId == this.project.id) {
        	task.items = [];
        	this.project.tasks.push(task);

        	pd.taskItems.forEach(item => {
        		if(item.taskId == task.id) {
        			task.items.push(item);
        		}
        	});
        }
      });
      this.tasks = this.project.tasks;
    }
  }
}
