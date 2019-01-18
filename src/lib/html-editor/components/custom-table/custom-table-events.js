import TypeChecker from '../../utils/type-checker-utils';
import ActionBarEvents from './action-bar-events';
import Utils from '../../utils'

export default {

    traceCurrentFocusOnTableData(rteVariable) {

        setTimeout( () => {

            function fnSetToNull() {
    
                removeEventDragover();
                rteVariable.focusOnTable = Utils.getFocusOnTableDataModel();
    
            }
    
            function addEventDragover() {
    
                document.addEventListener("dragover",  event => {
                    event.stopPropagation();
                    event.preventDefault();
                }, false);
    
            }
    
            function removeEventDragover() {
    
                document.removeEventListener("dragover", event => {}, false);
    
            }
    
            function _getNode(node, type) {
    
                if(node.localName && node.localName === type) {
                    return node;
                }
            
                //call recursive function back
                if(node.parentNode && node.localName !== 'DIV') {
                    //https://stackoverflow.com/questions/33513358/how-to-save-the-return-value-of-a-recursive-function-in-a-variable-javascript
                    return _getNode(node.parentNode, type);
                } 
            }
    
            let selectedObj = window.getSelection();
    
            if(!TypeChecker.isNull(selectedObj.anchorNode) && !TypeChecker.isUndefined(selectedObj.anchorNode)) {
    
                let tableElem = _getNode(selectedObj.anchorNode, 'table'),
                    rowElem = _getNode(selectedObj.anchorNode, 'tr'),
                    columnElem = _getNode(selectedObj.anchorNode, 'td');
                
                if(!TypeChecker.isUndefined(rowElem) && !TypeChecker.isUndefined(columnElem) && !TypeChecker.isUndefined(tableElem)) {
                    
                    rteVariable.focusOnTable.tableId = tableElem.id;
                    rteVariable.focusOnTable.rowId = rowElem.id;
                    rteVariable.focusOnTable.columnId = columnElem.id;
                    rteVariable.focusOnTable.tableElem = tableElem;
                    rteVariable.focusOnTable.parentTableElem = document.getElementById('rte-table-container_' + tableElem.id);
    
                    //Adib - 5.9.2018: allow user to use Arrow (Right, Left, Up, Down) or Tab inside Cell to move
                    rteVariable.focusOnTable.rowIndex = rowElem.sectionRowIndex;
                    rteVariable.focusOnTable.columnIndex = columnElem.cellIndex;
    
                    addEventDragover();
    
                } else {
    
                    if(!TypeChecker.isUndefined(rowElem)) {
                        //create new tr element
                        rteVariable.focusOnTable.tableId = tableElem.id;
                        rteVariable.focusOnTable.rowId = rowElem.id;
                        rteVariable.focusOnTable.columnId = rowElem.childNodes[0].id;
                        rteVariable.focusOnTable.tableElem = tableElem;
                        rteVariable.focusOnTable.parentTableElem = document.getElementById('rte-table-container_' + tableElem.id);
    
                        //Adib - 5.9.2018: allow user to use Arrow (Right, Left, Up, Down) or Tab inside Cell to move
                        rteVariable.focusOnTable.rowIndex = rowElem.sectionRowIndex;
                        rteVariable.focusOnTable.columnIndex = rowElem.childNodes[0].cellIndex;
    
                        addEventDragover();
    
                    } else {
    
                        fnSetToNull();
                        
                    }
                    
                }
    
            } else {
    
                fnSetToNull();
    
            }
    
            _enableActionBarTable(rteVariable);
            
        });

    },
    shortcutOnTable(evt, selectedObj, rteVariable) {
        //allow user to use Arrow (Right, Left, Up, Down) or Tab inside Cell to move

        function prevent() {
            //prevent and stop the default execution
            evt.preventDefault();
            evt.stopPropagation();
            return true;
        }

        if(!TypeChecker.isNull(rteVariable.focusOnTable.tableId)) {

            let nodeName = selectedObj.focusNode.nodeName,
                textPosition = selectedObj.focusOffset,
                focusNodeLength = selectedObj.focusNode.length;
    
            let currentColomnIndex = rteVariable.focusOnTable.columnIndex,
                currentRowIndex = rteVariable.focusOnTable.rowIndex,
                tableId = rteVariable.focusOnTable.tableId,
                totalRows = document.getElementById(`${tableId}`).rows.length - 1,
                totalColumns = document.getElementById(`${tableId}`).rows[0].cells.length - 1;

            function moveToLeftCell() {

                let nextElem = undefined;

                //IF === 0 move to above row (last column) ELSE move to previous cell (left at same row)
                if(currentColomnIndex === 0) {

                    if(currentRowIndex !== 0) {
                        nextElem = document.getElementById(`${tableId}`).rows[currentRowIndex - 1].cells[totalColumns];
                        Utils.restoreCurrentCaretPos(nextElem, 0);
                    }
                    
                } else {
                    nextElem = document.getElementById(`${tableId}`).rows[currentRowIndex].cells[currentColomnIndex - 1];
                    Utils.restoreCurrentCaretPos(nextElem, 0);
                }
                
                prevent();

            }

            function moveToRightCell() {

                let nextElem = undefined;

                //IF === last column move to below row (first column) ELSE move to next cell (right at same row)
                if(currentColomnIndex === totalColumns) {

                    if(currentRowIndex !== totalRows) {
                        nextElem = document.getElementById(`${tableId}`).rows[currentRowIndex + 1].cells[0];
                        Utils.restoreCurrentCaretPos(nextElem, 0);
                    } 
                    
                } else {
                    nextElem = document.getElementById(`${tableId}`).rows[currentRowIndex].cells[currentColomnIndex + 1];
                    Utils.restoreCurrentCaretPos(nextElem, 0);
                }

                prevent();

            }

            function emptyAtFirstCell() {

                if(nodeName === 'TD' && currentColomnIndex === 0 && currentRowIndex === 0) {
                    prevent();
                }

                if(nodeName === 'TR' && currentColomnIndex === 0 && currentRowIndex === 0) {
                    prevent();
                }
            }

            function emptyAtLastCell() {
                
                if(nodeName === 'TD' && currentColomnIndex === totalColumns && currentRowIndex === totalRows) {
                    prevent();
                }

                if(nodeName === 'TR' && currentColomnIndex === totalColumns && currentRowIndex === totalRows) {
                    prevent();
                }

            }

            if(!evt.shiftKey && !evt.ctrlKey) {

                switch(evt.keyCode) {

                    case 37: //arrowLeft

                        //Contains text inside cell
                        if(nodeName === '#text' && textPosition === 0) {
                            moveToLeftCell();
                        }

                        emptyAtFirstCell();

                        break;
                        
                    case 38: //arrowUp
                        
                        if(currentRowIndex !== 0) {
                            let nextElem = document.getElementById(`${tableId}`).rows[currentRowIndex - 1].cells[currentColomnIndex];
                            Utils.restoreCurrentCaretPos(nextElem, 0);
                        }

                        prevent();
                        
                        break;

                    case 39: //arrowRight

                        //Contains text inside cell
                        if(nodeName === '#text' && focusNodeLength === textPosition) {
                            moveToRightCell();
                        }

                        emptyAtLastCell();
                        
                        break;

                    case 40: //arrowDown

                        if(currentRowIndex !== totalRows) {
                            let nextElem = document.getElementById(`${tableId}`).rows[currentRowIndex + 1].cells[currentColomnIndex];
                            Utils.restoreCurrentCaretPos(nextElem, 0);
                        }

                        prevent();

                        break;

                    case 9: //tab

                        //Prevent at last cell
                        (currentColomnIndex === totalColumns && currentRowIndex === totalRows) ? prevent() : moveToRightCell();

                }

            }

            if(evt.shiftKey && evt.keyCode === 9) {
                //Prevent at first cell
                (currentColomnIndex === 0 && currentRowIndex === 0) ? prevent() : moveToLeftCell();
            }
            
        } else {

            //Occured when no interval on shortcut (ctrl Z or ctrl Y)
            console.warn('No table Id - checking on shortcutOnTable');
            prevent();

        }

    }

}

