
import Utils from './utils';
import Actions from './actions';
import CustomDD from './custom-dropdown';
import Events from './events';

export default {

    create(containerElem,type,localVariable){

        var dropdownTypeDetails = Utils.getActionTypeDetails(type);
        
        let container = document.createElement('div');

        container.className = `rte-action-dd-${dropdownTypeDetails.name}`;
        
        if(localVariable.config.featureConfig.hasOwnProperty(type)){

            switch (type){
                case 'fontColor':
                    let i = 0,
                        fcConfig = Object.assign({},localVariable.config.featureConfig['fontColor']),
                        max = fcConfig.value.length,
                        currOptCount = dropdownTypeDetails.options.length;
                    
                    for(i = 0; i < max; i++){

                        if(fcConfig.replace){
                            currOptCount = 0;
                            dropdownTypeDetails.options = [];
                            fcConfig.replace = false;
                        }
                        
                        if(Utils.checkValidHex(fcConfig.value[i])){
                            
                            let duplicate = Utils.checkSimilarFontColor(dropdownTypeDetails.options,fcConfig.value[i]);

                            if(!duplicate){
                                var temp = {
                                    id: ++currOptCount,
                                    value: fcConfig.value[i].toUpperCase()
                                }
    
                                dropdownTypeDetails.options.push(temp);
                            }
                        }
                    }
                    break;
            }
        }

        let dropdownConfig = {
            options: dropdownTypeDetails.options,
            default: dropdownTypeDetails.default,
            name: dropdownTypeDetails.name
        }

        let dd = new CustomDD(dropdownConfig,_changeSelect.bind(null,containerElem,localVariable));

        container.appendChild(dd.createDD());

        return {
            type: dropdownTypeDetails.name,
            elem: container,
            ddObj: dd
        }
    }, 
}

function _changeSelect(containerElem,localVariable,selected){
    
    var panelElem = document.getElementById(`${localVariable.uuid}-rte-edit-pane`),
        panelBodyElem = panelElem.getElementsByClassName('rte-pane-body-view');
    
    panelBodyElem[0].focus();

    switch(selected.name){
        case "fontSize":
            Actions.executeAction(selected,selected.id);
            break;
        case "fontColor":
            Actions.executeAction(selected,selected.value);
            break;
    }
    
    localVariable.value = Events.trace(panelElem, localVariable);
    
}