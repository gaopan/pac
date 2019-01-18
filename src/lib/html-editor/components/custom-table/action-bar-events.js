import CustomTableUtils from './custom-table-utils';
import Utils from '../../utils'
import Events from '../../events'

export default {
    
    onClickEvt(rteVariable, actionClassName) {
        
        let tableBody = _getTableBody(rteVariable);
        let selectedIndex = _getSelectedIndex(tableBody, rteVariable);

        switch(_getActionName(actionClassName)) {

            case 'addTop':
                _addRow(tableBody, selectedIndex.row, 'addTop')
                break;

            case 'addBottom':
                _addRow(tableBody, selectedIndex.row, 'addBottom');
                break;

            case 'removeRow':
                _removeTable(tableBody, 'row', selectedIndex.row, rteVariable);
                break;

            case 'removeTable':
                _removeTable(rteVariable, 'all', null, null);
                break;
            
            case 'addRight':
                _addColumn(tableBody, selectedIndex.column, 'right');
                break;

            case 'addLeft':
                _addColumn(tableBody, selectedIndex.column, 'left');
                break;

            case 'removeCol':
                _removeTable(tableBody, 'column', selectedIndex.column, rteVariable);
                break;              

        }
        
        _removeTableBorder(tableBody);

        rteVariable.value = Events.trace(document.getElementById(`${rteVariable.uuid}-rte-edit-pane`), rteVariable);

    },
    onMouseOverEvt(targetedElem, rteVariable, actionClassName) {
        
        let tableBody = _getTableBody(rteVariable);
        let selectedIndex = _getSelectedIndex(tableBody, rteVariable);

        let dxcYellow = '#ffed00';

        switch(_getActionName(actionClassName)) {

            case 'addTop':
                targetedElem.style = `background-color:${dxcYellow} `;
                _highlightRow(tableBody, selectedIndex.row, 'top');
                break;

            case 'addBottom':
                targetedElem.style = `background-color:${dxcYellow} `;
                _highlightRow(tableBody, selectedIndex.row, 'bottom');
                break;

            case 'removeRow':
                targetedElem.style = "background-color : red";
                _highlightRowRemove(tableBody, selectedIndex.row);
                break;

            case 'removeTable':
                targetedElem.style = "background-color : red";
                _hightlightTableBorder(tableBody);
                break;

            case 'addRight':
                targetedElem.style = `background-color:${dxcYellow} `;
                _highlightTableColumn(tableBody, selectedIndex.column, 'right');
                break;
            
            case 'addLeft':
                targetedElem.style = `background-color:${dxcYellow} `;
                _highlightTableColumn(tableBody, selectedIndex.column, 'left');
                break;

            case 'removeCol':
                targetedElem.style = "background-color : red";
                _highlightColumnRemove(tableBody, selectedIndex.column);
                break;

        }

    },
    onMouseOutEvt(targetedElem, rteVariable) {

        targetedElem.style = "background-color: transparent";
        
        _removeTableBorder(_getTableBody(rteVariable));

    }

}

function _getTableBody(rteVariable) {
    return rteVariable.focusOnTable.tableElem.childNodes[0];
}

function _getSelectedIndex(tableBody, rteVariable) {

    let selectedIndex = {
        row: null,
        column: null
    }

    for(let index in tableBody.childNodes) {

        if(tableBody.childNodes[index].id === rteVariable.focusOnTable.rowId) {
            selectedIndex.row = index;
        }

        for(let index2 in tableBody.childNodes[index].childNodes) {

            if(tableBody.childNodes[index].childNodes[index2].id === rteVariable.focusOnTable.columnId) {
                selectedIndex.column = index2;
            }
        }

    }

    return selectedIndex;

}

function _getActionName(actionClassName) {

    let targetedActionBar = CustomTableUtils.getTableActionDetails().filter( config => config.icon === actionClassName);

    return targetedActionBar[0].action;

}

function _removeTable(data, type, idx, rteVariable) {
    
    let row = null, tableContainer = null;

    if (type === 'all') {

        tableContainer = data.focusOnTable.parentTableElem.remove();

    } else if (type === 'row') {

        if(data.childNodes.length > 1) {
            data.removeChild(data.childNodes[idx]);

            row = data.childNodes[0];

            CustomTableUtils.setCaretAtFirstCell(row, true);

        } else {

            tableContainer = rteVariable.focusOnTable.parentTableElem.remove();

        }
        
    } else if (type === 'column') {

        for(var i = 0; i < data.childNodes.length; i++) {

            if(data.childNodes[i].childNodes.length > 1) {

                data.childNodes[i].removeChild(data.childNodes[i].childNodes[idx]);

                row = data.childNodes[0];

                CustomTableUtils.setCaretAtFirstCell(row, true);

            } else {

                tableContainer = rteVariable.focusOnTable.parentTableElem.remove();
            }
        }
    }

}

