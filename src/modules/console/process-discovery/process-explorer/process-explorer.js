import DynamicFilter from './dynamic-filter/DynamicFilter.vue'

export default {
	name: 'process-explorer',
	data(){
		return {
			showFilter: true
		}
	},
	components: {DynamicFilter}
}