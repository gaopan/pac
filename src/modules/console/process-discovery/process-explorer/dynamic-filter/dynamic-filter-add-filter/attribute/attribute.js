import AttributeBar from "./attribute-bar/attribute-bar.vue"
import AttributePanel from "./attribute-panel/attribute-panel.vue"
import DynamicFilterApi from '@/api/process-mining.js'
import DFServices from "../../dynamic-filter-services.js"

import CommonGenerators from '@/utils/common-generators.js'
import NotyOperation from '@/utils/noty-operation.js'
import CommonUtils from "@/utils/common-utils.js"

import shared from "@/shared.js"
var eventHub = shared.eventHub;

import sharedAttribute from "./attribute-innerEvents.js";
let attributeInnerEvents = sharedAttribute.attributeInnerEvents;

export default {
    name: 'attribute',
    props: ['localSectionFilter'],
    data() {
        return {
            processAnalyticsId: null,
            attrLists: [],
            attrContentStyle: {},
            noActiveList: true,
            selectedAttr: {}, 
            filteredSelectedAttr: {}
        }
    },
    components: {
        'attr-bar': AttributeBar,
        'attr-panel': AttributePanel
    },
    created() {

        eventHub.$on("tile-window-resized", this.windowResized);

        this.setAttrPanelHeight();
        this.processAnalyticsId = this.$store.getters.processSelection.processAnalyticsId;

        this.$data.attrLists = CommonUtils.deepClone(DFServices.getAttributesList());

    },
    methods: {
        windowResized() {
            this.setAttrPanelHeight();
        },
        setAttrPanelHeight() {

            let navOffset = 40 + 40;
            var k = document.getElementsByClassName("process-explorer")[0].parentNode.clientHeight - 70;

            k = k - navOffset;

            this.attrContentStyle = {
                height: `${k}px`
            };

        },
        defaultSorting(arr) {
            //sorting based on the frequency value (most to less)
            arr.value.sort((a, b) => {
                let val1 = parseInt(a.frequency),
                    val2 = parseInt(b.frequency);

                return val2 - val1;
 
            });

            return arr;

        },
        getAttributeData(selectedAttr, isActiveField) {
            
            let vm = this;

            let currentObj = this.$props.localSectionFilter.value.find(lcl => {
                if (lcl.field.toLowerCase() == selectedAttr.field.toLowerCase()) {
                    return lcl;
                }
            });

            let loadId = CommonGenerators.UUIDGenerator.purchase();

            eventHub.$emit("start-mini-loader", {
                id: loadId
            });

            var targetedAttribute = `CASE.${selectedAttr.field}`;

            DynamicFilterApi.getAttribute(this.$store.getters.processSelection.customerId, vm.processAnalyticsId, targetedAttribute).then(function(res) {

                let arr = [];

                for (let list of res.data.list) {

                    list.selected = false;
                    arr.push(list);

                }

                //assign data to value of attribute
                switch(selectedAttr.fieldType) {

                    case 'date': 

                        selectedAttr.value = arr.slice();

                        selectedAttr.selectedDate = {
                            start: null,
                            end: null
                        }

                        break;

                    case 'number':

                        let valAttrNum = [];
                    
                        arr.find( (obj, index) => {

                            let newObj = Object.assign({
                                attributeValue: null,
                                amountOfRange: `${Math.round(obj.attributeValue)} ~ ${Math.round(obj.attributeValueMax)}`
                            }, obj);
                            
                            newObj.attributeValue = index + 1;
                            newObj.minValue = obj.attributeValue;
                            newObj.maxValue = obj.attributeValueMax;

                            valAttrNum.push(newObj);
    
                        });

                        selectedAttr.value = valAttrNum.slice();

                        break;

                    default: 

                        selectedAttr.value = arr.slice();

                }

                //mapping with local section filter
                if (currentObj) {
           
                    switch(selectedAttr.fieldType) {

                        case 'date':

                            selectedAttr.selectedDate = currentObj.value;
                            break;

                        case 'number':
                            
                            let selVal = currentObj.value;

                            selectedAttr.value.find(val => {

                                let minVal = parseFloat(val.minValue),
                                    maxVal = parseFloat(val.maxValue),
                                    found = false;

                                selVal.find(sel => {
                                    if(sel.min == minVal && sel.max == maxVal) {
                                        found = true;
                                    }
                                });

                                val.selected = (found) ? true: false;

                            });

                            break;

                        default: 
                            
                            let selectedValues = currentObj.value;

                            if(selectedAttr.isBoolean) {

                                let isSelected = selectedValues.include[0];

                                selectedAttr.value.find(val => {
                                    val.selected = (isSelected) ? true : false;  
                                });


                            } else {

                                selectedAttr.value.find(val => {
                                    val.selected = (selectedValues.include.includes(val.attributeValue)) ? true : false; 
                                });

                            }
                    }
                    
                }

                if(isActiveField) {

                    vm.$data.selectedAttr = (selectedAttr.fieldType == 'number') ? selectedAttr : vm.defaultSorting(selectedAttr);
                    vm.$data.filteredSelectedAttr = Object.assign({}, vm.$data.selectedAttr);
                
                }
               
                eventHub.$emit("finish-mini-loader", {
                    id: loadId
                });

            }).catch(function(error) {

                if(isActiveField) {

                    vm.$data.selectedAttr = selectedAttr;
                    vm.$data.filteredSelectedAttr = Object.assign({}, vm.$data.selectedAttr);

                }

                NotyOperation.notifyError({
                    text: `Error! Failed to retrive ${selectedAttr.field} data.`
                });

                eventHub.$emit("finish-mini-loader", {
                    id: loadId
                });

            });

        },
        onSelectedAttr(data) {

            if(data.field) {

                let selectedAttr = this.$data.attrLists.find((arr) => {
                    return (data.field.toLowerCase() == arr.field.toLowerCase()) ? true : false;
                });

                setTimeout(() => {

                    if (selectedAttr) {

                        //get attributes for the first time only
                        if(selectedAttr.value.length == 0) {

                            this.getAttributeData(selectedAttr, data.isActiveField);

                        
                        } else {

                            this.$data.selectedAttr = (selectedAttr.fieldType == 'number') ? selectedAttr : this.defaultSorting(selectedAttr);
                            this.$data.filteredSelectedAttr = Object.assign({}, this.$data.selectedAttr);

                        }

                    } else {

                        this.$data.selectedAttr = {};
                        this.$data.filteredSelectedAttr = {};

                    }

                });

            } else {

                this.$data.selectedAttr = {};
                this.$data.filteredSelectedAttr = {};
                
            }   

        },
        onUpdateActiveAttr(dataArr) {
            //This is function to add the filter value to global data model

            let selectedAttr = [];

            for (let attribute of dataArr) {

                let obj = {
                    field: attribute.field,
                    fieldType: attribute.fieldType,
                    isBoolean: attribute.isBoolean,
                    value: {}
                }

                switch(obj.fieldType) {

                    case 'date':

                        obj.value = attribute.selectedDate;
                        
                        break;

                    case 'number':

                        let arr = [];
                        
                        attribute.value.find(val => {
                            if (val.selected) {
                                arr.push({
                                    min: parseFloat(val.minValue),
                                    max: parseFloat(val.maxValue),
                                    inclusive: {
                                        min: (val.attributeValue == 1) ? true: false,
                                        max: true
                                    }
                                })
                            }
                        });

                        obj.value = arr;

                        break;

                    default:

                        let arrIncludes = {
                            include: []
                        };

                        attribute.value.find(val => {

                            if(obj.isBoolean) {
                                //for dataType = BOOLEAN
                                if (val.selected) {
                                    arrIncludes.include.push(true);
                                } else {
                                    arrIncludes.include.push(false);
                                }

                            } else {
                                if (val.selected) {
                                    arrIncludes.include.push(val.attributeValue);
                                }
                            }
                        });

                        obj.value = arrIncludes;

                } 
                
                selectedAttr.push(obj);
            
            }

            //Emit the data out global data model
            eventHub.$emit('updateFilterValue', {
                filterType: "attribute",
                value: selectedAttr
            });

        },
        onUpdateEmptyAttr() {
            //Emit the data out global data model
            eventHub.$emit('updateFilterValue', {
                filterType: "attribute",
                value: []
            });
        },
        onSearching(data) {

            if (data) {

                let foundLists = [];

                this.selectedAttr.value.filter(attribute => {
                    if (attribute.attributeValue.toString().toLowerCase().includes(data.toLowerCase())) {
                        foundLists.push(attribute);
                    }
                });

                this.$data.filteredSelectedAttr.value = foundLists;

            } else {

                this.$data.filteredSelectedAttr = Object.assign({}, this.$data.selectedAttr);

            }

            attributeInnerEvents.$emit('onSearchingPagination', data);

        }
    },
    filters: {
        attrTransform: function(val) {

            let transformedStr = '';

            for (var i = 0; i < val.length; i++) {

                let clName = val[i].fieldLabel.replace('_', ' ');

                if (i < val.length - 2) {
                    transformedStr += clName + ', ';
                } else if (i == val.length - 1) {
                    transformedStr += ' and ' + clName;
                } else {
                    transformedStr += clName;
                }

            }

            return transformedStr;
            
        }
    },
    beforeDestroy() {
        eventHub.$off("tile-window-resized", this.windowResized);
    }
}