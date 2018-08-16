import TypeChecker from './type-checker.js'

export default {
	capitalize: function(str){
		if(!TypeChecker.isString(str)) {
			console.warn("The argument of capitalize method should be string!");
			return null;
		}
		return str.charAt(0).toUpperCase() + str.substring(1, str.length);
	},
	getter: function(str){
		if(!TypeChecker.isString(str)) {
			console.warn("The argument of getter method should be string!");
			return null;
		}
		return 'get' + this.capitalize(str);
	},
	setter: function(str){
		if(!TypeChecker.isString(str)) {
			console.warn("The argument of setter method should be string!");
			return null;
		}
		return 'set' + this.capitalize(str);
	},
}