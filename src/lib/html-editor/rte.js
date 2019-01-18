'use strict'
import Utils from './utils';
import Button from './button';
import Dropdown from './dropdown';
import Events from './events';
import undoRedo from 'undo-redo-stack'
import Actions from './actions';
import Formatter from './formatter';
import CustomTableEvents from './components/custom-table/custom-table-events';
import CharactersCountUtils from './utils/characters-count-utils';
import undoRedoUtils from './utils/undo-redo-utils';
/**
 *  RTE Base Function
 *  The RTE will be spawn and have thier own uuid to avoid conflict if there is multiple RTE in one page'
 *  API expose is get the value for the editor, create the editor and toggle disabled for the editor
 *  RTE is configurarable: Features, mode, panel style, show/hide characters, set maximum characters
 * 
 * **/
class RichTextEditor {

    constructor(uuid,config,dataIn,titleIn) {

        this.uuid = uuid;
        this.title = null; 
        this.value = null;
        this.characters = {
            header: 0,
            body: 0
        };
        this.config = {
            panel: {
                style: {}
            },
            featureLists: [ 'bold','underline', 'italic','fontSize','fontColor',
                            'justifyLeft', 'justifyCenter', 'justifyRight', 'uList', 'oList',
                            'image', 'link','table'],
            mode: 'full', //full - header + body in pane or simple - body in pane
            documentMode: false, 
            showHeaderCharacters: true,
            showBodyCharacters: true,
            headerMaximumCharacters: 100,
            bodyMaximumCharacters: 4000,
            featureConfig: {
                fontColor: {
                    value: [],
                    replace: false
                }
            },
            documentWidth: "800px", //Default 800px
            separator: false,
            excludeHeaderOutput: false,
            // signature: {
            //     include: true,
            //     senderName: 'Admin',
            //     valediction: 'Regards'
            // }
        };
        this.config = Object.assign(this.config,config);
        this.ddObject = {
            fontSize: null,
            fontColor: null
        };
        this.titleIn = titleIn;
        this.dataIn = dataIn;
        this.focusOnTable = Utils.getFocusOnTableDataModel();
        this.history = new undoRedo();

    }

    //GET Function
    get EditorValue(){
        return {
            uuid: this.uuid,
            title: this.title,
            value: Formatter.getHTMLValue(this),
            characters: this.characters
        }
    }

    //Public Function
    createRichTextEditor(containerElem){
        _createRichTextBar(containerElem,this);
        _createRichTextPanel(containerElem,this);

        return this;
    }
    
    disabledTextEditor(flag){

        var barElemId = `${this.uuid}-rte-text-bar`,
            barElem = document.getElementById(barElemId),
            panelElemId = `${this.uuid}-rte-edit-pane`,
            panelElem = document.getElementById(panelElemId);

        if(flag){
            _disabledBarElem(barElem);
            _disabledPanelBody(panelElem,flag);
            _disabledPanelHeader(panelElem, flag, this);
            _disabledTableActions(panelElem,flag);
        } else {
            _enabledBarElem(barElem);
            _disabledPanelBody(panelElem,flag);
            _disabledPanelHeader(panelElem, flag, this);
            _disabledTableActions(panelElem,flag);
        }
    }

    disabledHeader(flag){

        var panelElemId = `${this.uuid}-rte-edit-pane`,
            panelElem = document.getElementById(panelElemId);

        if(flag){
            _disabledPanelHeader(panelElem, flag, this);
        } else {
            _disabledPanelHeader(panelElem, flag, this);
        }
    }

