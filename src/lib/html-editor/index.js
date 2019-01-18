'use strict'
import RTE from './rte.js';
import './assets/style.css';
import './assets/dxc-icon/style.css';

const uuidv1 = require('uuid/v1');

export default {

    //Bootstrap command
    //Supply id of element to be a rich text editor and setup config if any
    bootstrap(id,config,dataIn, titleIn){

        if(id){
            return _richTextEditorInit(id,config,dataIn,titleIn);
        } else {
            console.error('Please Define an Id');
        }
    }
}

function _richTextEditorInit(id,config,dataIn,titleIn){

    let duplicate = _checkDuplicationName(id);

    if(!duplicate){

        let rteInstance = document.getElementById(id);
        
        let instantiated = _checkAlreadyInstantiate(rteInstance);
        
        if(!instantiated){
            let rte = new RTE(uuidv1(),config,dataIn, titleIn);
            let rteObj = rte.createRichTextEditor(rteInstance);
            
            return rteObj;
        } else {
            console.error('Id has been instantiated. Please Choose Another Id. Id Must be Unique');
        }

    } else {
        console.error('Id has been used. Please Choose Another Id. Id Must be Unique');
    }
}

function _checkDuplicationName(id){
    
    let instaces = document.querySelectorAll(`[id=${id}]`);
    return instaces.length > 1 ? true : false;
}

function _checkAlreadyInstantiate(instance){
    return instance.childNodes.length != 0 ? true : false;
}