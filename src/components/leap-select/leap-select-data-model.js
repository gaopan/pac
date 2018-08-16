import TypeChecker from "@/utils/type-checker.js"

//This data model use for single list for multiSelectOptions
class multiSelectItemModel {

	constructor(){
    	this._id = 0;
		this._name = 'Select All';
		this._value = 'selectAll';
    	this._isSelected = false;
    	this._isHightlighted = false;
    	this._isDisableClick = false;
	}

	set id(value){

		if(!TypeChecker.isNumber(value)){
			throw 'Id must be a number'
		}

		this._id = value;
	}

	set name(value){

		if(!TypeChecker.isString(value)){
			throw 'Name must be a string'
		}

		this._name = value;
	}

	set value(value) {
		
		if(!TypeChecker.isString(value)){
			throw 'Value must be a string'
		}

		this._value = value;

	}

	set isSelected(value){

		if(!TypeChecker.isBoolean(value)){
			throw `Selected must be a boolean`
		}

		this._isSelected = value;
	}

	set isHightlighted(value){

		if(!TypeChecker.isBoolean(value)){
			throw `Hightlighted value must be a boolean`
		}

		this._isHightlighted = value;
	}

	set isDisableClick(value){

		if(!TypeChecker.isBoolean(value)){
			throw `Disable Click value must be a boolean`
		}

		this._isDisableClick = value;
	}

	get model(){

		return {
			id: this._id,
			name: this._name,
			value: this._value,
			isSelected: this._isSelected,
			isHightlighted: this._isHightlighted,
			isDisableClick: this._isDisableClick
        }
        
	}

}

//This data model use for manipulate event after onChangeMultiSelect
class multiSelectItemEventModel {

	constructor(){
    	this._id = 0;
    	this._name = '';
    	this._isChecked = false;
	}

	set id(value){

		if(!TypeChecker.isNumber(value)){
			throw 'Id must be a number'
		}

		this._id = value;
	}

	set name(value){

		if(!TypeChecker.isString(value)){
			throw 'Name must be a string'
		}

		this._name = value;
	}

	set isChecked(value){

		if(!TypeChecker.isBoolean(value)){
			throw 'Checked must be a boolean'
		}

		this._isChecked = value;
	}

	get model(){

		return {
			id: this._id,
			name: this._name,
			checked: this._isChecked
        }
        
	}

}

//This data model use for emit selected values to parent
class emitSelectedValuesModel {
	//TODO,

	constructor(){
    	this._propertyId = '';
    	this._value = null;
	}

	set propertyId(value){

		if(!TypeChecker.isString(value)){
			throw 'Property Id must be a string'
		}

		this._propertyId = value;
	}

	set value(value){

		if(!TypeChecker.isString(value) || !TypeChecker.isArray(value)){
			throw 'Value must be a string or array'
		}

		this._value = value;
	}

	get model(){

		return {
			propertyId: this._propertyId,
			value: this._value,
        }
        
	}

}

export { 	multiSelectItemModel,
			multiSelectItemEventModel,
			emitSelectedValuesModel  }