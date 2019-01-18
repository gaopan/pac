'use strict'
import Utils from './utils';
import Actions from './actions';
import CustomModal from './custom-modal';
import Events from './events';
import CustomTable from './components/custom-table/custom-table';
import CustomTableUtils from './components/custom-table/custom-table-utils';

export default {
    create(containerElem,type,localVariable){

        var buttonTypeDetails = Utils.getActionTypeDetails(type);

        let button = document.createElement("button");
        button.className = `rte-action-btn-${buttonTypeDetails.name}`;
        button.title = buttonTypeDetails.title;
        
        if(buttonTypeDetails.name === 'justifyLeft') {
            _toggleButtonColor(button, true);
        }

        let icon = document.createElement("i");
        icon.className = `${buttonTypeDetails.icon}`
        
        button.appendChild(icon);

        setTimeout(()=>{
            _setupEventListener(containerElem,buttonTypeDetails,localVariable);
        },0);

        return button;
    },
    toggleButtonColor(buttomElem,active) {
        if(buttomElem){
            _toggleButtonColor(buttomElem,active);
        }
    },
    toggleTextAlign(containerElem, type) {
        _toggleTextAlign(containerElem, type);
    }
}

function _toggleButtonColor(buttomElem,active) {
    if(active == undefined){
        buttomElem.classList.toggle("active");    
    } else {
        buttomElem.style['background-color'] = active ? 
            buttomElem.classList.add('active') :
            buttomElem.classList.remove('active');
    }
}

function _toggleTextAlign(containerElem, type) {

    var buttonElemCenter = containerElem.getElementsByClassName(`rte-action-btn-justifyCenter`);
    var buttonElemLeft = containerElem.getElementsByClassName(`rte-action-btn-justifyLeft`);
    var buttonElemRight = containerElem.getElementsByClassName(`rte-action-btn-justifyRight`);

    switch(type) {

        case 'center':
        case 'justifyCenter' :
            _toggleButtonColor(buttonElemCenter[0],true);
            _toggleButtonColor(buttonElemLeft[0],false);
            _toggleButtonColor(buttonElemRight[0],false);
            break;

        case 'left':
        case 'justifyLeft':
            _toggleButtonColor(buttonElemCenter[0],false);
            _toggleButtonColor(buttonElemLeft[0],true);
            _toggleButtonColor(buttonElemRight[0],false);
            break;
        
        case 'right':
        case 'justifyRight':
            _toggleButtonColor(buttonElemCenter[0],false);
            _toggleButtonColor(buttonElemLeft[0],false);
            _toggleButtonColor(buttonElemRight[0],true);
            break;

        default:
            _toggleButtonColor(buttonElemCenter[0],false);
            _toggleButtonColor(buttonElemLeft[0],false);
            _toggleButtonColor(buttonElemRight[0],false);

    }

}

function _clickButton(evt,containerElem,buttomElem,panelElem,buttonTypeDetails,localVariable){
    
    var buttonName = buttonTypeDetails.name;
    var buttonJustifyLeftDetails = Utils.getActionTypeDetails('justifyLeft');
    var isAlignElemActive = false;

    //Set sibling panel to be focused
    //This is to apply the bold to sibling panel
    var panelBodyElem = panelElem.getElementsByClassName('rte-pane-body-view');
    panelBodyElem[0].focus();

    switch(buttonName) {

        case 'justifyCenter':
        case 'justifyLeft':
        case 'justifyRight':

            var justifyTypeName = buttonName;

            if(buttomElem.classList.contains('active')) {
                isAlignElemActive = true;
                justifyTypeName = buttonJustifyLeftDetails.name;
            }

            _toggleTextAlign(containerElem, justifyTypeName);

            (isAlignElemActive) ? Actions.executeAction(buttonJustifyLeftDetails) : 
                    Actions.executeAction(buttonTypeDetails);

            break;

        case 'link':
            
            //call to saveCaret
            //https://codepen.io/kmessner/pen/oXgRrG
            var caretLastPos = Utils.getCurrentCaretPos();

            var cbLinkFn = function(link) {

                panelBodyElem[0].focus();

                Utils.restoreCurrentCaretPos(caretLastPos.focusNode,caretLastPos.focusOffset);

                if(link != null){
                    Actions.executeAction(buttonTypeDetails, link);
                }

                localVariable.value = Events.trace(panelElem, localVariable);

            }

            var config = {
                type: 'link',
                titleHeader: '插入链接',
            }

            var customModal = new CustomModal(config,cbLinkFn);
            customModal.create();

            break;
        
        case 'image':
            
            //call to saveCaret
            //https://codepen.io/kmessner/pen/oXgRrG
            var caretLastPos = Utils.getCurrentCaretPos();

            var cbImageFn = function(imageLink){

                panelBodyElem[0].focus();

                Utils.restoreCurrentCaretPos(caretLastPos.focusNode,caretLastPos.focusOffset);

                if(imageLink != null){
                    Actions.executeAction(buttonTypeDetails, imageLink);
                }

                localVariable.value = Events.trace(panelElem, localVariable);
            }

            var config = {
                type: 'image',
                titleHeader: '插入图片',
            }

            var customModal = new CustomModal(config,cbImageFn);
            customModal.create();

            break;
        case 'table':
            _createNewTable(localVariable);
            break;
        case 'signature':
            Actions.addSignature(panelBodyElem[0],localVariable);
            break;
        default:
            _toggleButtonColor(buttomElem);
            Actions.executeAction(buttonTypeDetails);

    }

    localVariable.value = Events.trace(panelElem, localVariable);

}