    emailPruning(htmlString){
        let doc = new DOMParser().parseFromString(htmlString,'text/html'),
            imageListing = doc.body.querySelectorAll("img"),
            imageFileList = [],
            pruningStatus = true;

        if(imageListing.length > 0){

            for(var i = 0; i < imageListing.length; i++){

                //Check src is url or blob, if url skip to next img tag
                let urlRegex = Utils.urlChecker(imageListing[i].src);
                
                if(urlRegex) continue;
                
                let currImageObj = null;

                if(imageFileList.length != 0){

                    let filterArr = imageFileList.filter((arr) => {
                        if(arr.fileBase64 === imageListing[i].src){
                            return true;
                        } else {
                            return false;
                        }
                    })

                    //Blob conversion only happen for the image that has not been converted only. This is an optimization effort
                    if(filterArr.length == 0){
                        
                        let convertedVal = Utils.convertToBlob(imageListing[i].src);

                        //If the conversion failed, email pruning is failed
                        if(typeof convertedVal === 'boolean' && !convertedVal){
                            pruningStatus = false;
                            break;
                        }
    
                        let imageObj = {
                            fileBase64: imageListing[i].src,
                            fileblob: convertedVal
                        }

                        imageFileList.push(imageObj);
                        currImageObj = imageObj;
                        
                    } else {
                        currImageObj = filterArr[0];
                    }

                } else {

                    let convertedVal = Utils.convertToBlob(imageListing[i].src);

                    //If the conversion failed, email pruning is failed
                    if(typeof convertedVal === 'boolean' && !convertedVal){
                        pruningStatus = false;
                        break;
                    }

                    let imageObj = {
                        fileBase64: imageListing[i].src,
                        fileblob: convertedVal
                    }

                    imageFileList.push(imageObj);
                    currImageObj = imageObj;
                }

                let imagePos = imageFileList.indexOf(currImageObj);
                imageListing[i].src = `cid:image${imagePos}`;
            }

            if(pruningStatus){

                let rtnValue = {};

                rtnValue.contentString = doc.body.innerHTML;
                rtnValue.imageLists = imageFileList.map(obj => {
                    return obj.fileblob;
                });

                rtnValue.refKey = 'image';

                return { status: 'Success', data: rtnValue };

            } else {
                return { status: 'Failed', msg: 'Email Pruning Issues. Please reduce size and retry. If issues still persists contact support team' }
            }
        }
    }

    //5 Jun 2018: Adib - update title and content when onChanged Section without removing refresh the RTE Component
    updateData(title,content) {

        let dom;

        if(content){
            dom = new DOMParser().parseFromString(content,'text/html');
            content = dom.body.getElementsByClassName('rte-pane-body')[0].innerHTML;

            this.value = content;
            this.dataIn = content;
        } else if (content == null){
            content = ' ';
            this.value = ' ';
            this.dataIn = ' ';
        }
        
        var elem = document.getElementById(`${this.uuid}-rte-edit-pane`);

        if(this.config.mode !== 'simple'){
            //If title is supply used title over rte-pane-header
            if(title){
                this.title = title;
            } else {
                this.title = (dom) ? dom.body.getElementsByClassName('rte-pane-header')[0].innerHTML : null;
            }
            
            this.titleIn = title;

            var rtePaneHeader = elem.getElementsByClassName('rte-pane-header');
    
            rtePaneHeader[0].firstChild.value = this.title;

            if(this.config.showHeaderCharacters){
                CharactersCountUtils.updateCharactersValueInHeader(this);
            }
        }

        // if(content){
            let rtePaneBody = elem.getElementsByClassName('rte-pane-body-view')[0];
            rtePaneBody.innerHTML = content;

            let tableFormatted = Formatter.formatTable(rtePaneBody);

            if(tableFormatted){
                CustomTableEvents.traceCurrentFocusOnTableData(this);
            }
            

            if(this.config.showBodyCharacters){
                CharactersCountUtils.updateCharactersValueInBody('keyup', this);
            }

            this.value = Events.trace(elem,this);
        // }

    }

}