function _addRow (tableBody, selectedRowIndex, type) {

    let newRowElement = document.createElement('tr');
    newRowElement.id = `row_${Utils.generateUniqueId()}`;

    for(var i = 0; i < tableBody.childNodes[0].childNodes.length; i++) {

        let column = document.createElement('td');

        column.id = `column_${Utils.generateUniqueId()}`;

        newRowElement.appendChild(column);
    }

    let elem = null;

    if(type === 'addTop') {

        tableBody.insertBefore(newRowElement, tableBody.childNodes[selectedRowIndex]);

        elem = tableBody.childNodes[selectedRowIndex];

    } else if (type === 'addBottom') {

        tableBody.insertBefore(newRowElement, tableBody.childNodes[selectedRowIndex].nextSibling);

        elem = tableBody.childNodes[selectedRowIndex].nextSibling;

    }

    CustomTableUtils.setCaretAtFirstCell(elem, true);

}

function _addColumn (tableBody, selectedColumnIndex, type) {

    let newCol = null;

    for(var i = 0; i < tableBody.childNodes.length; i++) {

        let newTd = document.createElement('td');

        newTd.id = `column_${Utils.generateUniqueId()}`;

        if(type === 'left') {

            tableBody.childNodes[i].insertBefore(newTd, tableBody.childNodes[i].childNodes[selectedColumnIndex]);

            newCol = tableBody.childNodes[0].childNodes[selectedColumnIndex];

            CustomTableUtils.setCaretAtFirstCell(newCol, true);

        } else if ('right') {

            tableBody.childNodes[i].insertBefore(newTd, tableBody.childNodes[i].childNodes[selectedColumnIndex].nextSibling);

            newCol = tableBody.childNodes[0].childNodes[selectedColumnIndex].nextSibling;

            CustomTableUtils.setCaretAtFirstCell(newCol, true);

        }
        
    }

}

function _highlightTableColumn(tableBody, selectedColumnIdx, type) {
    
    for(let i = 0; i < tableBody.childNodes.length; i++) {

        if(type === 'right') {

            tableBody.childNodes[i].childNodes[selectedColumnIdx].className = "colRight";
        
        } else if (type === 'left') {

            if(selectedColumnIdx == 0) {
                             
                tableBody.childNodes[i].childNodes[selectedColumnIdx].className = "colLeft";

            } else {
                
                tableBody.childNodes[i].childNodes[selectedColumnIdx].previousSibling.className = "colRight";

            }

            
        }
    }

}

function _highlightColumnRemove(tableBody, selectedColumnIdx) {

    for(let i = 0; i < tableBody.childNodes.length; i++) {

        if(i == 0) {

            if(selectedColumnIdx == 0) {

                tableBody.childNodes[i].childNodes[selectedColumnIdx].className = "manyTrOneTdTop";

            } else {

                tableBody.childNodes[i].childNodes[selectedColumnIdx].className = "topRight";
                tableBody.childNodes[i].childNodes[selectedColumnIdx].previousSibling.className = "right";

            }

        } else if (i == tableBody.childNodes.length - 1) {

            if(selectedColumnIdx == 0) {

                tableBody.childNodes[i].childNodes[selectedColumnIdx].className = "bottomLeftRight";

            } else {

                tableBody.childNodes[i].childNodes[selectedColumnIdx].className = "bottomRight";
                tableBody.childNodes[i].childNodes[selectedColumnIdx].previousSibling.className = "right";

            }

        } else {

            if(selectedColumnIdx == 0) {

                tableBody.childNodes[i].childNodes[selectedColumnIdx].className = "leftRight";
            } else {

                tableBody.childNodes[i].childNodes[selectedColumnIdx].className = "right";
                tableBody.childNodes[i].childNodes[selectedColumnIdx].previousSibling.className = "right";

            }

        }

        if(tableBody.childNodes.length == 1) {

            tableBody.childNodes[i].childNodes[selectedColumnIdx].className = "oneTrOneTd";

        }
        

    }

}

