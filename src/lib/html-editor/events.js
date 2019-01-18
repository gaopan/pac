'use strict'

import Button from './button';
import Utils from './utils';
import Actions from './actions';
import UndoRedoUtils from './utils/undo-redo-utils';
import Formatter from './formatter';
import CustomTableEvents from './components/custom-table/custom-table-events';
import TypeChecker from './utils/type-checker-utils';

export default {
    trace(elem, rteVariable, evt){

        let value = null;

        let rtePaneBody = elem.getElementsByClassName('rte-pane-body-view');
        
        Formatter.formatImages(rtePaneBody[0]);
        Formatter.formatNodes(rtePaneBody[0]);
        
         //Adib - 4/7/2018: detect id for focusOnTable
        CustomTableEvents.traceCurrentFocusOnTableData(rteVariable);

        //Azhaziq - 22/5/2018: Fix issue of not saving image when image was the first node
        if(rtePaneBody[0].innerText != '' || (rtePaneBody[0].firstChild && rtePaneBody[0].firstChild.nodeName)) {
            value = rtePaneBody[0].innerHTML;
        }

        //Azhaziq - 24/8/18: Only do storing when focus is on rte-pane-body-view
        if(document.activeElement === rtePaneBody[0]) {

            if(rteVariable.history.getValues().undo.length > 0) {

                if(!TypeChecker.isUndefined(evt) && !evt.ctrlKey && evt.keyCode !== 90) {

                    setTimeout( () => {
                        //avoid duplicate data - check current html value with last element in undo history
                        if(UndoRedoUtils.isDifferWithCurrentHTMLValue(rteVariable, 'body')) {
                            UndoRedoUtils.storeUndoRedoData(rteVariable, 'body', value, rtePaneBody[0].childNodes);
                        }
                    });

                }
               
            }
          
        }
        
        return value;

    },
    traceTitle(elem, rteVariable, evt) {
        
        let title = null;

        let rtePaneHeader = elem.getElementsByClassName('rte-pane-header');

        if(rtePaneHeader[0].firstChild.value != '') {
            title = rtePaneHeader[0].firstChild.value;
        }
                     
        if(rteVariable.history.getValues().undo.length > 0) {

            if(!TypeChecker.isUndefined(evt) && !evt.ctrlKey && evt.keyCode !== 90) {

                setTimeout( () => {
                    //avoid duplicate data - check current html value with last element in undo history
                    if(UndoRedoUtils.isDifferWithCurrentHTMLValue(rteVariable)) {
                        UndoRedoUtils.storeUndoRedoData(rteVariable, 'title', title);
                    }
                });

            }

        }
            
        return title;

    },
    cursorMove(containerElem,rteVariable,evt) {

        //https://codepen.io/neoux/pen/OVzMor - Inspired by this sample
        var selectedObj = document.getSelection();

        _traverseNode(containerElem,selectedObj.anchorNode,0, rteVariable,false,false);

        CustomTableEvents.traceCurrentFocusOnTableData(rteVariable);
    
    },
    shortcut(containerElem,rteVariable,evt) {

        var selectedObj = window.getSelection();

        //prevent any execution when cursor pointer at class 'rte-table-container' in between table action bar container and table container
        if(selectedObj.anchorNode.className === 'rte-table-container') {
            evt.preventDefault();
            evt.stopPropagation();
            return 0;
        }

        //allow user to use Arrow (Right, Left, Up, Down) or Tab inside Cell to move
        if(selectedObj.focusNode.nodeName === 'TD' || selectedObj.focusNode.nodeName === 'TR') {

            CustomTableEvents.shortcutOnTable(evt, selectedObj, rteVariable);

        } else if(selectedObj.focusNode.nodeName === '#text') {

            function _findCorrectNodeName(node, flag) {

                if(node.nodeName === 'TD' || node.nodeName === 'TR') {
                    flag = true;
                }

                return (node.nodeName !== 'DIV') ? _findCorrectNodeName(node.parentNode, flag) : flag;
                  
            }

            let isAllowed = _findCorrectNodeName(selectedObj.focusNode, false);

            (isAllowed) ?  CustomTableEvents.shortcutOnTable(evt, selectedObj, rteVariable) : null;

        }

        //Press Ctrl + anything
        if(evt.ctrlKey) {

            switch(evt.keyCode) {

                case 66: //bold (ctrl + b)
                    var buttonElem = containerElem.getElementsByClassName(`rte-action-btn-bold`);
                    Button.toggleButtonColor(buttonElem[0]);
                    break;
    
                case 85: //underline (ctrl + u)
                    var buttonElem = containerElem.getElementsByClassName(`rte-action-btn-underline`);
                    Button.toggleButtonColor(buttonElem[0]);
                    break;
    
                case 73: //italic (ctrl + i)
                    var buttonElem = containerElem.getElementsByClassName(`rte-action-btn-italic`);
                    Button.toggleButtonColor(buttonElem[0]);
                    break;
    
                case 69: //justifyCenter (ctrl + e)
                    evt.preventDefault();
                    var buttonJustifyCenterDetails = Utils.getActionTypeDetails('justifyCenter');
                    Actions.executeAction(buttonJustifyCenterDetails);
                    Button.toggleTextAlign(containerElem, buttonJustifyCenterDetails.name);
                    break;
    
                case 76: //justifyLeft (ctrl + l)
                    evt.preventDefault();
                    var buttonJustifyLeftDetails = Utils.getActionTypeDetails('justifyLeft');
                    Actions.executeAction(buttonJustifyLeftDetails);
                    Button.toggleTextAlign(containerElem, buttonJustifyLeftDetails.name);
                    break;
    
                case 82: //justifyRight (ctrl + r)
                    evt.preventDefault();
                    var buttonJustifyRightDetails = Utils.getActionTypeDetails('justifyRight');
                    Actions.executeAction(buttonJustifyRightDetails);
                    Button.toggleTextAlign(containerElem, buttonJustifyRightDetails.name);
                    break;
    
                case 90: //undo (ctrl + z)
                    evt.preventDefault();
                    evt.stopPropagation();

                    if(rteVariable.history.getValues().undo.length > 1) {
                        rteVariable.history.undo();
                        UndoRedoUtils.setCaretForHistoryData(rteVariable);
                    }
                    
                    break;
    
                case 89: //redo (ctrl + y)
                    evt.preventDefault();
                    evt.stopPropagation();

                    if(rteVariable.history.getValues().redo.length > 0) {
                        rteVariable.history.redo();
                        UndoRedoUtils.setCaretForHistoryData(rteVariable);
                    }
                   
                    break;
    
            }

        }

        //Press Shirt + anything
        if(evt.shiftKey) {

            switch(evt.keyCode) {

                case 9: //remove ul/ol (shift + tab)
                    let listType = selectedObj.anchorNode.parentNode.parentNode.localName;
                    
                    if(listType === 'ul') {
                        document.execCommand('insertUnorderedList',false,null);
                    } else if(listType === 'ol'){
                        document.execCommand('insertOrderedList',false,null);
                    }

                    break;

            }

        }

        //Press anything without (Ctrl + any) or (Shift + any)
        if(!evt.shiftKey && !evt.ctrlKey) {

            switch(evt.keyCode) {

                case 37: //arrowLeft
                case 38: //arrowUp
                case 39: //arrowRight
                case 40: //arrowDown
                    setTimeout( () => { 
                        _traverseNode(containerElem,selectedObj.anchorNode,0, rteVariable,false,false);
                    });
    
                    break;
    
                case 8: //backspace
                    setTimeout( () => {
    
                        _traverseNode(containerElem,selectedObj.anchorNode,0, rteVariable,false,false);
    
                        let rteCustomTable = document.getElementsByClassName('rte-table-container');
    
                        //remove rte-table-container element when removing table/tables using (Shift + left/right and backspace)
                        if(rteCustomTable.length > 0) {
    
                            for(let obj of rteCustomTable) {
    
                                if(obj.innerHTML === '<br>') {
                                    obj.remove();
                                }
    
                            }
    
                        }
                        
                        let rtePaneBodyView = containerElem.getElementsByClassName('rte-pane-body-view'),
                            emptyTableInner = `<div class="rte-table-container" style="width: 100%; overflow: auto;"></div><div><br></div>`,
                            newBreakLine = `<p><br></p>`;
                        
                        //Set innerHTML to null when 
                        // 1. Ctrl + All (All element is highlighted)
                        // 2. and then press 'Backspace' 
                        if(rtePaneBodyView[0].innerHTML === '<br>' || rtePaneBodyView[0].innerHTML === emptyTableInner || rtePaneBodyView[0].innerHTML === newBreakLine) {
                            rtePaneBodyView[0].innerHTML = null;
                        }
    
                    });
                    
                    break;
                    
            }
            
        }
        
    },
    clearAllBtn(containerElem,evt){
        _clearAllBtn(containerElem,evt)
    },
    resetAllDD(rteVariable,evt){
        _resetAllDD(rteVariable);
    },
    //TODOS: Process paste value
    paste(containerElem,localVariable,evt){

        let rtePaneBody = containerElem.getElementsByClassName('rte-pane-body-view');
        
        setTimeout(()=>{
            Formatter.formatTable(rtePaneBody[0]);
            this.trace(containerElem,localVariable);
        })
        // evt.stopPropagation();
        // evt.preventDefault();

        // let pastedData;

        // if(evt && evt.clipboardData && evt.clipboardData.types && evt.clipboardData.getData){
        //     let types = evt.clipboardData.types;

        //     if (((types instanceof DOMStringList) && types.contains("text/html")) || (types.indexOf && types.indexOf('text/html') !== -1)) {

        //         // Extract data and pass it to callback
        //         pastedData = evt.clipboardData.getData('text/html');
        //         //processPaste(editableDiv, pastedData);
        //         Formatter.formatPasteData(pastedData);
        //         // Stop the data from actually being pasted
        //         evt.stopPropagation();
        //         evt.preventDefault();
        //         return false;
        //     }
            
        // }
    }
}