//Private Functions
//Create the RTE pane - consist of header and body depends on mode
function _createRichTextPanel(containerElem,localVariable){

    var dataInDoc = null;

    //If there is dataIn, update characters and value
    if(typeof localVariable.dataIn !== "undefined" && localVariable.dataIn != null && (typeof localVariable.dataIn === "string" && localVariable.dataIn.length > 0)){
        //Process dataIn string -> html document
        var parser = new DOMParser();
        dataInDoc = parser.parseFromString(localVariable.dataIn,"text/html");
    }
    
    var bodyDataIn = null;

    //get text bar element
    var barElem = _getBarElem(localVariable.uuid);

    //<div class="rte-edit-pane"/> 
    var richTextPanel = document.createElement("div");

    richTextPanel.className = "rte-edit-pane";
    richTextPanel.id = `${localVariable.uuid}-rte-edit-pane`;

    if(dataInDoc != null){

        if(dataInDoc.body.getElementsByClassName('rte-pane-body').length != 1){

            var tempContainer = document.createElement('div');
            tempContainer.insertAdjacentHTML('beforeend',dataInDoc.body.innerHTML);
            bodyDataIn = tempContainer;

        } else {
            var paneBody = dataInDoc.body.getElementsByClassName('rte-pane-body')[0];
            bodyDataIn = paneBody;
        }

        if(!localVariable.titleIn){
            if(dataInDoc.body.getElementsByClassName('rte-pane-header').length != 0){
                var paneHeaderElem = dataInDoc.body.getElementsByClassName('rte-pane-header')[0];
                localVariable.titleIn = paneHeaderElem.innerText;
            }
        }
    }
    
    /**
     * Switching mode for RTE
     * full - Show header and content 
     * simple - Show content
     * document - show centered header and content with specified width
     * 
    */
    let documentWrapper = null;

    if(localVariable.config.documentMode){
        richTextPanel.style.backgroundColor = "#F5F5F5";
        richTextPanel.style.paddingTop = "30px";
        richTextPanel.style.paddingBottom = "30px";

        documentWrapper = document.createElement('div');

        documentWrapper.className = "rte-document-wrapper";
        documentWrapper.style.width = localVariable.config.documentWidth;
        documentWrapper.style.margin = "auto";
        documentWrapper.style.backgroundColor = "#FFFFFF";
        documentWrapper.style.padding = "30px";
    }

    switch(localVariable.config.mode){
        case 'full':
            if(localVariable.config.documentMode){
                documentWrapper = _createRichTextPanelHeader(documentWrapper, containerElem, localVariable, barElem,localVariable.titleIn);
                documentWrapper = _createRichTextPanelBody(documentWrapper, containerElem, localVariable, barElem,bodyDataIn);
    
                richTextPanel.appendChild(documentWrapper);
            } else {
                richTextPanel = _createRichTextPanelHeader(richTextPanel, containerElem, localVariable, barElem,localVariable.titleIn);
                richTextPanel = _createRichTextPanelBody(richTextPanel, containerElem, localVariable, barElem,bodyDataIn);
            }

            break;
        case 'simple':
            if(localVariable.config.documentMode){
                documentWrapper = _createRichTextPanelBody(documentWrapper, containerElem, localVariable, barElem,bodyDataIn);
                
                richTextPanel.appendChild(documentWrapper);
            } else {
                richTextPanel = _createRichTextPanelBody(richTextPanel, containerElem, localVariable, barElem,bodyDataIn);
            }
            break;
    }
    
    if(localVariable && localVariable.config){

        let config = localVariable.config;

        if(config.panel && config.panel.style){

            for(var key in config.panel.style){
                richTextPanel.style[key] = config.panel.style[key];
            }
        }
    }

    containerElem.appendChild(richTextPanel);

    //If there is dataIn and titleIn, update characters and value
    if(localVariable.titleIn && localVariable.config.mode === "full" && localVariable.config.showHeaderCharacters){
        CharactersCountUtils.updateCharactersValueInHeader(localVariable);
    }

    if(typeof localVariable.dataIn !== "undefined" && localVariable.dataIn != null && (typeof localVariable.dataIn === "string" && localVariable.dataIn.length > 0)){

        if(localVariable.config.showBodyCharacters){
            CharactersCountUtils.updateCharactersValueInBody('keyup', localVariable);
        }

        //Update the value after the next tick
        setTimeout(()=>{
            localVariable.value = Events.trace(richTextPanel,localVariable);
            undoRedoUtils.setFirstHistoryElementData(localVariable);
        },0);

    } else {

        setTimeout(()=> {
            undoRedoUtils.setFirstHistoryElementData(localVariable);
        });
    }

    return richTextPanel;
}

