import shared from "@/shared.js";
import CommonUtils from "@/utils/common-utils.js";
import LeapDropupdown from "@/components/leap-dropupdown/LeapDropupdown.vue"
import DfServices from "../../dynamic-filter-services.js";
import Store from '@/store';

var eventHub = shared.eventHub;

export default {
	name: 'dynamic-filter-save-as',
	props: ['saveAsOrigin','localCurrentFilter'],
	components: {
    	'leap-dropupdown': LeapDropupdown
  	},
  	data(){
  		return{
  			saveAsData: {
  				name: '',
  				fav: false
			  },
			errorMessage: 'Please insert the filter name'
  		}
	  },
	computed: {
		EnableFilterButton() {
			let isEnable = false;
			let duplicateNameStatus = this.checkDuplicateFilterName();
			if (this.saveAsData.name !== '' &&  !duplicateNameStatus) {
				isEnable = true;
			}

			if(duplicateNameStatus) {
				this.errorMessage = 'Filter name is duplicate, please choose another name!';
			}else {
				this.errorMessage = 'Please insert the filter name';
			}

			return isEnable;
		},
		savedFilters: function () {
			return this.$store.getters.getSavedFilters || [];
		}
	},
  	methods: {
		checkDuplicateFilterName() {
			let countDuplicate = 0;
			let savedFiltersData = CommonUtils.deepClone(this.savedFilters);
			savedFiltersData.forEach(filter => {
				if(this.saveAsData.name.toLowerCase() === filter.name.toLowerCase() ) {
					countDuplicate++;
					return;
				}
			}) ;
			return (countDuplicate > 0) ? true: false;
		},
  		saveAs(){
  			let currentLocalCurrentFilter = CommonUtils.deepClone(this.$props.localCurrentFilter);
			let notEmptyFilters = this.checkEmptyFilters();
			//Faiz todo: add function to popup modal to indicate some empty filters will be removed.
			if(notEmptyFilters.length != currentLocalCurrentFilter.value.length) {
					// alert('There are empty filters');
			}
  			currentLocalCurrentFilter.name = this.$data.saveAsData.name;
      		currentLocalCurrentFilter.fav = this.$data.saveAsData.fav;
			currentLocalCurrentFilter.active = true;
			currentLocalCurrentFilter.typeOf = 'saved';
			currentLocalCurrentFilter.value = CommonUtils.deepClone(notEmptyFilters);
      		let metadata = {
        		fileName: this.$store.getters.processSelection.fileName,
            processAnalyticsId: this.$store.getters.processSelection.processAnalyticsId,
        		fVal: currentLocalCurrentFilter
      		};
          
      		DfServices.persistFilterRecipe(metadata,'new').then((res)=>{
		        currentLocalCurrentFilter.id = res.id;
					 this.$emit('saveAs',currentLocalCurrentFilter);
						eventHub.$emit("applyFilter");
						eventHub.$emit("applyFilter");
						eventHub.$emit("closeDFPanel");
						eventHub.$emit("closeAddFilterDetails");
	      	});
			},
		checkEmptyFilters() {
			let currentLocalCurrentFilter = CommonUtils.deepClone(this.$props.localCurrentFilter);
			let filters = [];
			// let filtersValue = this.checkFiltersValue();
			currentLocalCurrentFilter.value.map(filter => {
				if (filter.filterType == 'variant' || filter.filterType == 'touch_points' || filter.filterType == 'activity' || filter.filterType == 'activity_connection') {
					if (filter.value.include.length > 0 || filter.value.exclude.length > 0) {
						// return filter;
						filters.push(filter);
					}
				} else if (filter.filterType == 'attribute') {
					let attribute_filters = [];
					filter.value.map(val => {
						 //18 April 2018 - Bug #5146
						if(val.fieldType === 'string') {

							if (val.value.include.length > 0) {
								attribute_filters.push(val);
							}

						} else if(val.fieldType === 'number'){

							if (val.value.length > 0) {
								attribute_filters.push(val);
							}

						} else if(val.fieldType === 'date') {
							//TODO: in future
						}

					});
					if (attribute_filters.length > 0) {
						filters.push(filter);
					}
				} else if (filter.filterType == 'date_range' || filter.filterType == 'duration') {
					filters.push(filter);
				}
			});
			// console.log('filters value', filters);
			return filters;
		},
  		saveAsFavourite(){
  			this.$data.saveAsData.fav = !this.$data.saveAsData.fav;
  		},
      closeSaveAs(){
        this.$emit('closeSaveAs');
      }
  	}
}