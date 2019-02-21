import { dataURItoBlob } from './lib/base64toBlob';
import TypeChecker from './utils/type-checker-utils';

export default {

    getActionTypeDetails(type){

        let details = {};

        switch(type) {

            case "bold":
                details.name = "bold";
                details.icon = "icon-bold";
                details.title = "粗体 (Ctrl + B)";
                details.element = "button";
                break;
            
            case "underline":
                details.name = "underline";
                details.icon = "icon-underline";
                details.title = "下划线 (Ctrl + U)";
                details.element = "button";
                break;
             
            case "italic":
                details.name = "italic";
                details.icon = "icon-italic";
                details.title = "斜体 (Ctrl + I)";
                details.element = "button";
                break;
            
            case "justifyLeft":
                details.name = "justifyLeft";
                details.icon = "icon-align-left";
                details.title = "左对齐 (Ctrl + L)";
                details.element = "button";
                break;
            
            case "justifyCenter":
                details.name = "justifyCenter";
                details.icon = "icon-align-center";
                details.title = "居中 (Ctrl + E)";
                details.element = "button";
                break;
            
            case "justifyRight":
                details.name = "justifyRight";
                details.icon = "icon-align-right";
                details.title = "右对齐 (Ctrl + R)";
                details.element = "button";
                break;
            
            case "uList":
                details.name = "uList";
                details.icon = "icon-list-ul";
                details.title = "无序列表";
                details.element = "button";
                break;
            
            case "oList":
                details.name = "oList";
                details.icon = "icon-list-ol";
                details.title = "数字列表";
                details.element = "button";
                break;
            
            case "image":
                details.name = "image";
                details.icon = "icon-image";
                details.title = "图片";
                details.element = "button";
                break;
            
            case "link":
                details.name = "link";
                details.icon = "icon-link";
                details.title = "链接";
                details.element = "button";
                break;

            case "fontSize":
                details.name = "fontSize";
                details.icon = "icon-font";
                details.title = "文字大小";
                details.element = "dropdown";
                details.default = 3;
                details.options = [
                    {
                        "id": 1,
                        "value":  "10px"
                    },
                    {
                        "id": 2,
                        "value":  "13px"
                    },
                    {
                        "id": 3,
                        "value":  "16px"
                    },
                    {
                        "id": 4,
                        "value":  "18px"
                    },
                    {
                        "id": 5,
                        "value":  "24px"
                    },
                    {
                        "id": 6,
                        "value":  "32px"
                    },
                    {
                        "id": 7,
                        "value":  "48px"
                    }
                ];
                break;
            case 'fontColor':
                details.name = "fontColor";
                details.icon = "icon-font";
                details.title = "文字颜色";
                details.element = "dropdown";
                details.default = 1;
                details.options = [
                    {
                        "id": 1,
                        "value":  "#000000"
                    },
                    {
                        "id": 2,
                        "value":  "#2BA229"
                    }
                ];
                break;
            case 'table':
                details.name = "table";
                details.icon = "icon-table";
                details.title = "表格";
                details.element = "button";
                break;
            case 'signature':
                details.name = "signature";
                details.icon = "icon-pencil";
                details.title = "签名";
                details.element = "button";
                break;
        }

        return details;
    
    },
    setCaretToLastElem(node,init){
        _setCaretToLastElem(node,init);
    },
    traverseToLastNode(node){
        _traverseToLastNode(node);
    },
    hexToRGB(val){
        // Ref: https://campushippo.com/lessons/how-to-convert-rgb-colors-to-hexadecimal-with-javascript-78219fdb
        let value = typeof val === "number" ? val.toString() : val;

        var rgbNum = value.substring(4,val.length-1),
            arrRrgbNum = rgbNum.split(',');
        
        var colorHex = "#";

        for(var i = 0; i < 3; i++){
            var hex = parseInt(arrRrgbNum[i]).toString(16);
            
            if(hex.length < 2) {
                hex = "0" + hex;
            }

            colorHex += hex;
        }

        return colorHex.toUpperCase();
    },
    getCurrentCaretPos(){
        var sel = window.getSelection();
        
        return {
            focusNode: sel.focusNode,
            focusOffset: sel.focusOffset
        }
    },
    restoreCurrentCaretPos(node,offset){

            var sel = window.getSelection();

            sel.collapse(node, offset);

    },
    checkSimilarFontColor(optArr,valueToCheck){
        return _checkSimilarFontColor(optArr,valueToCheck);
    },
    checkValidHex(value){
        var hex6Regex = new RegExp('^#[a-fA-F0-9]{6}$'),
            valid = hex6Regex.test(value);

        if(!valid){
            console.warn(`Color code "${value}" not recognize. Only accept full HEX value. i.e #000000`);
        }

        return valid;
    },
    convertToBlob(dataUri){
        return _convertToBlob(dataUri);
    },
    urlChecker(str){
        return _urlRegex(str);
    },
    generateUniqueId() {
        return 'id-' + Math.random().toString(36).substr(2, 16);
    },
    cleanUpTable(elem){
        //09-01-18: Defect 14419,14420,14421 - (Azhaziq)
        //The dom manipulation using loops cause issue when we remove the class name, switch to recursion
        function clean(elem){
            let tableElements = elem.getElementsByClassName('rte-table-container');

            if(tableElements.length != 0){
                let tableContainer = tableElements[0];

                let tableActionBar = tableContainer.getElementsByClassName('rte-table-action-bar');
                tableActionBar[0].remove();
    
                let table = tableContainer.getElementsByTagName('TABLE');
    
                table[0].id = '';
                table[0].className = '';
    
                table[0].style.border = "1px solid #b9b9b9";
                // table[0].style.width = "100%";
                table[0].style['border-collapse'] = "collapse";
                // table[0].style['table-layout'] = "fixed";

                let rows = table[0].getElementsByTagName('TR');
    
                for(let row of rows){
                    row.id = '';
                    row.className = '';
                }
    
                let columns = table[0].getElementsByTagName('TD');
    
                for(let column of columns){
                    let col = document.getElementById(column.id),
                        colWidth =  parseFloat(window.getComputedStyle(col).getPropertyValue('width').replace("px",""));
                    
                    if(colWidth <= 60) {
                        column.style["width"] =  "60px";
                    }

                    column.style.border = "1px solid #b9b9b9";
                    column.style["min-width"] =  "60px";
                    column.style["word-break"] = "break-all";
                    column.id = '';
                    column.className = '';
                    column.style['font-family'] = '"Microsoft YaHei", Arial, Helvetica, sans-serif'; 
                    column.style['font-size'] = "16px";

                    if(column.innerHTML.length == 0){
                        column.innerHTML = "&nbsp;"
                    }
                }
    
                tableContainer.removeAttribute("id");
                tableContainer.removeAttribute("class");
                clean(elem);
                return;
            } else {
                return;
            }
        }

        clean(elem);
    },
    removeParagraphMargin(elem){
        let paraTags = elem.getElementsByTagName("P");

        let i,
            ptLen = paraTags.length;
        
        for (i = 0; i < ptLen; i++){
            paraTags[i].style.margin = 0;
        }
    },
    getFocusOnTableDataModel() {
        return {
            tableId: null,
            rowId: null,
            columnId: null,
            tableElem: null,
            parentTableElem: null,
            rowIndex: undefined,
            columnIndex: undefined
        }
    }
}

