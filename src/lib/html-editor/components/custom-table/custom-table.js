
import Utils from '../../utils';
import CustomTableUtils from './custom-table-utils'

class CustomTable {

    constructor(){
        this.columnSize = 2;
        this.bodyRow = 2;
        this.uniqueId = Utils.generateUniqueId();
    }

    create(rteVariable,dataIn){
        return _create(this, rteVariable,dataIn);
    }

}

function _create(localVariable, rteVariable,dataIn){
    let tableContainer = document.createElement('div');

    tableContainer.className = "rte-table-container";
    tableContainer.id = "rte-table-container_" + localVariable.uniqueId;
    tableContainer.style.width = "100%";
    tableContainer.style.overflow = "auto";
    tableContainer.style.cursor = "pointer";

    let tableElem = _createTable(localVariable,dataIn),
        actionElem = _createActionBar(localVariable);
    
    tableContainer.appendChild(actionElem);
    tableContainer.appendChild(tableElem);
    
    return tableContainer; 
    
}

function _createActionBar(localVariable) {

    var actionContainer = document.createElement('div'),
        actionTableList = document.createElement("ul"),
        actionBarConfig = CustomTableUtils.getTableActionDetails();

    actionContainer.className = 'rte-table-action-bar';
    actionContainer.contentEditable = false;
    actionContainer.id = `${localVariable.uniqueId}-rte-table-action-bar`;

    for(var i = 0; i < actionBarConfig.length; i++ ) {
        var actionBarListItem = document.createElement("li");

        var actionBox = _generateActionBar(actionBarConfig[i], localVariable);

        actionBarListItem.appendChild(actionBox);
        actionTableList.appendChild(actionBarListItem);
        actionContainer.appendChild(actionTableList);
    }
    
    return actionContainer;

}

function _generateActionBar(actionBarConfig, localVariable) {

    let box = document.createElement('button'),
        icon = document.createElement("i");

    icon.className = actionBarConfig.icon,
    box.title = actionBarConfig.title;
    box.id = `${actionBarConfig.action}_${localVariable.uniqueId}`;
        
    box.appendChild(icon);

    return box;

}

function _createTable(localVariable,dataIn){
    
    let table = document.createElement('table'),
    tbody = document.createElement('tbody');

    table.id = localVariable.uniqueId;
    table.className = "rte-custom-table";
    table.border = "1";
    table.cellPadding = "0";
    table.cellSpacing = "0";

    if(!dataIn){
        //Create TBODY
        for(let i = 0; i < localVariable.bodyRow; i++){
            let rowCol = _generateRowAndColumn(localVariable.columnSize);
            tbody.appendChild(rowCol);
        }
    } else {
        
        let tr = dataIn.getElementsByTagName('tr');
        localVariable.bodyRow = tr.length;

        for(let i = 0; i < localVariable.bodyRow; i++){
            let td = tr[i].getElementsByTagName('td');
            
            if(td.length <= 0) continue;

            let rowCol = _generateRowAndColumn(td.length,td);
            tbody.appendChild(rowCol);
        }
    }


    table.appendChild(tbody);
    return table;

}

function _generateRowAndColumn(colValue,colData){

    let row = document.createElement('tr');
    row.id = `row_${Utils.generateUniqueId()}`;

    for(let i = 0; i < colValue; i++){
        
        let col = document.createElement('td');

        if(colData){
            col.innerHTML = colData[i].innerHTML;
        }

        col.id = `column_${Utils.generateUniqueId()}`;
        
        row.appendChild(col);

    }

    return row;

}

export default CustomTable;