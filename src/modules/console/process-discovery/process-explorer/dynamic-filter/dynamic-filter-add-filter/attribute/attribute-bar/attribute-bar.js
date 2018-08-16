import CommonUtils from "@/utils/common-utils.js"
import DfServices from "../../../dynamic-filter-services.js"
import LeapSearch from "@/components/leap-search/LEAPSearch.vue"

export default {
    name: 'attribute-bar',
    props: ['attrLists', 'localSectionFilter'],
    components: {
        LeapSearch
    },
    data() {
        return {
            currentSelectedTab: {
                name: null,
                showSearch: null,
                searchPlaceholder: null
            },
            activeAttrList: [],
            passiveAttrList: [],
            listOverflow: false,
            showAttrMenu: false,
            menuStyle: {},
            clickCounter: {
                panel: 0,
                other: 0
            }
        }
    },
    created() {
        this.$data.passiveAttrList = this.$props.attrLists.slice();
        this.initSelectedFilterValue();
    },
    watch: {
        activeAttrList: {
            handler(newVal, oldVal) {

                if (newVal.length > 0) {

                    //to avoid twice call - make sure value.length > 0
                    let status = true;
                    newVal.find(arr => {
                        if (arr.value.length == 0) {
                            status = false;
                        }
                    });

                    if (status) {
                        this.$emit('updateActiveAttr', newVal);
                    }

                } else {
                    //send when attribute tab active list is empty
                    this.$emit('updateEmptyAttr');
                }
            },
            deep: true
        },
        showAttrMenu: function(newVal, oldVal) {

            if(newVal) {

                this.clickCounter.panel = 0;
                this.clickCounter.other = 0;

                setTimeout(() => {
                    window.addEventListener('click',this.fnOnClickOther);
                },0);
        
            } else {

                window.removeEventListener('click',this.fnOnClickOther);

            }

        }
    },
    methods: {
        initSelectedFilterValue() {

            let getActiveAttribute = (DfServices.getActiveAttribute()) ? DfServices.getActiveAttribute().toLowerCase() : null;

            let localSectionFilterData = this.$props.localSectionFilter.value;

            if (localSectionFilterData.length > 0) {

                for (let index in localSectionFilterData) {

                    let currentObj = localSectionFilterData[index],
                        attributeFieldType = currentObj.fieldType,
                        attributeField = currentObj.field;
                    
                    setTimeout( () => {

                        this.$data.passiveAttrList.find((attribute) => {
                            
                            if(attribute) {

                                if (attribute.field.toLowerCase() == attributeField.toLowerCase()) {

                                    let isActiveField = (attributeField.toLowerCase() == getActiveAttribute) ? true: false;

                                    this.addToActiveAttrList(attribute, isActiveField);
                                
                                }

                            }
    
                        });

                    });

                }

            }

        },
        checkCurrentAttr(attr) {

            return (attr.field === this.currentSelectedTab.name) ? true: false;

        },
        setAsActive(attr, isActiveField) {

            if(attr) {

                if(attr === {}) {

                    DfServices.saveActiveAttribute(null);
                    this.$emit('selectedAttr', {});
                    this.currentSelectedTab.name = null;
                    this.currentSelectedTab.showSearch = false; 
                    this.currentSelectedTab.searchPlaceholder = null;   

                } else {

                    if(isActiveField) {

                        DfServices.saveActiveAttribute(attr.field);
                        this.currentSelectedTab.name = attr.field;
                        this.currentSelectedTab.showSearch = (attr.fieldType !== 'date' && !attr.isBoolean) ? true : false; 
                        this.currentSelectedTab.searchPlaceholder = (attr.fieldType == 'number') ? 'Division' : attr.fieldLabel; 

                    }

                    this.$emit('selectedAttr', {
                        field: attr.field,
                        isActiveField: isActiveField
                    });

                }

            } 
            
        },
        addToPassiveAttrList(attr) {

            //Adib Ghazali - reset selected date when user remove tab (type of date)
            if (attr.fieldType == 'date') {

                attr.selectedDate = {
                    start: null,
                    end: null
                }

            } else {
                //remove selected(/) when user remove tab
                attr.value = [];

            }

            this.$data.passiveAttrList.push(attr);

            let attrIdx = this.$data.activeAttrList.findIndex((arrItem) => {

                if (arrItem.field == attr.field) {
                    return true;
                } else {
                    return false;
                }
            })

            this.$data.activeAttrList.splice(attrIdx, 1);

            if (this.$data.activeAttrList.length == 0) {

                this.setAsActive({});
                this.$emit('countActive', false);

            } else {

                this.setAsActive(this.$data.activeAttrList[0], true);

            }

        },
        addToActiveAttrList(attr, isActiveField) {

            if (this.$data.activeAttrList.length == 0) {
                this.$emit('countActive', true)
            };

            this.$data.activeAttrList.push(attr);

            let attrIdx = this.$data.passiveAttrList.findIndex((arrItem) => {
            
                if (arrItem.field == attr.field) {
                    return true;
                } else {
                    return false;
                }

            });

            let attrVal = CommonUtils.deepClone(this.$data.activeAttrList[this.$data.activeAttrList.length - 1]);
            
            //7 Dec 2017: adib.ghazali@hpe.com - setActiveAttribute when changed tab
            DfServices.saveActiveAttribute(attrVal.field);

            this.setAsActive(this.$data.activeAttrList[this.$data.activeAttrList.length - 1], isActiveField);

            this.$data.passiveAttrList.splice(attrIdx, 1);
            this.$data.showAttrMenu = false;

        },
        toggleDropdown() {
            
            if (this.showAttrMenu) {

                this.showAttrMenu = false;

            } else {

                let togglePos = this.$refs.addItemToggle.getBoundingClientRect();

                this.menuStyle = {
                    position: "absolute",
                    top: `${togglePos.height}px`,
                    left: `${togglePos.left + 5}px`,
                    zIndex: '1'
                }

                this.showAttrMenu = true;

            }

        },
        fnSearch(searhText) {

            this.$emit('searching', searhText);

        },
        fnOnClickOther(e){

            this.clickCounter.other++;

            if(this.clickCounter.panel != this.clickCounter.other){
                this.showAttrMenu = false;
            }

        }
    },
    beforeDestroy() {

        window.removeEventListener('click',this.fnOnClickOther);

    }
}