function _enableActionBarTable(rteVariable) {

    function disabledButton(node, flag) {

        let ulNodes = node.childNodes[0].childNodes;

        for(let ul of ulNodes) {

            ul.children[0].disabled = flag;

            let actionClassName = ul.childNodes[0].childNodes[0].className;

            if(!flag) {
                
                if(!ul.childNodes[0].attachedEvt) {

                    //add custom key object: attachedEvt - as indicator either eventListener is attached or not
                    ul.childNodes[0].attachedEvt = true;

                    ul.childNodes[0].addEventListener( "click", event => {
                        ActionBarEvents.onClickEvt(rteVariable, actionClassName);
                    });

                    ul.childNodes[0].addEventListener( "mouseover", event => {
                        ActionBarEvents.onMouseOverEvt(ul.childNodes[0], rteVariable, actionClassName);
                    });

                    ul.childNodes[0].addEventListener( "mouseout", event => {
                        ActionBarEvents.onMouseOutEvt(ul.childNodes[0], rteVariable);
                    });

                }
                
            } else {
                ul.childNodes[0].removeEventListener("click", event => {});
                ul.childNodes[0].removeEventListener("mouseover", event => {});
                ul.childNodes[0].removeEventListener("mouseout", event => {});

            }
            
        }

    } 

    let rteTableActionBar = document.getElementsByClassName('rte-table-action-bar');

    //Have at least one table in UI
    if(rteTableActionBar.length > 0) {

        for(let action of rteTableActionBar) {

            if(!TypeChecker.isNull(rteVariable.focusOnTable.tableId)) {

                //focus on table - enabled button
                if(action.id === `${rteVariable.focusOnTable.tableId}-rte-table-action-bar`) {
                    disabledButton(action, false);
                } else {
                    disabledButton(action, true);
                }

            } else {

                disabledButton(action, true);

            }
        
        }

    }

}