function _hightlightTableBorder(tableBody) {

    for(let i = 0; i < tableBody.childNodes.length; i++) {

        for(let j = 0; j < tableBody.childNodes[i].childNodes.length; j++) {

            if(i == 0) {

                if(j == 0) {
                    
                    if(tableBody.childNodes.length == 1 && tableBody.childNodes[i].childNodes.length == 1) {

                        tableBody.childNodes[i].childNodes[j].className = "oneTrOneTd";
                    
                    } else if (tableBody.childNodes.length != 1 && tableBody.childNodes[i].childNodes.length == 1) {

                        tableBody.childNodes[i].childNodes[j].className = "manyTrOneTdTop";
                
                    } else if (tableBody.childNodes.length == 1 && tableBody.childNodes[i].childNodes.length !== 1 ) {

                        tableBody.childNodes[i].childNodes[j].className = "oneTrManyTdLeft";

                    } else {

                        tableBody.childNodes[i].childNodes[j].className = "topLeft";
                    }

                } else if (j == tableBody.childNodes[i].childNodes.length - 1) {

                    if (tableBody.childNodes.length == 1 && tableBody.childNodes[i].childNodes.length !== 1 ) {

                        tableBody.childNodes[i].childNodes[j].className = "oneTrManyTdRight";

                    } else {

                        tableBody.childNodes[i].childNodes[j].className = "topRight";
                        
                    }

                } else {

                    if (tableBody.childNodes.length == 1 && tableBody.childNodes[i].childNodes.length !== 1 ) {

                        tableBody.childNodes[i].childNodes[j].className = "oneTrManyTdMiddle";

                    } else {

                        tableBody.childNodes[i].childNodes[j].className = "topMiddle";

                    }
                }


            } else if (i == tableBody.childNodes.length - 1) {


                if(j == 0) {

                    if(tableBody.childNodes[i].childNodes.length == 1) {

                        tableBody.childNodes[i].childNodes[j].className = "bottomLeftRight";

                    } else {

                        tableBody.childNodes[i].childNodes[j].className = "bottomLeft";

                    }
                    

                } else if (j == tableBody.childNodes[i].childNodes.length - 1) {

                    tableBody.childNodes[i].childNodes[j].className = "bottomRight";

                } else {

                    tableBody.childNodes[i].childNodes[j].className = "bottomMiddle";
                }

            } else {

                if(j == 0) {

                    if(tableBody.childNodes[i].childNodes.length == 1) {

                        tableBody.childNodes[i].childNodes[j].className = "leftRight";

                    } else {

                        tableBody.childNodes[i].childNodes[j].className = "left";
                    }

                } else if (j == tableBody.childNodes[i].childNodes.length - 1) {

                    tableBody.childNodes[i].childNodes[j].className = "right";

                } 

            }
            
        }
        
    }

}

function _highlightRow(tableBody, selectedIndex, type) {

    for(let i = 0; i < tableBody.childNodes.length; i++) {

        for(let j = 0; j < tableBody.childNodes[i].childNodes.length; j++) {

            if(selectedIndex == 0) {
                
                if(type == 'top'){

                    tableBody.childNodes[selectedIndex].childNodes[j].className = "top";

                } else if (type == 'bottom') {

                    tableBody.childNodes[selectedIndex].childNodes[j].className = "bottom";

                }

            } else if (selectedIndex != 0){
                
                if(type == 'top'){

                    tableBody.childNodes[selectedIndex -1].childNodes[j].className = "bottom";

                } else if(type == 'bottom') {

                    tableBody.childNodes[selectedIndex].childNodes[j].className = "bottom";
                }
                
            }

        }
        
    }

}

function _highlightRowRemove(tableBody, selectedIndex) {

    for(let i = 0; i < tableBody.childNodes.length; i++) {

        for(let j = 0; j < tableBody.childNodes[i].childNodes.length; j++) {

            if(selectedIndex == 0) {
                
                if(j == 0) {

                    tableBody.childNodes[selectedIndex].childNodes[j].className = "oneTrManyTdLeft";

                } else if (j == tableBody.childNodes[i].childNodes.length-1 ) {

                    tableBody.childNodes[selectedIndex].childNodes[j].className = "oneTrManyTdRight";

                } else {

                    tableBody.childNodes[selectedIndex].childNodes[j].className = "oneTrManyTdMiddle";
                    
                }
                
            } else {

                if(j ==0) {

                    tableBody.childNodes[selectedIndex].childNodes[j].className = "bottomLeft"; 
                    tableBody.childNodes[selectedIndex - 1].childNodes[j].className = "bottomMiddle"; 

                } else if (j == tableBody.childNodes[i].childNodes.length-1 ) {

                    tableBody.childNodes[selectedIndex].childNodes[j].className = "bottomRight"; 
                    tableBody.childNodes[selectedIndex - 1].childNodes[j].className = "bottomMiddle"; 

                } else {

                    tableBody.childNodes[selectedIndex - 1].childNodes[j].className = "bottomMiddle"; 
                    tableBody.childNodes[selectedIndex].childNodes[j].className = "bottomMiddle"; 
                }
                
            }

        }

    }

}

function _removeTableBorder(tableBody) {

    for(let i = 0; i < tableBody.childNodes.length; i++) {

        for(let j = 0; j < tableBody.childNodes[i].childNodes.length; j++) {

            let element = tableBody.childNodes[i].childNodes[j],
                stylingClass = tableBody.childNodes[i].childNodes[j].className;

            if(stylingClass != "") {

                element.classList.remove(stylingClass);

            }

        }
    }

}