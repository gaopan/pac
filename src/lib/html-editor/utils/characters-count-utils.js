export default {

    updateCharactersValueInHeader(rteVariable) {

        var headerNode = document.getElementById(`${rteVariable.uuid}-rte-edit-pane`).getElementsByClassName(`rte-pane-header`);        
        
        //characters value at header area
        rteVariable.characters.header = headerNode[0].firstChild.value.length;

        //Update UI
        var headerElem;
    
        if(rteVariable.config.documentMode){
            let mainPane = document.getElementById(`${rteVariable.uuid}-rte-edit-pane`);

            headerElem = mainPane.getElementsByClassName('rte-document-wrapper')[0];

        } else {
            headerElem = document.getElementById(`${rteVariable.uuid}-rte-edit-pane`);
        }

        var charactersHeaderElem = headerElem.getElementsByClassName(`rte-pane-header-characters`),
            charactersHeaderErrorsElem = headerElem.getElementsByClassName(`rte-pane-header-errors`);

        //Display characters count
        charactersHeaderElem[0].innerHTML = `Characters: ${rteVariable.characters.header}/${rteVariable.config.headerMaximumCharacters}`;
        
        //Logic to show/hide error message when exceed maximum characters
        if((rteVariable.characters.header > rteVariable.config.headerMaximumCharacters)) {
            
            var charactersInputElem = headerElem.getElementsByClassName(`rte-pane-header`)[0];
            
            if(charactersHeaderErrorsElem.length === 0) {

                var newNode = document.createElement('span');
                newNode.className = "rte-pane-header-errors";
                newNode.innerHTML = `The Title may not be greater than ${rteVariable.config.headerMaximumCharacters} characters`;
    
                charactersInputElem.parentNode.insertBefore(newNode, charactersInputElem.nextSibling);

            }
                
        } else {

            if(charactersHeaderErrorsElem.length > 0) {

                headerElem.removeChild(charactersHeaderErrorsElem[0]);
            
            }
            
        }

    },
    updateCharactersValueInBody(eventKeyOption, rteVariable) {
    
        var panelNode = document.getElementById(`${rteVariable.uuid}-rte-edit-pane`).getElementsByClassName(`rte-pane-body-view`);
        
        var checkCharacter = function(node, count) {
            //23-8-18: Improve count, innertext does not give correct depiction of how many count of words
            //https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent
            var stringCharacter = node.textContent;

            count = stringCharacter.length;
    
            if (node.parentNode && node.localName != "div") {
                checkCharacter(node.parentNode, count);
            } else {
                return count;
            }
    
        }
    
        var countCharacters = checkCharacter(panelNode[0], 0);
        
        //characters value at body area
        rteVariable.characters.body =  (eventKeyOption === 'keydown') ? countCharacters + 1 : countCharacters;

        var headerElem;

        if(rteVariable.config.documentMode){
            let mainPane = document.getElementById(`${rteVariable.uuid}-rte-edit-pane`);

            headerElem = mainPane.getElementsByClassName('rte-document-wrapper')[0];

        } else {
            headerElem = document.getElementById(`${rteVariable.uuid}-rte-edit-pane`);
        }

        var charactersBodyElem = headerElem.getElementsByClassName(`rte-pane-body-characters`),
            charactersBodyErrorsElem = headerElem.getElementsByClassName(`rte-pane-body-errors`);

        //Display characters count
        charactersBodyElem[0].innerHTML = `Characters: ${rteVariable.characters.body}/${rteVariable.config.bodyMaximumCharacters}`;

        //Logic to show/hide error message when exceed maximum characters
        if(rteVariable.characters.body > rteVariable.config.bodyMaximumCharacters) {
            
            var paneBodyElem = headerElem.getElementsByClassName(`rte-pane-body-view`)[0];

            if(charactersBodyErrorsElem.length === 0) {

                var newNode = document.createElement('span');
                newNode.className = "rte-pane-body-errors";
                newNode.innerHTML = `The Content may not be greater than ${rteVariable.config.bodyMaximumCharacters} characters`;
    
                paneBodyElem.parentNode.insertBefore(newNode, paneBodyElem.nextSibling);

            } 
                
        } else {

            if(charactersBodyErrorsElem.length > 0) {
                headerElem.removeChild(charactersBodyErrorsElem[0]);
            }
        }
    
    }

}