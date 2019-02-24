import Timeline from './timeline.js'
export default {
  name: 'task-timeline',
  props: {
    data: {
      type: Array
    },
    currentMonth: {
      type: String
    }
  },
  data(){
    return {};
  },
  watch: {
    data(){
      this.updateTimeline();
    },
    currentMonth(val){
      this.timeline.currentMonth(val);
      this.timeline.render();
    }
  },
  mounted(){
    this.timeline = new Timeline(this.$refs.timeline).data(this.data).currentMonth(this.currentMonth);
    this.timeline.render();
  },
  methods: {
    updateTimeline(){
      this.timeline.data(this.data);
      this.timeline.render();
    }
  }
}