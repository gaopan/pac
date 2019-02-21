import BScroll from "better-scroll"

export default {
  props: {
    project: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      curMonth: null,
      curTask: null
    };
  },
  watch: {
    project() {
      this.prepareTasks();
    }
  },
  created() {
    let nowDate = new Date();
    this.curMonth = nowDate.getFullYear() + '-' + (nowDate.getMonth() + 1);
    this.prepareTasks();
  },
  mounted() {
    this.tabScroll = new BScroll(this.$refs.taskTabs, {
      probeType: 3,
      scrollX: true,
      scrollY: false,
      click: true
    });
  },
  methods: {
    prepareTasks() {
      let tasks = [];
      if (this.project.tasks) {
        tasks = this.project.tasks.map(t => {
          return {
            id: t.id,
            value: t.value,
            month: t.month,
            status: t.status,
            projectId: t.projectId
          };
        });
        tasks.sort((a, b) => {
          let aDateA = a.month.split('-'), aDateB = b.month.split('-');
          let monthA = Number(aDateA[1]), yearA = Number(aDateA[0]), monthB = Number(aDateB[1]), yearB = Number(aDateB[0]);
          if(yearA != yearB) {
            return yearA - yearB;
          } 
          return monthA - monthB;
        });

        this.tasks = tasks;

        if (this.tasks && this.tasks.length > 0) {
          this.tasks.every(t => {
            if (t.month == this.curMonth) {
              this.curTask = t;
              return false;
            }
            return true;
          });
          if (!this.curTask) {
            this.curTask = this.tasks[0];
          }
        }
      }

    },
    activeTask(t) {
      this.curTask = t;
    }
  }
}
