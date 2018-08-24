export default {
	data(){
		return {
			companies: [{
				name: '中海庭',
				key: 'zht'
			}]
		};
	},
	methods:{
		toDashboard(company){
			this.$router.push('/console/cust/monthly/' + company.key + '/overview');
		}
	}
}