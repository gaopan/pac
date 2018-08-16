import TypeChecker from "@/utils/type-checker.js"

class objDtModel {

	constructor(filterType){
		this._filterType = filterType,
		this._value = {} 
	}

	set value(value){

		//Check if value is array or not
		if(!TypeChecker.isObject(value)){
			throw `${this._filterType} value must be object`
		}

		this._value = value;
	}

	get model(){

		return {
			filterType: this._filterType,
			value: this._value
		}
	}
}

class arrayDtModel{

	constructor(filterType){
		this._filterType = filterType,
		this._value = []
	}

	set value(value){

		//Check if value is array or not
		if(!TypeChecker.isArray(value)){
			throw `${this._filterType} exclude value must be array`
		}

		this._value = value;
	}

	get model(){

		return {
			filterType: this._filterType,
			value: this._value
		}
	}
}

class comparatorArrayDtModel{

	constructor(filterType){
		this._filterType = filterType,
		this._value = {
			include: [],
			exclude: []
		}
	}

	set include(value){

		//Check if value is array or not
		if(!TypeChecker.isArray(value)){
			throw `${this._filterType} include value must be array`
		}

		this._value.include = value;
	}

	set exclude(value){

		//Check if value is array or not
		if(!TypeChecker.isArray(value)){
			throw `${this._filterType} exclude value must be array`
		}

		this._value.exclude = value;
	}

	get model(){

		return {
			filterType: this._filterType,
			value: {
				include: this._value.include,
				exclude: this._value.exclude
			}
		}
	}
}

class attrObjDtModel {

	constructor(fieldType,fieldName){
		this._fieldType = fieldType,
		this._field = fieldName,
		this._value = {} 
	}

	set value(value){

		//Check if value is array or not
		if(!TypeChecker.isObject(value)){
			throw `${this._field} value must be object`
		}

		this._value = value;
	}

	get model(){

		return {
			fieldType: this._fieldType,
			field: this._field,
			value: this._value
		}
	}
}

class attrArrayDtModel{
	constructor(fieldType,fieldName){
		this._fieldType = fieldType,
		this._field = fieldName,
		this._value = {
			include: [],
			exclude: []
		}
	}

	set include(value){

		//Check if value is array or not
		if(!TypeChecker.isArray(value)){
			throw `${this._field} include value must be array`
		}

		this._value.include = value;
	}

	set exclude(value){

		//Check if value is array or not
		if(!TypeChecker.isArray(value)){
			throw `${this._field} exclude value must be array`
		}

		this._value.exclude = value;
	}

	get model(){

		return {
			fieldType: this._fieldType,
			field: this._field,
			value: {
				include: this._value.include,
				exclude: this._value.exclude
			}
		}
	}
}

class attrArrayObjectDtModel{
	constructor(fieldType,fieldName){
		this._fieldType = fieldType,
		this._field = fieldName,
		this._value = []
	}

	//The value inside array should be { min: xxx, max: yyy }
	set value(value){

		//Check if value is array or not
		if(!TypeChecker.isArray(value)){
			throw `${this._field} include value must be array`
		}

		this._value = value;
	}

	get model(){

		return {
			fieldType: this._fieldType,
			field: this._field,
			value: this._value
		}
	}
}

class saveAsFilterModel {
	constructor(){
		this._name = '';
		this._fav = false;
		this._active = false;
		this._id = '';
	}

	set value(value){
		//Check if value is array or not
		if(!TypeChecker.isObject(value)){
			throw `Save As Object must be object`
		}

		this._name = value.name;
		this._fav = value.fav;
		this._active = value.active;
		this._id = value.id;
	}

	get model(){
		
		return {
			name: this._name,
			fav: this._fav,
			active: this._active,
			id: this._id
		}
	}
}

