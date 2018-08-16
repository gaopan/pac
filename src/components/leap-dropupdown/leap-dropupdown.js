export default {
	name: 'leap-dropupdown',
	props: ['originContainer','dropType'],
	data(){
		return {
			windowsClickCount: 0,
			panelClickCount: 0
		}
	},
	computed: {
		dropDownStyle: function(){

			let togglePos = this.$props.originContainer.getBoundingClientRect();

			let styleObj = {};

			if(this.$props.dropType == "up"){

				styleObj.position = "absolute";
			    styleObj.bottom = `${togglePos.height}px`;
			    styleObj.left = `${togglePos.x}px`;

			} else {
				//Style for dropdown
			}
			

			return styleObj;
		}
	},
	created(){},
	mounted(){
		var vm = this;

		setTimeout(() => {
            window.addEventListener('click',vm.fnWindowsClicked);
            window.addEventListener('resize',vm.fnWindowsResized);
            this.$el.addEventListener('click',vm.fnComponentClicked);
        },0);

	},
	methods:{
		fnWindowsClicked(e){
			this.$data.windowsClickCount++;
		},
		fnComponentClicked(e){
			this.$data.panelClickCount++;
		},
		fnWindowsResized(){
			this.$emit('closeDropupdown');
		}
	},
	watch:{
		windowsClickCount: function(nVal,oVal){
			if(nVal != this.panelClickCount){
				this.$emit('closeDropupdown');
			}
		}
	},
	beforeDestroy(){
		window.removeEventListener('click',null);
		this.$el.removeEventListener('click',null);
		this.$data.windowsClickCount = 0;
		this.$data.panelClickCount = 0;
	}
}