//Create the RTE header 
function _createRichTextPanelHeader(richTextPanel, containerElem, localVariable, barElem,titleIn) {

    //<div class="rte-pane-header">
    var richTextHeader = document.createElement("div");

    richTextHeader.className = "rte-pane-header";

    //<input type="text" />
    var inputHeader = document.createElement('input');

    inputHeader.type = 'text';
    inputHeader.placeholder = 'Untitled';
    inputHeader.style.textOverflow = 'ellipsis';

    if(titleIn != null){
        inputHeader.value = titleIn;
        localVariable.title = titleIn;
    }

    //Header -> input : event listener
    inputHeader.addEventListener('keyup',(evt) => { 
        
        if(evt.keyCode !== 16 && evt.keyCode !== 17) { 

            if(localVariable.config.showHeaderCharacters) {
                CharactersCountUtils.updateCharactersValueInHeader(localVariable);
            }
    
            localVariable.title = Events.traceTitle(richTextPanel, localVariable, evt);

        }

    },false);

    inputHeader.addEventListener('keydown',(evt) => {
        
        if(evt.keyCode !== 16 && evt.keyCode !== 17) { 

            if(localVariable.config.showHeaderCharacters) {
                CharactersCountUtils.updateCharactersValueInHeader(localVariable);
                Events.shortcut(containerElem, localVariable, evt);
            }

        }
       
    },false);

    inputHeader.addEventListener('focusin',(evt) => { 
        
        _disabledBarElem(barElem);

        //reset focusOnTable to null when focusing at header area
        CustomTableEvents.traceCurrentFocusOnTableData(localVariable);

    }, false);

    inputHeader.addEventListener('focusout',(evt) => { 

        setTimeout( () => {

            let selected = window.getSelection();

            if(selected.focusNode.parentNode.className !== 'rte-text-bar' && selected.focusNode.parentNode.className !== 'rte-text-bar centered') {
                _enabledBarElem(barElem);
            }

        });

    }, false);

    //Adib 12 Dec 2018 - S18 #13569: QA2_Regression_[Content management_Guide] Can see the full title If the content more than 76 characters
    inputHeader.addEventListener('mouseover',(evt) => { 
        
        let headerElem = document.getElementsByClassName('rte-pane-header')[0];
        headerElem.title = localVariable.title;

    }, false);
    
    richTextHeader.appendChild(inputHeader);

    //<span class="rte-pane-body-characters"> - for displaying count characters
    var charactersHeader = document.createElement('span');
    charactersHeader.className = "rte-pane-header-characters";
    charactersHeader.innerHTML = `字符数: ${localVariable.characters.header}/${localVariable.config.headerMaximumCharacters}`;
    
    //Characters: 0/Max will be appear at the header container
    if(localVariable.config.showHeaderCharacters) {
        richTextPanel.appendChild(charactersHeader);
    }

    richTextPanel.appendChild(richTextHeader);
    richTextPanel.appendChild(document.createElement("hr"));
    
    return richTextPanel;

}

//Create the RTE body 
function _createRichTextPanelBody(richTextPanel, containerElem, localVariable, barElem,dataIn) {
    
    //<div class="rte-pane-body"> - for content editable : 
    var richTextBody = document.createElement("div");

    richTextBody.className = "rte-pane-body-view";
    // richTextBody.style.textAlign = "left";
    // richTextBody.style.overflow = "auto";
    richTextBody.contentEditable = true;
     
    //Event listener
    richTextBody.addEventListener('keyup',(evt) => { 
        
        if(evt.keyCode !== 16 && evt.keyCode !== 17) {

            if(localVariable.config.showBodyCharacters){
                CharactersCountUtils.updateCharactersValueInBody('keyup', localVariable);
            }
        
            localVariable.value = Events.trace(richTextPanel, localVariable, evt);
            
        }

    },false);

    richTextBody.addEventListener('keydown',(evt) => {
        
        if(evt.keyCode !== 16 && evt.keyCode !== 17) {

            if(localVariable.config.showBodyCharacters){
                CharactersCountUtils.updateCharactersValueInBody('keydown', localVariable);
                Events.shortcut(containerElem,localVariable,evt);
            }
            
        }
        
    },false);

    richTextBody.addEventListener('focusout',(evt) => { Events.clearAllBtn(containerElem,evt); Events.resetAllDD(localVariable); }, false);
    richTextBody.addEventListener('focusin',(evt) => {  _enabledBarElem(barElem); }, false);
    richTextBody.addEventListener('mouseup',(evt) =>{ Events.cursorMove(containerElem,localVariable,evt) ; },false);
    //TODOS: Process paste value
    richTextBody.addEventListener('paste',(evt) => { Events.paste(containerElem,localVariable,evt); },false);

    //<span class="rte-pane-body-characters"> - for displaying count characters
    var charactersBody = document.createElement('span');
    charactersBody.className = "rte-pane-body-characters";
    charactersBody.innerHTML = `字符数: ${localVariable.characters.body}/${localVariable.config.bodyMaximumCharacters}`;

    //Characters: 0/Max will be appear at the body container
    if(localVariable.config.showBodyCharacters) {
        richTextPanel.appendChild(charactersBody);
    }

    //3rd May 2018 - muhammad-azhaziq.bin-mohd-azlan-goh@dxc.com
    if(dataIn != null){
        richTextBody.insertAdjacentHTML('beforeend',dataIn.innerHTML);
        //Format the table if come from dataIn
        Formatter.formatTable(richTextBody);
    }

    //26/7/2018 - muhammad-azhaziq.bin-mohd-azlan-goh@dxc.com
    //Add Signature feature

    if(localVariable.config.signature && localVariable.config.signature.include){
        Actions.addSignature(richTextBody,localVariable);
    }

    richTextPanel.appendChild(richTextBody);

    return richTextPanel;

}

