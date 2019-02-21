
import Utils from './utils';

class CustomDropDown {
    constructor(config,selectFn){
        this.config = config;
        this.selected = null;
        this.selectFn = selectFn;
        this.customDDElem = null;
    }

    createDD(){
        return _create(this);
    }

    get selectedValue(){
        return this.selected;
    }

    setSelectedValue(type,value){

        switch (type){
            case 'fontSize':

                this.selected = this.config.options[parseInt(value) - 1];
                                
                if(this.selected){
                    var optionListElem = this.customDDElem.getElementsByClassName("rte-dd-custom-option-box")[0].getElementsByTagName("li");

                    for (var i = 0; i < optionListElem.length; i++){
                        if(i != this.selected.id - 1){
                            optionListElem[i].classList.remove("selected");
                        } else {
                            optionListElem[i].classList.add("selected");
                        }
                    }
                
                    var selectSpanElem = this.customDDElem.getElementsByClassName("rte-dd-custom-select-box")[0].getElementsByTagName("span")[0];
                    selectSpanElem.innerHTML = this.selected.value;
                }
                break;
            case 'fontColor':
                var hexColor = Utils.hexToRGB(value);
                
                this.selected = this.config.options.find((arr)=>{
                    if(arr.value === hexColor){
                        return true;
                    } else {
                        return false;
                    }
                })

                if(this.selected !== undefined) {

                    var optionListElem = this.customDDElem.getElementsByClassName("rte-dd-custom-option-box")[0].getElementsByTagName("li");

                    for (var i = 0; i < optionListElem.length; i++){
    
                        if(i != this.selected.id - 1){
                            optionListElem[i].classList.remove("selected");
                        } else {
                            optionListElem[i].classList.add("selected");
                        }
                    }
    
                    var selectSpanElem = this.customDDElem.getElementsByClassName("rte-dd-custom-select-box")[0].getElementsByTagName("span")[0];
                    selectSpanElem.style.backgroundColor = this.selected.value;

                }

                break;
        }
    }
}

function _create(localVariable) {
    var customDD = document.createElement("div");

    customDD.className = "rte-dd-custom";

    var customDDSelectBox = document.createElement("div"),
        customDDSelectBoxSpan = document.createElement("span"),
        customDDSelectBoxIcon = document.createElement("i");

    var startingIndex = localVariable.config.default ? localVariable.config.default - 1 : 0;

    localVariable.selected = localVariable.config.options[startingIndex];

    switch(localVariable.config.name){
        case 'fontSize':
            customDDSelectBoxSpan.innerHTML = localVariable.config.options[startingIndex].value;
            break;
        case 'fontColor':
            customDDSelectBoxSpan.style.backgroundColor = localVariable.config.options[startingIndex].value;
            customDDSelectBoxSpan.style.height = "100%";
            break;
    }
    

    customDDSelectBox.appendChild(customDDSelectBoxSpan);
    customDDSelectBox.appendChild(customDDSelectBoxIcon);

    customDDSelectBox.className = "rte-dd-custom-select-box";
    customDDSelectBoxIcon.className = "icon-chevron-down";

    var customDDOptionBox = document.createElement("div"),
        customDDOptionBoxUl = document.createElement("ul");

    customDDOptionBox.className = "rte-dd-custom-option-box"
    customDDOptionBox.classList.add("hide");

    for(var i = 0; i < localVariable.config.options.length; i++){

        var customDDOptionBoxLi = document.createElement("li");

        customDDOptionBoxLi.value = localVariable.config.options[i].id;
        
        switch(localVariable.config.name){
            case 'fontSize':
                customDDOptionBoxLi.innerHTML = localVariable.config.options[i].value;
                break;
            case 'fontColor':
                var colorSpan = document.createElement("span");
                colorSpan.style.backgroundColor = localVariable.config.options[i].value;
                customDDOptionBoxLi.appendChild(colorSpan);
                break;
        }
        
        
        if(i == startingIndex){
            customDDOptionBoxLi.classList.add("selected");
        }

        //https://stackoverflow.com/questions/256754/how-to-pass-arguments-to-addeventlistener-listener-function
        customDDOptionBoxLi.addEventListener("mousedown",_selectOptions.bind(null,customDDOptionBoxLi,i,customDD,localVariable));

        customDDOptionBoxUl.appendChild(customDDOptionBoxLi);
    }

    customDDOptionBox.appendChild(customDDOptionBoxUl);
    
    customDD.appendChild(customDDSelectBox);
    customDD.appendChild(customDDOptionBox);

    //Setup Listener
    customDDSelectBox.addEventListener("mousedown",function(evt){ 
        evt.preventDefault(); 
        _toggleDropDown(customDDOptionBox) 
    });

    localVariable.customDDElem = customDD;

    return customDD;
}

function _toggleDropDown(optionContainerElem){
    optionContainerElem.classList.toggle("hide");
}

function _selectOptions(optElem,selectedIdx,customDDElem,localVariable,evt){
    
    evt.preventDefault();

    localVariable.selected = localVariable.config.options[selectedIdx];
    optElem.classList.add("selected");

    var optionListElem = customDDElem.getElementsByClassName("rte-dd-custom-option-box")[0].getElementsByTagName("li");

    for (var i = 0; i < optionListElem.length; i++){
        if(i != selectedIdx){
            optionListElem[i].classList.remove("selected");
        }
    }

    var selectSpanElem = customDDElem.getElementsByClassName("rte-dd-custom-select-box")[0].getElementsByTagName("span")[0];

    switch(localVariable.config.name){
        case 'fontSize':
            selectSpanElem.innerHTML = localVariable.config.options[selectedIdx].value;
            break;
        case 'fontColor':
            selectSpanElem.style.backgroundColor = localVariable.config.options[selectedIdx].value;
            selectSpanElem.style.height = "100%";
            break;
    }

   

    var optionContainerElem = customDDElem.getElementsByClassName("rte-dd-custom-option-box")[0];

    var selected = Object.assign({ name: localVariable.config.name },localVariable.selected);

    localVariable.selectFn(selected);

    _toggleDropDown(optionContainerElem)
}

function _setSelectedOptions(){

}

export default CustomDropDown;
