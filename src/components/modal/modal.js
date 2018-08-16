//Implementation is base from https://vuejs.org/v2/examples/modal.html
export default {
  name: 'modal',
  props: ['config'],
  data () {
    return {
      showModal: false,
      containerStyle: {},
      hideFooter: true,
      headerStyle: {},
      bodyStyle: {}
    }
  },
  created(){
  	this.setConfig();
  },
  methods: {
  	setConfig(){
      this.config.containerStyle != undefined ? this.containerStyle = this.config.containerStyle : null;
      this.config.headerStyle != undefined ? this.headerStyle = this.config.headerStyle : null;
  	}
  },
  components: {}
}