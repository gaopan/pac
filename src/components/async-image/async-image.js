
export default {
	name: 'async-image',
	props: {
		generator: {
			type: Function,
			required: true
		}
	},
	data(){
		return {
			src: null
		};
	},
	created: function(){
		var vm = this;
		this.$props.generator.call(this, function(base64Url){
			vm.src = base64Url;
		})
	}
}