//Create the RTE action bar
function _createRichTextBar(containerElem,localVariable){

    var richTextBar = document.createElement("div");
    richTextBar.id = `${localVariable.uuid}-rte-text-bar`;

    if(localVariable.config.documentMode){
        richTextBar.className = "rte-text-bar centered"
    } else {
        richTextBar.className = "rte-text-bar";
    }

    var richTextBarList = document.createElement("ul");

    //Get the feature lists
    var featureLists = localVariable.config.featureLists;
    
    for(var key in featureLists){

        var richTextBarListItem = document.createElement("li");
        
        var actionTypeDetails = Utils.getActionTypeDetails(featureLists[key]);
        
        var actionElement = null;
        
        //If the action type is button create button element
        //If the action type is dropdown create dropdown element
        if(actionTypeDetails.element == "button"){
            actionElement = Button.create(containerElem,featureLists[key],localVariable);
        } else if (actionTypeDetails.element == "dropdown") {

            let ddReceived = Dropdown.create(containerElem,featureLists[key],localVariable);
            actionElement = ddReceived.elem;

            localVariable.ddObject[ddReceived.type] = ddReceived.ddObj;
        }

        if(actionElement != null) {
            richTextBarListItem.appendChild(actionElement);
    
            richTextBarList.appendChild(richTextBarListItem);
            richTextBar.appendChild(richTextBarList);
        }
        
    }
    
    //reset focusOnTable to null and disabled table-action-bar for all tables when focusing at action-bar
    richTextBar.addEventListener('mouseup',(evt) => { CustomTableEvents.traceCurrentFocusOnTableData(localVariable); }, false);

    containerElem.appendChild(richTextBar);

}

function _getBarElem(uuid) {
    var barElemId = `${uuid}-rte-text-bar`;
    var barElem = document.getElementById(barElemId);
    return barElem;
}

function _disabledBarElem(barElem) {

    var overlayObj  = barElem.getElementsByClassName('disabled-overlay');

    if(overlayObj.length > 0) {
        console.warn('Already Disabled');
    } else {

        var disabledOverlay = document.createElement('div');

        disabledOverlay.className = "disabled-overlay";
        
        barElem.appendChild(disabledOverlay);
    }
}

function _enabledBarElem(barElem) {

    var overlayObj  = barElem.getElementsByClassName('disabled-overlay');

    if(overlayObj.length > 0) {

        for(let index = 0; index < overlayObj.length; index++) {
            overlayObj[index].remove();
        }
    }
}

function _disabledPanelBody(panelElem,flag){
    var panelElemBody = panelElem.getElementsByClassName('rte-pane-body-view');
    if(panelElemBody.length > 0) {
      panelElemBody[0].setAttribute('contenteditable',!flag);
    }
}

function _disabledPanelHeader(panelElem, flag, localVariable) {

    if(localVariable.config.mode === 'full') {

        var panelElemHeader = panelElem.getElementsByClassName('rte-pane-header');

        // panelElemHeader[0].setAttribute('contenteditable',!flag);
    
        panelElemHeader[0].children[0].disabled = (flag) ? true : false;

    }

}

function _disabledTableActions(panelElem,flag){

    let actionBars = panelElem.getElementsByClassName('rte-table-action-bar');

    let i,
    aBLen = actionBars.length;

    for(i = 0; i < aBLen; i++){
        if(flag){
            actionBars[i].style.display = "none";
        } else {
            actionBars[i].style.display = "block";
        }

    }
}

export default RichTextEditor;