class filterOverallModel {
	constructor(){
		this._name = 'Untitled';
		this._fav = false;
		this._active = false;
		this._applied = false;
		this._value = [];
		this._id = '';
		//25 Jan 2018: adib.ghazali@hpe.com - add typeOf (saved/history)
		this._typeOf = ''; 		
		this._recipeId = '';
		this._replaced = false;
	}

	set value(value){
		//Check if value is array or not
		if(!TypeChecker.isObject(value)){
			throw `Overall Object must be object`
		}

		this._name = value.name;
		this._fav = value.fav;
		this._active = value.active;
		this._value = value.value;
		this._id = value.id;
		this._typeOf = value.typeOf;
		this._recipeId = value.recipeId;
		this._applied = value.applied;
		this._replaced = value.replaced;

	}

	get model(){
		
		return {
			name: this._name,
			fav: this._fav,
			active: this._active,
			applied: this._applied,
			value: this._value,
			id: this._id,
			typeOf: this._typeOf,
			recipeId: this._recipeId,
			replaced: this._replaced
		}
	}
}

// Azhaziq - 17/11/2017 - Add Process Analytic Id
class emitModel {
	constructor(){
		this._process = '';
		this._recipeId = '';
		this._customerId = '';
		this._dynamicFilters = [];
		this._processAnalyticsId = '';
	}

	set process(value){
		//Check if value is array or not
		if(!TypeChecker.isString(value)){
			throw `Process must be a string`
		}

		this._process = value;
	}

	set recipeId(value){
		//Check if value is array or not
		if(!TypeChecker.isString(value)){
			throw `Recipe Id must be a string`
		}

		this._recipeId = value;
	}

	set customerId(value){
		//Check if value is array or not
		if(!TypeChecker.isString(value)){
			throw `Customer Id must be a string`
		}

		this._customerId = value;
	}

	set dynamicFilters(value){
		//Check if value is array or not
		if(!TypeChecker.isArray(value)){
			throw `Dynamic Filters Object must be an array`
		}

		this._dynamicFilters = value;
	}

	set processAnalyticsId(value){
		this._processAnalyticsId = value;
	}

	get model(){

		return {
			process: this._process,
			recipeId: this._recipeId,
			customerId: this._customerId,
			dynamicFilters: this._dynamicFilters,
			processAnalyticsId: this._processAnalyticsId
		}
	}
}

class apiCommunicationModel {
	constructor(){
		this._customerId =  '';
		this._processName = '';
		this._recipeId = '';
		this._filter = {
			distinct:[],
			continuous: [],
			connections: []
		};
		this._processAnalyticsId = '';
	}

	set customerId(value){
		//Check if value is string or not
		if(!TypeChecker.isString(value)){
			throw `Customer Id must be a string`
		}

		this._customerId = value;
	}

	set processName(value){
		//Check if value is string or not
		if(!TypeChecker.isString(value)){
			throw `Process Name must be a string`
		}

		this._processName = value;
	}

	set recipeId(value){
		//Check if value is string or not
		if(!TypeChecker.isString(value)){
			throw `Recipe Id must be a string`
		}

		this._recipeId = value;
	}

	set filter(value){
		//Check if value is array or not
		if(TypeChecker.isObject(value)){
			this._filter[value.type].push(value.data);
		} else if (TypeChecker.isArray(value)) {
			for(var key in value){
				
				//Cover Attribute cases
				if(TypeChecker.isArray(value[key])){
					
					for(var key2 in value[key]){

						let filterType = value[key][key2].type,
							filterData = value[key][key2].data

						this._filter[filterType].push(filterData);
					}

				} else {
					let filterType = value[key].type,
						filterData = value[key].data

					this._filter[filterType].push(filterData);
				}
			}

		} else {
			throw `Filter value must be a object or array`
		}
	}

	set processAnalyticsId(value){
		this._processAnalyticsId = value;
	}

	get model(){
		return {
			customerId: this._customerId,
			processName: this._processName,
			recipeId: this._recipeId,
			filter: this._filter,
			processAnalyticsId: this._processAnalyticsId
		}
	}
}

