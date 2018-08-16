import TypeChecker from "@/utils/type-checker.js"

class attributeDataModel {

	constructor() {
		this._field = '';
		this._fieldLabel = '';
		this._fieldType = '';
        this._isBoolean = false;
        this._value = [];
	}

	set field(val) {

		if(!TypeChecker.isString(value)){
			throw `Field must be a string`
        }
        
        this._field = val;

	}

	set fieldLabel(val) {

        if(!TypeChecker.isString(value)){
			throw `Field Label must be a string`
        }
        
        this._fieldLabel = val;
	}

	set isFavorite(val) {
        
        if(!TypeChecker.isString(value)){
			throw `Field Type must be a string`
        }
        
        this._fieldType = val;
	}

	set isBoolean(val) {

        if(!TypeChecker.isString(value)){
			throw `isBoolean must be a boolean`
        }
        
        this._isBoolean = val;
    }
    
    set value(val) {

        if(!TypeChecker.isArray(value)){
			throw `Value must be a array`
        }
        
        this._value = val;
	}

	get model() {
		return {
			field: this._field,
			fieldLabel: this._fieldLabel,
			fieldType: this._fieldType,
            isBoolean: this._isBoolean,
            value: this._value
		}
	}
}

export	{ attributeDataModel }