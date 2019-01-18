import Utils from '../utils';
import TypeChecker from './type-checker-utils';
import Formatter from '../formatter';

class History {

    /** DATA MODEL
     * 
     *  {
     *     title: null, //header
     *       body: null,  //body value
     *       caretFocusElemArr: undefined, //to restore the caret position (need to know the element) - only applied for caretFocusOn(body)
     *       caretFocusPosition: undefined, //position of caret at specific element
     *       caretFocusOn: 'body' // init, title, body
     *   } 
     * 
     *
     */

	constructor(){
		this._title = null,
		this._body = null,
		this._caretFocusElemArr = undefined,
		this._caretFocusPosition = undefined,
		this._caretFocusOn = 'init'
	}
    
	set title(value){

		if(!TypeChecker.isString(value)){
			throw `Title value must be string`
		}

		this._title = value;

    }
    
    set body(value){

		if(!TypeChecker.isString(value)){
			throw `Body value must be string`
		}

		this._body = value;

    }
    
    set caretFocusElemArr(value){

		if(!TypeChecker.isArray(value)){
			throw `caretFocusElemArr value must be array`
		}

		this._caretFocusElemArr = value;

    }
    
    set caretFocusPosition(value){

		if(!TypeChecker.isNumber(value)){
			throw `caretFocusPosition value must be number`
		}

		this._caretFocusPosition = value;

    }
    
    set caretFocusOn(value){

		if(!TypeChecker.isString(value)){
			throw `caretFocusOn value must be string`
		}

		this._caretFocusOn = value;

    }

	get model(){

		return {
			title: this._title,
			body: this._body,
			caretFocusElemArr: this._caretFocusElemArr,
			caretFocusPosition: this._caretFocusPosition,
			caretFocusOn: this._caretFocusOn
		}
        
	}
    
}

export default {
   
    setFirstHistoryElementData(rteVariable) {

        let haveTitle = rteVariable.titleIn && rteVariable.config.mode === "full",
            haveBody = typeof rteVariable.dataIn !== "undefined" && rteVariable.dataIn != null && (typeof rteVariable.dataIn === "string" && rteVariable.dataIn.length > 0);

        let historyDataModel = new History().model;

        if(haveTitle || haveBody) {

            historyDataModel.title = (haveTitle) ? rteVariable.title : null;
            historyDataModel.body = (haveBody) ? rteVariable.value : null;
            
        }

        rteVariable.history.push(historyDataModel);

        // console.log('set first element', rteVariable.history.getValues());

    },
    storeUndoRedoData(rteVariable, type, typeValue, parentChildNodes) {

        //This function will return the hierarchy of focusNode (from last to first)
        function _getChildNodesArr(focusNode) {

            if(parentChildNodes.length === 0) return [];

            let arr = [];
                
            //Inspired from this: http://jsfiddle.net/moagrius/kamcb6gr/
            function getChildIndex (child, cb) {
                
                var parent = child.parentNode;

                if(parent) {

                    var i = parent.childNodes.length - 1;

                    for (; i >= 0; i--) {
    
                        if (child === parent.childNodes[i]){
                            
                            cb(i);
                            
                            if(parent.className !== 'rte-pane-body-view') {
    
                                getChildIndex(parent, cb);
                                
                            } 
    
                            break;
                                    
                        }
    
                    }

                } else {

                    cb(null);

                }
               
            }

            getChildIndex(focusNode, function(selectedIndex) {
                arr.push(selectedIndex);
            });

            return arr; 

        }

        let caretLastPos = Utils.getCurrentCaretPos();
        
        let historyDataModel = new History().model;
        
        historyDataModel.title = (type === 'body') ? rteVariable.title : typeValue;
        historyDataModel.body = (type === 'body') ? typeValue : rteVariable.value;
        //In the event of first time load we may not have focusNode
        historyDataModel.caretFocusElemArr = (type === 'body') && caretLastPos.focusNode ? _getChildNodesArr(caretLastPos.focusNode) : null;
        historyDataModel.caretFocusPosition = (type === 'body') ? caretLastPos.focusOffset : (typeValue) ? typeValue.length : 0;
        historyDataModel.caretFocusOn = type;

        rteVariable.history.push(historyDataModel);

        // console.log('storeUndoRedoData', rteVariable.history.getValues());
        
    },
    isDifferWithCurrentHTMLValue(rteVariable) {

        let currentHTMLValue = Formatter.getHTMLValue(rteVariable);

        let previousIndex = rteVariable.history.getValues().undo.length - 1;
        let historyData = rteVariable.history.getValues().undo[previousIndex];

        //undo HTMLValue (previous value)
        let undoHTMLValue = Formatter.getHTMLValue(rteVariable, {
            title: historyData.title,
            body: historyData.body
        });

        return (currentHTMLValue !== undoHTMLValue) ? true : false;
    
    },
    setCaretForHistoryData(rteVariable) {

        let historyLatestObj = rteVariable.history.latest();

        if(!TypeChecker.isUndefined(historyLatestObj)) {

            let targetedTitleElem =  document.getElementsByClassName('rte-pane-header')[0].childNodes[0];
                targetedTitleElem.value = historyLatestObj.title;

            let targetedBodyElem = document.getElementsByClassName('rte-pane-body-view')[0];
                targetedBodyElem.innerHTML = historyLatestObj.body;
            
            let historyCaretFocusElemArr = historyLatestObj.caretFocusElemArr;

            if(!TypeChecker.isUndefined(historyCaretFocusElemArr) && !TypeChecker.isNull(historyCaretFocusElemArr)) {

                for(let index = historyCaretFocusElemArr.length - 1; index >= 0; index--) {

                    let targetedIndex = historyCaretFocusElemArr[index];    
                    targetedBodyElem = targetedBodyElem.childNodes[targetedIndex];
                
                }

            }

            //set caret position
            switch(historyLatestObj.caretFocusOn) {
                case 'body':
                    Utils.restoreCurrentCaretPos(targetedBodyElem, historyLatestObj.caretFocusPosition);      
                    break;
                case 'title':
                    targetedTitleElem.focus();
                    break;
                default:
                    //behaviour for init

            }
                
        }

        // console.log('--set caret back', rteVariable.history.getValues());

    }

}