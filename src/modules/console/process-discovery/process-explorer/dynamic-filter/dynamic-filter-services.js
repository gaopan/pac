import TypeChecker from "@/utils/type-checker.js"
import dynamicFilterApi from '@/api/process-mining.js';
import q from '@/api/q.js';
import Store from '@/store';
import CommonUtils from "@/utils/common-utils.js";
// import StoreManager from '@/utils/store-manager.js'
import DFUtils from './dynamic-filter-utils.js';
import ErrorHandler from '@/utils/error-handler.js';

// const savedFilterStorageKey = 'dynamicFilters-savedFilters';
// const sm = new StoreManager('session');

export default {
	getAppliedFilters(processAnalyticsId){
		//	Algo: If applied filter exists, return applied filter
		//	If applied filter undefined, check for global filters (should run only once, will be triggered in either flow, compare or analysis)
		//	If have global filters make it as applied filter and return applied filter
        //	If no global filters assign {} to applied filter or default obj
		
		var defer = q.defer();
		var appliedFilter = Store.getters.getAppliedFilter;

		var cbObj = {
			data: appliedFilter,
			empty: false
		};

		if(appliedFilter == null){

			dynamicFilterApi.getSavedFilter(Store.getters.processSelection.customerId, processAnalyticsId).then((res) => {

				let savedFilters = res.data;
				let globalFilter = {};

				if(savedFilters.length == 0){
					appliedFilter = globalFilter;
					Store.dispatch('setGlobalFilters',globalFilter);
					Store.dispatch('setAppliedFilters',appliedFilter);
				} else {

					let favFilters = savedFilters.find((arrItem)=>{
						if(arrItem.isFavorite == true){
							return true;
						} else {
							return false;
						}
					});

					//Massaging data from BE
					globalFilter = favFilters ? DFUtils.transformSavedFilter(favFilters) : {};
					
					appliedFilter = globalFilter;

					Store.dispatch('setGlobalFilters',globalFilter);
					Store.dispatch('setAppliedFilters',appliedFilter);

					let localSavedFilters = [];

					for(var i = 0; i < savedFilters.length; i++){

						let tempObj = DFUtils.transformSavedFilter(savedFilters[i]);
						localSavedFilters.push(tempObj);
					}

					this.saveFilterRecipe(localSavedFilters);	
				}

				var fltrStr = CommonUtils.toString(appliedFilter);
				cbObj.data = appliedFilter;
				cbObj.empty = fltrStr === "{}" ?  true : false;
	
				defer.resolve(cbObj);
			},(res)=>{
				ErrorHandler.handleApiRequestError(res);
				console.error(res);
				defer.reject({ status: 'error' , message: 'Something when wrong' });
			})

		} else {

			var fltrStr = CommonUtils.toString(appliedFilter);
			cbObj.data = appliedFilter;
			cbObj.empty = fltrStr === "{}" ?  true : false;

			setTimeout(()=>{ defer.resolve(cbObj); },0);
		}

		return defer.promise;
	},
	//faiz-asyraf.abdul-aziz@hpe.com - get the history filters from the backend
	getHistoryFilters(processAnalyticsId) {
		// 3 April 2018: muhammad-azhaziq.bin-mohd-azlan-goh@dxc.com - Simplify history filter logics
		var defer = q.defer();

		dynamicFilterApi.getHistoryFilter(Store.getters.processSelection.customerId, processAnalyticsId).then((res) => {
			
			let historyFilters = res.data;
			let localSavedFilters = [];

			if(history.length != 0){

				for (var i = 0; i < historyFilters.length; i++) {
					let tempObj = DFUtils.transformHistoryFilter(historyFilters[i]);
					localSavedFilters.push(tempObj);
				}
			}

			this.saveHistoryFilterRecipe(localSavedFilters);

			defer.resolve(({ status: 'success',message: 'History Initialize' }));

		},(res) => { 	
			ErrorHandler.handleApiRequestError(res);			
			console.error(res);
			defer.reject({ status: 'error' , message: 'Something when wrong' });
		})

		return defer.promise;
	},
	getCurrentFilters(){
		var defer = q.defer();

		var currentFilter = Store.getters.getCurrentFilter;

		var cbObj = {
			data: currentFilter,
			empty: false
		};
    	
    	//LiaoFang Change on current filter to be {} if null
    	//Review by Azhaziq: Correct implementation 
		if (currentFilter == null) {
			currentFilter = {};
		}

		Store.dispatch('setCurrentFilters',currentFilter);

		var fltrStr = CommonUtils.toString(currentFilter);
		cbObj.data = currentFilter;
		cbObj.empty = fltrStr === "{}" ?  true : false;

		setTimeout(()=>{ defer.resolve(cbObj); },0);

		return defer.promise;
	},
	getActiveAttribute() {
		return Store.getters.getActiveAttribute;
	},
	getAttributesList() {
		return Store.getters.getAttributesList;
	},
	saveAttributesList(val) {
		Store.dispatch('setAttributesList', val);
	},
	checkSavedFilterStorage(){

		let savedFilterStorage = sm.getStorage(savedFilterStorageKey); 

        if(savedFilterStorage != "SESSIONS NOT EXISTS") {

            let transformObj = JSON.parse(savedFilterStorage);
            Store.dispatch('setSavedFilters', transformObj); 

        } else { 
            Store.dispatch('setSavedFilters', null);
        }
	},
	saveAppliedFilters(val){

		if(val != null){
			let currentAppliedFilter = CommonUtils.deepClone(Store.getters.getAppliedFilter);
			Store.dispatch('setPrevAppliedFilters',currentAppliedFilter);
		}

		Store.dispatch('setAppliedFilters',val);
	},
	saveAppliedFiltersForDeletion(val) {

		Store.dispatch('setAppliedFilters', val);
	},
	saveCurrentFilters(val){
		// Store.dispatch('setCurrentFilters',val);
	},
	saveActiveAttribute(val) {
		Store.dispatch('setActiveAttribute',val);
	},
	saveFilterRecipe(val){
		//Save the data in FE layer
		Store.dispatch('setSavedFilters',val);

		//let transformObj = JSON.stringify(val);
		//sm.setStorage(savedFilterStorageKey, transformObj);
	},
	//faiz-asyraf.abdul-aziz@hpe.com - to store the history filters on the VueX store
	saveHistoryFilterRecipe(val) {
		//Save the data in FE layer
		Store.dispatch('setHistoryFilters', val);

		//let transformObj = JSON.stringify(val);
		//sm.setStorage(savedFilterStorageKey, transformObj);
	},
	persistFilterRecipe(val,ops){
		
		var defer = q.defer();
		var processId = Store.getters.processSelection.id;

		switch(ops){
			case 'new':
				var apiData = DFUtils.savedFilterTransform('feApi',val);
				
				//Save to BE
				dynamicFilterApi.setSavedFilter(Store.getters.processSelection.customerId, processId, apiData).then((res)=>{

					if(TypeChecker.isArray(res.data)){
						defer.resolve(res.data[res.data.length - 1]);
					} else {
						defer.resolve(res.data);
					}
				});

				break;
			case 'update':
				var apiData = DFUtils.savedFilterTransform('feApi',val);
				var filterId = val.fVal.id;

				dynamicFilterApi.updateSavedFilter(Store.getters.processSelection.customerId, processId, filterId, apiData).then((res)=>{
					defer.resolve(res);
				});

				break;
			case 'delete':
				//For delete the val only have filterId
				var filterId = val;

				dynamicFilterApi.deleteSavedFilter(Store.getters.processSelection.customerId, processId, filterId).then((res)=>{
					defer.resolve(res);
				});

				break;
		}

		return defer.promise;
	},
	//faiz-asyraf.abdul-aziz@hpe.com	- save history filters to the backend
	persistHistoryFilterRecipe(val, ops) {

		var defer = q.defer();
		var processId = Store.getters.processSelection.id;

		switch (ops) {
			case 'new':
				var apiData = DFUtils.historyFilterTransform('feApi', val);

				//Save to BE
				dynamicFilterApi.createHistoryFilter(Store.getters.processSelection.customerId, processId, apiData).then((res) => {

					if (TypeChecker.isArray(res.data)) {
						defer.resolve(res.data[res.data.length - 1]);
					} else {
						defer.resolve(res.data);
					}
				});

				break;
			case 'update':
				var apiData = DFUtils.historyFilterTransform('feApi', val);
				var filterId = val.fVal.id;

				dynamicFilterApi.updateHistoryFilter(Store.getters.processSelection.customerId, processId, filterId, apiData).then((res) => {
					defer.resolve(res);
				});

				break;
			case 'delete':
				//For delete the val only have filterId
				var filterId = val;

				dynamicFilterApi.deleteHistoryFilter(Store.getters.processSelection.customerId, processId, filterId).then((res) => {
					defer.resolve(res);
				});

				break;
		}

		return defer.promise;
	},
	revertAppliedFilters(){
		let prevAppliedFilter = CommonUtils.deepClone(Store.getters.getPrevAppliedFilter);
		Store.dispatch('setAppliedFilters',prevAppliedFilter);
	}
}
