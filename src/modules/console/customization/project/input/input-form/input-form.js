import Vue from 'vue'
import CommonUtils from '@/utils/common-utils.js'
import TypeChecker from '@/utils/type-checker.js'
import LeapSelect from '@/components/leap-select/LEAPSelect.vue'
import Noty from '@/utils/noty-operation.js'
import Rte from '@/components/rich-text-editor/RichTextEditor.vue';
import ProjectApi from '@/api/customization/project.js'

/*
Task step:
empty -> saved -> submitted -> approved
*/
export default {
  props: {
    project: {
      type: Object,
      required: true
    },
    month: {
      type: String,
      required: true
    }
  },
  components: { LeapSelect, Rte },
  watch: {
    project(){
      this.parseProject();
    },
    month(val){
      this.proj.curMonthTask.month = val;
      this.parseProject();
    }
  },
  data() {
    return {
      projStatusOptions: [{
        name: "红色",
        value: "red"
      }, {
        name: "绿色",
        value: "green"
      }],
      proj: {
        name: null,
        tasks: null,
        curMonthTask: {}
      },
      rteSetup: {
        config: {
          panel: {
            style: {
              "min-height": "300px"
            }
          },
          mode: "simple",
          showBodyCharacters: false
        }
      }
    };
  },
  created() {
    this.user = this.$store.getters.userProfile;
    this.parseProject();
  },
  methods: {
    parseProject() {
      let theProj = this.$props.project;
      this.proj.name = theProj.name;
      this.proj.status = theProj.status;
      this.proj.id = theProj.id;
      this.proj.description = theProj.description;
      this.proj.companyId = theProj.companyId;
      this.proj.tasks = theProj.tasks.map(t => {
        let _t = {
          id: t.id,
          projectId: t.projectId,
          month: t.month,
          status: t.status,
          value: t.value,
          step: t.step || "empty"
        };
        if(t.month == this.month) {
          this.proj.curMonthTask = _t;
        }
        return _t;
      });
      if(!this.proj.curMonthTask.id) {
        this.proj.curMonthTask.status = "";
        this.proj.curMonthTask.value = "";
        this.proj.curMonthTask.step = "empty";
      }
      // this.proj.tasks.sort((a, b) => {
      //   let aAMonth = a.month.split('-'),
      //     aBMonth = b.month.split('-');
      //   let yearA = parseInt(aAMonth[0]),
      //     monthA = parseInt(aAMonth[1]),
      //     yearB = parseInt(aBMonth[0]),
      //     monthB = parseInt(aBMonth[1]);
      //   if (yearA > yearB) {
      //     return true;
      //   } else if (yearA < yearB) {
      //     return false;
      //   } else {
      //     return yearA > yearB;
      //   }
      // });
    },
    prepareDataToSend(){
      let vm = this, curMonthTask = vm.proj.curMonthTask, proj = this.proj;
      let taskData = function(){
        let task = {
          projectId: proj.id,
          status: curMonthTask.status,
          value: curMonthTask.value,
          month: vm.month,
          step: curMonthTask.step
        };
        if(curMonthTask.id) {
          task.id = curMonthTask.id;
        }
        return task;
      };
      let projectData = function(){
        return {
          id: proj.id,
          name: proj.name,
          status: proj.status,
          companyId: proj.companyId,
          description: proj.description
        };
      };
      return {
        project: projectData(),
        task: taskData()
      };
    },
    request(type){
      let req = null, name = null, dataToSend = this.prepareDataToSend(), task = dataToSend.task, proj = dataToSend.project;
      if(type == "save") {
        task.status = "saved";
        name = "保存";
      } else if(type == "submit") {
        task.status = "submitted";
        name = "提交";
      } else if(type == "approve"){
        task.status = "approved";
        name = "保存";
      } else if(type == "reject"){
        task.status = "empty";
        name = "保存";
      } else if(type == "withdraw") {
        task.status = "empty";
        name = "保存";
      }
      if(task.id) {
        req = ProjectApi.updateTask(task.id, task);
      } else {
        req = ProjectApi.addTask(task);
      }
      req.then(res => {
        ProjectApi.updateProject(proj.id, proj).then(r => {
          Noty.notifySuccess({ text: `${name}数据成功！` });
        }, err => {
          Noty.notifySuccess({ text: `${name}数据失败！` });
        });
      });
    },
    onEmittedUpdateContent(updatedContent) {
      this.proj.curMonthTask.value = updatedContent();
    }
  }
}
