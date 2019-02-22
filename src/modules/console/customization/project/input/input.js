import pd from '../project.data.js'
import CommonUtils from '@/utils/common-utils.js'
import TypeChecker from '@/utils/type-checker.js'
import Noty from '@/utils/noty-operation.js'
import ProjectApi from '@/api/customization/project.js'
import BScroll from "better-scroll"
import shared from '@/shared.js'
import CommonGenerators from '@/utils/common-generators.js'
import InputForm from './input-form/InputForm.vue'
import LeapSelect from '@/components/leap-select/LEAPSelect.vue'

let UUIDGenerator = CommonGenerators.UUIDGenerator

let eventHub = shared.eventHub

export default {
  data() {
    return {
      loadId: UUIDGenerator.purchase(),
      projects: null,
      currentProject: null,
      curMonth: null,
      user: null,
      newProject: null,
      projStatusOptions: [{
        name: "正在进行",
        value: "InProgress"
      }, {
        name: "已经完成",
        value: "Completed"
      }]
    };
  },
  components: { InputForm, LeapSelect },
  created() {
    this.user = this.$store.getters.userProfile;
    eventHub.$on("global-date", this.onGlobalDateChange);
    this.companyId = this.$router.currentRoute.params.companyId;
    let globalDate = new Date(localStorage.getItem("global-date")) || new Date();
    this.curMonth = globalDate.getFullYear() + "-" + (globalDate.getMonth() + 1);
    this.init();
  },
  beforeDestroy(){
    eventHub.$off("global-date", this.onGlobalDateChange);
  },
  methods: {
    init() {
      this.refreshData(function() {
        this.currentProject = this.projects[0];
        this.tabScroll = new BScroll(this.$refs.tabs, {
          probeType: 3,
          scrollX: true,
          scrollY: false,
          click: true
        });
      });
    },
    activeProject(m) {
      this.currentProject = null;
      setTimeout(() => {
        this.currentProject = m;
      }, 0)
    },
    refreshData(cb) {
      let projects = null;
      let projectPromise = ProjectApi.getProjectsByCompanyId(this.companyId);
      eventHub.$emit("start-mini-loader", { id: this.loadId });
      projectPromise.then(res => {
        projects = res.data.map(p => {
          return {
            id: p.id,
            companyId: p.companyId,
            name: p.name,
            status: p.status,
            description: p.description,
            tasks: p.monthlyTask
          };
        });
        this.projects = projects;
        if (cb) {
          cb.call(this);
        }
        eventHub.$emit("finish-mini-loader", { id: this.loadId });
      });
    },
    refresh() {
      let currentProjectName = null;
      if (this.currentProject) {
        currentProjectName = this.currentProject.name;
      }
      this.currentProject = null;
      this.refreshData(function() {
        if (currentProjectName) {
          this.projects.every(m => {
            if (m.name == currentProjectName) {
              this.currentProject = m;
              return false;
            }
            return true;
          });
        } else {
          this.currentProject = this.projects[0];
        }
        if (this.tabScroll) {
          this.tabScroll.refresh();
        }
      });
    },
    onGlobalDateChange(newDate) {
      let theDate = new Date(newDate);
      this.curMonth = theDate.getFullYear() + '-' + (theDate.getMonth() + 1);
      this.refresh();
    },
    toAddProject(){
      this.newProject = {
        companyId: this.companyId
      };
    },
    onFormRequested(){
      this.refresh();
    },
    submit(){
      ProjectApi.addProject(this.newProject).then(res => {
        this.newProject = null;
        this.refresh();
        Noty.notifySuccess({text: "保存数据成功！"});
      }, err => {
        Noty.notifyError({text: "保存数据失败！"});
      });
    },
    cancel(){
      this.newProject = null;
    }
  }
}