function _traverseNode(containerElem, anchorNode, count, rteVariable,isFoundTextAlign,isFoundFontSize) {
    if(count == 0){
        _clearAllBtn(containerElem);
        _resetAllDD(rteVariable);
    }

    switch(anchorNode.localName) {

        case 'b' :
        case 'strong':
            var buttonElem = containerElem.getElementsByClassName(`rte-action-btn-bold`);
            Button.toggleButtonColor(buttonElem[0],true);
            break;

        case 'u': 
            var buttonElem = containerElem.getElementsByClassName(`rte-action-btn-underline`);
            Button.toggleButtonColor(buttonElem[0],true);
            break;

        case 'i':
            var buttonElem = containerElem.getElementsByClassName(`rte-action-btn-italic`);
            Button.toggleButtonColor(buttonElem[0],true);
            break;

        case 'ul':
            var buttonElem = containerElem.getElementsByClassName(`rte-action-btn-uList`);
            Button.toggleButtonColor(buttonElem[0],true);
            break;
            
        case 'ol':
            var buttonElem = containerElem.getElementsByClassName(`rte-action-btn-oList`);
            Button.toggleButtonColor(buttonElem[0],true);
            break;

        case 'font':
            var dropdownObjectFontSize = rteVariable.ddObject.fontSize,
                dropdownObjectFontColor = rteVariable.ddObject.fontColor;

            dropdownObjectFontSize.setSelectedValue('fontSize',document.queryCommandValue('FontSize'));
            dropdownObjectFontColor.setSelectedValue('fontColor',document.queryCommandValue('ForeColor')); 
            break;

        case 'a':
            var buttonElem = containerElem.getElementsByClassName(`rte-action-btn-link`);
            Button.toggleButtonColor(buttonElem[0],true);
            break;

        case 'table':
            var buttonElem = containerElem.getElementsByClassName(`rte-action-btn-table`);
            Button.toggleButtonColor(buttonElem[0],true);
            break;


    }
    
    if(!isFoundTextAlign) {
        //Detect text align 

        if(anchorNode.nodeName == '#text') {

            if(anchorNode.parentNode && anchorNode.parentNode.style) {
                var textAlignValue = anchorNode.parentNode.style.textAlign;
            
                if(textAlignValue != null && textAlignValue != undefined && textAlignValue != '') {
                    isFoundTextAlign = true;
                    Button.toggleTextAlign(containerElem, textAlignValue);
                }
    
            }

        } else {

            if(anchorNode.style) {

                var textAlignValue = anchorNode.style.textAlign;
            
                if(textAlignValue != null && textAlignValue != undefined && textAlignValue != '') {
                    isFoundTextAlign = true;
                    Button.toggleTextAlign(containerElem, textAlignValue);
                }

            }

        }
      
    }

    if (anchorNode.parentNode && anchorNode.localName != "div") {
        _traverseNode(containerElem,anchorNode.parentNode, ++count, rteVariable,isFoundTextAlign,isFoundFontSize);
    }
}

function _clearAllBtn(containerElem,evt) {

    //Azhaziq: 23/3/2018: Only clear when not click rte-action
    var clearAll = true;

    if(evt && evt.relatedTarget && evt.relatedTarget.className.indexOf('rte-action-btn') != -1){
        clearAll = false;
    }

    if(clearAll){

        let rteBarElem = containerElem.getElementsByClassName('rte-text-bar');

        if(rteBarElem.length > 0){
            let rteBarElemChild = rteBarElem[0].getElementsByTagName('*');

            for(var i = 0; i < rteBarElemChild.length; i++){
    
                if(rteBarElemChild[i].className.indexOf('rte-action-btn') != -1){
                    Button.toggleButtonColor(rteBarElemChild[i],false);
                }
            }
        }
    }
}

function _resetAllDD(rteVariable){

    var dropdownObjectFontSize = rteVariable.ddObject.fontSize,
    dropdownObjectFontColor = rteVariable.ddObject.fontColor;
    
    dropdownObjectFontSize.setSelectedValue('fontSize',document.queryCommandValue('FontSize'));
    dropdownObjectFontColor.setSelectedValue('fontColor',document.queryCommandValue('ForeColor'));  
}