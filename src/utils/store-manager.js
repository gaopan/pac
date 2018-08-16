/* Storage manager to utilize storage to persist vuex
*  Storage type : local or session
*  Local Storage: Use it when you want the data to exists after user session end (i.e: close tab/browser).
*  Session Storage: This data will automatically removed once the tab/browser close. Change browser will create new browser
*  Use: new <import name>('session'/'local') to set the store type
*  Date: 02/08/2017
*  Author: muhammad-azhaziq.bin-mohd-azlan-goh@hpe.com (Azhaziq)
*/

const storageOpsMessage = {
	success: "SUCCESS",
	failed: "FAILED",
	notExists: "SESSIONS NOT EXISTS"
} 

function checkUndefined(val){
	
	let undefinedFlag = false;

	val == undefined ? undefinedFlag = true : null;

	return undefinedFlag;
}

export default class {

	constructor(type){
		switch(type){

			case 'local':
				this.storage = window.localStorage;
				break;
			case 'session':
				this.storage = window.sessionStorage;
				break;
		}
	}

	setStorage(key, value){
		try {
			this.storage.setItem(key,value);

			return storageOpsMessage.success;

		} catch (e){
			return storageOpsMessage.failed;
		}
	}

	getStorage(key){

		var sessionData = this.storage.getItem(key);

		if(checkUndefined(sessionData)){
			return storageOpsMessage.notExists;
		} else {
			return sessionData;
		} 
	}

	deleteStorage(key){

		try {
			this.storage.removeItem(key);
			return storageOpsMessage.success;
		} catch (e) {
			return storageOpsMessage.failed;
		}
	}

	clearStorage(){

		try {
			this.storage.clear();
			return storageOpsMessage.success;
		} catch (e){
			return storageOpsMessage.failed;
		}

	}
}

// export default {
// 	set(key, value, type){

// 		let storage;

// 		switch (type){
// 			case local
// 		}
// 		try {
// 			sessionStorage.setItem(key,value);

// 			return storageOpsMessage.success;

// 		} catch (e){
// 			return storageOpsMessage.failed;
// 		}
// 	},
// 	get(key){

// 		var sessionData = sessionStorage.getItem(key);

// 		if(checkUndefined(sessionData)){
// 			return storageOpsMessage.notExists;
// 		} else {
// 			return sessionData;
// 		} 
		
		
// 	},
// 	del(key){

// 		try {
// 			sessionStorage.removeItem(key);
// 			return storageOpsMessage.success;
// 		} catch (e) {
// 			return storageOpsMessage.failed;
// 		}
// 	},
// 	clearAll(){

// 		try {
// 			sessionStorage.clear();
// 			return storageOpsMessage.success;
// 		} catch (e){
// 			return storageOpsMessage.failed;
// 		}

// 	}
// }