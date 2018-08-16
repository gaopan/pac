/*Cookie library used for this project is js-cookies (https://github.com/js-cookie/js-cookie)
* The implementation of this function is inspired from the DnA Project
*
* Date: 30/5/2017
* Author: muhammad-azhaziq.bin-mohd-azlan-goh@hpe.com (Azhaziq)
*/

//Library or File Import
import Cookies from 'js-cookie'

//Constant and Global Declaration
const defaultCookiesConfig = { path: "/"};

const cookiesOpsMessage = {
	success: "SUCCESS",
	failed: "FAILED",
	notExists: "COOKIES NOT EXISTS"
} 

function checkUndefined(val){
	
	let undefinedFlag = false;

	val == undefined ? undefinedFlag = true : null;

	return undefinedFlag;
}

export default {
	set(key, value, opts){

		let options = opts || defaultCookiesConfig;

		let transformedStr = value;

		if(typeof value == 'object'){
			transformedStr = JSON.stringify(value);
		}

		Cookies.set(key,transformedStr,options);

		let val = Cookies.get(key);
		
		if(!checkUndefined(val)){
			return cookiesOpsMessage.success
		} else {
			return cookiesOpsMessage.failed
		}
	},
	get(key){

		let value = null;

		let transformedStr = Cookies.get(key);
		
		if(transformedStr){
			let jsonRegExp = /{.*}/g;

			if(jsonRegExp.test(jsonRegExp)){
				try{
					value = JSON.parse(transformedStr);
				} catch (e) {
					Cookies.remove(key);
				}
			} else {
				value = transformedStr;
			}
		}

		return value;
	},
	del(key,opts){

		let options = opts || defaultCookiesConfig;

		let val = Cookies.get(key);

		if(checkUndefined(val)){
			return cookiesOpsMessage.notExists
		} else {

			Cookies.remove(key,opts);
			val = Cookies.get(key);

			if(checkUndefined(val)){
				return cookiesOpsMessage.success
			} else {
				return cookiesOpsMessage.failed
			}
		}
	}
}