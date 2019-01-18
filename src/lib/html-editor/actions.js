'use strict'

export default {

    executeAction(ActionTypeDetails, val){
        
        switch (ActionTypeDetails.name){

            case 'bold':
                document.execCommand('bold',false,null);
                break;
            
            case 'underline':
                document.execCommand('underline',false,null);
                break;
            
            case 'italic':
                document.execCommand('italic',false,null);
                break;
            
            case 'justifyLeft':
                document.execCommand('justifyLeft',false,null);
                break;
            
            case 'justifyCenter':
                document.execCommand('justifyCenter',false,null);
                _executeListStylePosition();
                break;
            
            case 'justifyRight':
                document.execCommand('justifyRight',false,null);
                _executeListStylePosition();
                break;
            
            case 'uList':
                document.execCommand('insertUnorderedList',false,null);
                break;
            
            case 'oList':
                document.execCommand('insertOrderedList',false,null);
                break;
            
            case 'fontSize':
                //1 - 10px
                //2 - 13px
                //3 - 16px
                //4 - 18px
                //5 - 24px
                //6 - 32px
                //7 - 48px
                document.execCommand('fontSize',false,val);
                break;

            case 'fontColor':
                document.execCommand('foreColor',false,val);
                break;

            case 'link':
                document.execCommand('createLink', false, val);
                break;
            
            case 'image':
                document.execCommand('insertImage',false,val);
                break;
        
        }
    },
    addSignature(elem,rteVariable){
        let signatureCnfg = rteVariable.config.signature;

        let separatorElem = document.createElement('p'),
            separatorNode = document.createElement('br');
        
        separatorElem.appendChild(separatorNode);
        separatorElem.appendChild(separatorNode);

        let valedictionElem = document.createElement('p'),
            valedictionTextNode = document.createTextNode(signatureCnfg.valediction + ',');
        
        valedictionElem.appendChild(valedictionTextNode);

        let senderElem = document.createElement('p'),
            senderTextNode = document.createTextNode(signatureCnfg.senderName);
        
        senderElem.appendChild(senderTextNode);

        elem.appendChild(separatorElem);
        elem.appendChild(separatorElem.cloneNode(true));
        elem.appendChild(separatorElem.cloneNode(true));
        elem.appendChild(valedictionElem);
        elem.appendChild(senderElem);
    }
}

function _executeListStylePosition() {

    var selectedSelection = window.getSelection();
    var focusNode = selectedSelection.focusNode;
    var parentFocusNode = focusNode.parentNode;

    if(focusNode.nodeName == '#text') {
        parentFocusNode.style.listStylePosition = 'inside';
    } else {
        focusNode.style.listStylePosition = 'inside';
    }

}