class distinctModel {
	constructor() {
		this._name = '';
		this._values = [],
		this._comparator = ''
	}

	set name(value) {
		//Check if value is string or not
		if(!TypeChecker.isString(value)){
			throw `Name must be a string`
		}

		this._name = value;
	}

	set values(value){
		//adib.ghazali@hpe.com - Jarod new implementation( Attribute - number) Check if value is (array/object) or not
		if(!(TypeChecker.isArray(value) || TypeChecker.isObject(value))) {
			throw `Distinct values must be a Array or Object`
		}

		this._values = value;
	}

	set comparator(value){
		//Check if value is string or not
		if(!TypeChecker.isString(value)){
			throw `Name must be a string`
		}

		this._comparator = value;
	}

	get model(){
		return {
			name: this._name,
			values: this._values,
			comparator: this._comparator
		}
	}
}

class continuousModel {
	constructor() {
		this._name = '';
		this._comparator = '',
		this._value = ''
	}

	set name(value) {
		//Check if value is string or not
		if(!TypeChecker.isString(value)){
			throw `Name must be a string`
		}

		this._name = value;
	}

	set comparator(value){
		//Check if value is string or not
		if(!TypeChecker.isString(value)){
			throw `Value must be a string`
		}

		this._comparator = value;
	}

	set value(value){
		//Check if value is string or not
		if(!TypeChecker.isString(value) && !TypeChecker.isNumber(value)){
			throw `Value must be a string or number`
		}

		this._value = value;
	}

	get model(){
		return {
			name: this._name,
			comparator: this._comparator,
			value: this._value
		}
	}
}

class connectionsModel {
	constructor() {
		this._source = '';
		this._target = '';
		this._comparator = '';
	}

	set source(value) {
		//Check if value is number or not
		if(!TypeChecker.isNumber(value) && !TypeChecker.isString(value)){
			throw `Source must be a number or string`
		}

		this._source = value;
	}

	set target(value){
		//Check if value is number or not
		if(!TypeChecker.isNumber(value) && !TypeChecker.isString(value)){
			throw `Target must be a number or string`
		}

		this._target = value;
	}

	set comparator(value){
		//Check if value is string or not
		if(!TypeChecker.isString(value)){
			throw `Comparator must be a string`
		}

		this._comparator = value;
	}

	get model(){
		return {
			source: this._source,
			target: this._target,
			comparator: this._comparator
		}
	}
}

class apiSaveFilterModel {
	
	constructor (){
		this._name = '';
		this._value = '';
		this._isFavorite = false;
	}

	set name(val){
		this._name = val;
	}

	set value(val){
		this._value = JSON.stringify(val);
	}

	set isFavorite(val){
		this._isFavorite = val;
	}

	get model(){
		return {
			name: this._name,
			value: this._value,
			isFavorite: this._isFavorite
		}
	}
}

class apiSaveFilterWithDerivedModel {

	constructor() {
		this._name = '';
		this._value = '';
		this._isFavorite = false;
		this._derivedFromId = '';
	}

	set name(val) {
		this._name = val;
	}

	set value(val) {
		this._value = JSON.stringify(val);
	}

	set isFavorite(val) {
		this._isFavorite = val;
	}

	set derivedFromId(val) {
		this._derivedFromId = val;
	}

	get model() {
		return {
			name: this._name,
			value: this._value,
			isFavorite: this._isFavorite,
			derivedFromId: this._derivedFromId
		}
	}
}

export	{ 	objDtModel , 
			arrayDtModel,
			comparatorArrayDtModel,
			attrObjDtModel,
			attrArrayDtModel,
			activityDtModel, 
			saveAsFilterModel, 
			filterOverallModel,
			emitModel,
			apiCommunicationModel,
			distinctModel,
			continuousModel,
			connectionsModel,
			apiSaveFilterModel,
			apiSaveFilterWithDerivedModel }


