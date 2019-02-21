
import Utils from './utils';
import TypeChecker from './utils/type-checker-utils';
import CustomTable from './components/custom-table/custom-table';

export default {
    //7th June 2018 - Azhaziq: Construct HTML content
    /**
     * This function create the HTML value for consumer to consume
     * The structure as follow
     * <div class="rte-wrapper">
     *  <div clas="rte-pane-header"></div>
     *  <div class="rte-pane-body"></div>
     * </div>
     * 
     * Inline styling will be add according based on config
     * As for now header will have default styling
     * As for wrapper in document mode will have a width and margin auto
     * 
     * Param - compareVariable (Adib Added) - for undo-redo logic, comparison algo
     *  - Current data model {
     *          title: abc,
     *          body:  abc,
     *          maybe signature or etc
     *      }
     */
    getHTMLValue(rteVariable, compareVariable){

        let bodyElem = document.createElement('div'),
            wrapper = document.createElement('div');
        
        bodyElem.className = "rte-pane-body";
        bodyElem.innerHTML = rteVariable.value;
        bodyElem.style.paddingTop = "10px";
        bodyElem.style["font-family"] = 'Microsoft YaHei", Arial, Helvetica, sans-serif'; //Default font
        bodyElem.style["font-size"] = "16px";//Default Size

        //For undo-redo logic
        if(!TypeChecker.isUndefined(compareVariable) && !TypeChecker.isUndefined(compareVariable.body)) {
            bodyElem.innerHTML = compareVariable.body;
        }

        Utils.cleanUpTable(bodyElem);

        Utils.removeParagraphMargin(bodyElem);

        wrapper.className = "rte-wrapper";
        

        if(rteVariable.config.documentMode){
            wrapper.style.width = rteVariable.config.documentWidth || "800px";
            wrapper.style.margin = "auto";
        }

        switch(rteVariable.config.mode){
            case 'full':

                if(!rteVariable.config.excludeHeaderOutput){
                    let headerElem = document.createElement('div');

                    headerElem.className = "rte-pane-header";
                    headerElem.style.width = "100%";
                    headerElem.style.minHeight = "30px";
                    headerElem.style.fontSize = "24px";
                    headerElem.style.color = "#000000";
                    headerElem.style.fontWeight = "bold";
                    headerElem.style.paddingTop = "5px";
                    headerElem.style.paddingBottom = "5px";
    
                    headerElem.innerHTML = rteVariable.title;

                    //For undo-redo logic
                    if(!TypeChecker.isUndefined(compareVariable) && !TypeChecker.isUndefined(compareVariable.title)) {
                        headerElem.innerHTML = compareVariable.title;
                    }

                    wrapper.appendChild(headerElem);
    
                    if(rteVariable.config.separator){
    
                        let separator = document.createElement('hr');
            
                        separator.style.marginTop = "10px";
                        separator.style.marginBottom = "10px";
                        separator.style.border = "0";
                        separator.style.borderTop = "1px solid #EEEEEE";
            
                        wrapper.appendChild(separator);
                    }
                }

                break;
        }

        wrapper.appendChild(bodyElem);
        // var html = `<html><header></header><body>${wrapper.outerHTML}</body></html>`
        var html = `${wrapper.outerHTML}`
        return html;

    },
    formatNodes(content){
        this.cleanupNodes(content);

        let listOfNodes = content.childNodes,
            listOfNodesLen = listOfNodes.length;
        
        let i;
        for(i = 0; i < listOfNodesLen; i++){

            if(listOfNodes[i].nodeType === 3){
                let newElem = document.createElement('p'),
                newElemText = document.createTextNode(listOfNodes[i].nodeValue);
            
                newElem.appendChild(newElemText);

                content.replaceChild(newElem,listOfNodes[i]);

                _setAnchor(content);

            } else {
                if(listOfNodes[i].nodeName !== "P"){
                    if(listOfNodes[i].nodeName !== "UL" && listOfNodes[i].nodeName !== "OL" && listOfNodes[i].nodeName !== "DIV"){
                        _wrapwithParagraphTag(listOfNodes[i],content);
                    }

                } else {
                    if(listOfNodes[i].firstChild && (listOfNodes[i].firstChild.nodeName === "UL" || listOfNodes[i].firstChild.nodeName === "OL" || listOfNodes[i].firstChild.nodeName === "DIV")){
                        _replaceParent(listOfNodes[i],content,listOfNodes[i].firstChild);
                    }
                }

                if(listOfNodes[i].nodeName === "DIV"){
                    if(listOfNodes[i].id == ""){
                        if(listOfNodes[i].firstChild.nodeName !== "UL" && listOfNodes[i].firstChild.nodeName !== "OL" && listOfNodes[i].firstChild.nodeName !== "TABLE"){
                            _wrapwithParagraphTag(listOfNodes[i],content,listOfNodes[i].firstChild);
                        } else {
                            _replaceParent(listOfNodes[i],content,listOfNodes[i].firstChild);
                        }
                    }
                }
            }
        }
    },
    cleanupNodes(content){
        //Remove whitespace belong to nodeType 3
        let listOfNodes = content.childNodes,
            listOfNodesLen = listOfNodes.length;
            
        let i;

        for(i = 0; i < listOfNodesLen; i++){
            if(listOfNodes[i] && listOfNodes[i].nodeType === 3 && !/\S/.test(listOfNodes[i].nodeValue)){
                content.removeChild(listOfNodes[i]);
            }
        }
    },
    formatPasteData(content){
        console.log(content);
    },
    //Format the table from the outside world to fit our very own table functionlity
    formatTable(body){
        let i,
        tables = body.getElementsByTagName('table'),
        tableLen = tables.length;

        for(i = 0; i < tableLen; i++){
            let csTable = new CustomTable();
            let newTable = csTable.create(this,tables[i]);

            //Table may be wrap into multiple layer so need to check the parent under rte-pane-body-view
            function checkParent(currElem,prevNode){

                //Adib 18 Dec 2018 - S18 - #13536: Layout issue for notification
                //Solution - make sure the value is not undefined
                if(TypeChecker.isUndefined(currElem)) {
                    return undefined;
                }
                
                let currElementParent = currElem.parentElement;

                if(currElementParent.className != "rte-pane-body-view"){
                    return checkParent(currElementParent,currElementParent);
                } else {
                    return prevNode ? prevNode : currElem;
                }
            }

            let fullTableElem = checkParent(tables[i]);

            //Adib 18 Dec 2018 - S18 - #13536: Layout issue for notification
            //Solution - make sure the value is not undefined
            if(!TypeChecker.isUndefined(fullTableElem)) {

                if(fullTableElem.previousSibling == null) {
                    fullTableElem.insertAdjacentHTML('beforebegin','<p><br/><p>');
                }
    
                if(fullTableElem.nextSibling == null) {
                    fullTableElem.insertAdjacentHTML('afterend','<p><br/><p>');
                }
    
                body.replaceChild(newTable,fullTableElem);
            }
            
        }

        return tableLen > 0 ? true : false;
    },
    formatImages(content){
        let i,
        imagesElem = content.getElementsByTagName('img'),
        imagesElemLen = imagesElem.length;

        for(i = 0; i < imagesElemLen; i++){
            if(!imagesElem[i].style['max-width']){
                imagesElem[i].style['max-width'] = "100%";
                imagesElem[i].insertAdjacentHTML('afterend','<p><br/></p>');
            }
        }
    }
}

function _wrapwithParagraphTag(node,content,childNodes){
    let newElem = document.createElement('p'),
        cloneNode = childNodes ? childNodes.cloneNode(true) : node.cloneNode(true);
    
    newElem.appendChild(cloneNode);
    content.replaceChild(newElem,node);

    _setAnchor(content);
}

function _replaceParent(node,content,childNodes){
    let cloneNode = childNodes.cloneNode(true);
    content.replaceChild(cloneNode,node);

    // _setAnchor(content);
}

function _setAnchor(content){
    Utils.setCaretToLastElem(content);
}