function _setupEventListener(containerElem,buttonTypeDetails,localVariable){
    var panelElem = document.getElementById(`${localVariable.uuid}-rte-edit-pane`);
    var buttonElem = containerElem.getElementsByClassName(`rte-action-btn-${buttonTypeDetails.name}`);
    buttonElem[0].addEventListener('click',(e) => { _clickButton(e,containerElem,buttonElem[0],panelElem,buttonTypeDetails,localVariable) }, false);
}

/**
 * The structure of each new table (created inside rte-pane-body-view DIV)
 * <div><br></br></div>
 * <div class="rte-table-container">
 *      <div class="rte-table-action-bar"> Action (add/remove/delete) for each table </div>
 *      <div class="rte-custom-table"> Default 2x2 (row x column) </div>
 * </div>
 * <div><br></br></div>
 */
function _createNewTable(localVariable) {

    var table = new CustomTable(),
        tableElem = table.create(localVariable),
        caretLastPos = Utils.getCurrentCaretPos();

    function isValidNodeName(nodeName) {

        let validList = ['DIV','B', 'U','STRONG', 'I', 'FONT', 'LI','P'];

        return (validList.includes(nodeName)) ? true : false;

    }
    
    if(isValidNodeName(caretLastPos.focusNode.nodeName)) {

        let breakLineContainerElem = document.createElement('p');

        breakLineContainerElem.appendChild(document.createElement('br'));

        if(caretLastPos.focusNode.className) {

            //When inside rte-pane-body-view don't contains any HTML means, innerHTML is null
            caretLastPos.focusNode.appendChild(breakLineContainerElem);
            caretLastPos.focusNode.appendChild(tableElem);
            caretLastPos.focusNode.appendChild(document.createElement('p')).appendChild(document.createElement('br'));

        } else {

            let insertNewTable = caretLastPos.focusNode.parentNode.insertBefore(tableElem, caretLastPos.focusNode.nextSibling);
            insertNewTable.parentNode.insertBefore(breakLineContainerElem, insertNewTable.nextSibling);

        }

        //Logic: Before create new table (at the new line) we need to remove styling element (if existed)
        if(caretLastPos.focusNode.nodeName.toLowerCase() !== 'p' && caretLastPos.focusNode.nodeName.toLowerCase() !== 'div') {

            caretLastPos.focusNode.remove();
            
            function removeStylingTag(node, childNodes) {
                
                if(node.className !== 'rte-pane-body-view') {
        
                    if(node.parentNode) {
                        node.parentNode.id ='temp-remove-styling';
                        removeStylingTag(node.parentNode, childNodes);
                    }
                    
                } else {
                    
                    let tempRemoveStylingElem = null;

                    for(let childNode of node.childNodes) {
                        if(childNode.id === 'temp-remove-styling') {
                            tempRemoveStylingElem = childNode;
                        }
                    }
                    
                    let rteTableContainerElem = tempRemoveStylingElem.parentNode.insertBefore(childNodes[0], tempRemoveStylingElem.nextSibling);

                    rteTableContainerElem.parentNode.insertBefore(breakLineContainerElem, rteTableContainerElem.nextSibling);

                    tempRemoveStylingElem.remove();
                    
                }

            }
            
            tableElem.parentNode.id = 'temp-remove-styling';
            removeStylingTag(tableElem.parentNode, tableElem.parentNode.childNodes);

        }

        CustomTableUtils.setCaretAtFirstCell(tableElem.childNodes[1].childNodes[0].childNodes[0].childNodes[0], true);
        
    } else {

        // alert('Please enter to a new line to add table');
        console.warn('Please enter to a new line to add table');
    
    }

}