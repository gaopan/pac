

export default {
  props: {
    project: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
    };
  },
  watch: {
    project(){
      this.prepareTasks();
    }
  },
  created() {
    this.prepareTasks();
  },
  methods: {
    prepareTasks(){
      let tasks = [];
      if(this.project.tasks) {
        this.tasks = this.project.tasks.map(t => {
          return {
            id: t.id,
            value: t.value,
            month: t.month,
            projectId: t.projectId
          };
        });
      }
      
    }
  }
}