function _setCaretToLastElem(node,init){
    if(init){
        
        if(node.firstChild != null){
            _setCaretToLastElem(node.firstChild,false);
        }

    } else {
        if(node.nextSibling != null){
            _setCaretToLastElem(node.nextSibling,false);
        } else {
            if(node.hasChildNodes()){
                var nodeInfo = _traverseToLastNode(node);

                var sel = window.getSelection();
                sel.collapse(nodeInfo.node,parseInt(nodeInfo.length));

            } else {
                var sel = window.getSelection();
                sel.collapse(node,parseInt(node.length));
            }
        }
    } 
}

function _traverseToLastNode(node){

    var lastChildNode = node.childNodes[node.childNodes.length -1];

    if(lastChildNode.hasChildNodes()){
        return _traverseToLastNode(lastChildNode);
    } else {
        return {
            length: lastChildNode.length,
            node: lastChildNode
        }
    }
}

function _checkSimilarFontColor(optArr,valueToCheck){

    let found = optArr.filter(function(item){
        if(item.value === valueToCheck){
            return true;
        }
    })

    return found.length > 0 ? true : false;
}

function _convertToBlob(dataURI){
    
    let blobImage = null,
        conversionStatus = true;

    try {
        blobImage =  dataURItoBlob(dataURI);
    } catch (e) {
        console.error(e);
        conversionStatus = false;
    }

    return conversionStatus ? blobImage : false;
}

function _urlRegex(str){
    //Ref: https://code.tutsplus.com/tutorials/8-regular-expressions-you-should-know--net-6149
    let re = new RegExp('^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$');

    return re.test(str);
}