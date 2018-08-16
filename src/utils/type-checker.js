let fnProtoToStr = Object.prototype.toString

const ArrayRegExp = new RegExp('^\\[.*\\]$');
const ObjectRegEXp = new RegExp('^\\{.*\\}$');
export default {
	isObject: function(t){
		return fnProtoToStr.call(t) === '[object Object]'
	},
	isArray: function(t){
		return fnProtoToStr.call(t) === '[object Array]'
	},
	isString: function(t){
		return fnProtoToStr.call(t) === '[object String]'
	},
	isNumber: function(t){
		return fnProtoToStr.call(t) === '[object Number]'
	},
	isBoolean: function(t){
		return fnProtoToStr.call(t) === '[object Boolean]'
	},
	isFunction: function(t){
		return fnProtoToStr.call(t) === '[object Function]';
	},
	isUndefined: function(t){
		return fnProtoToStr.call(t) === '[object Undefined]';
	},
	isNull: function(t){
		return fnProtoToStr.call(t) === '[object Null]';
	},
	isArrayString: function(t){
		return fnProtoToStr.call(t) === '[object String]' && ArrayRegExp.test(t);
	},
	isObjectRegExp: function(t){
		return fnProtoToStr.call(t) === '[object String]' && ObjectRegEXp.test(t);
	}
}