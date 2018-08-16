import Pagging from '@/components/Paginator/Paginator.vue';
import TypeChecker from '@/utils/type-checker.js'
import CommonUtils from '@/utils/common-utils.js'

import sharedAttribute from "../../attribute-innerEvents";
let attributeInnerEvents = sharedAttribute.attributeInnerEvents;

export default {
    name: 'attribute-table',
    props: {
        attrData: {
            type: Object,
            required: false
        },
        config: {
            type: Object,
            required: false
        }
    },
    components: {
        Pagging
    },
    data() {
        return {
            showPagination: false,
            totalItemPerPage: 20,
            pagination: {
                start: 0,
                end: 20
            },
            currentPage: 1,
            isResetCurrentPage: false,
            tableHeader: null
        }
    },
    computed: {
        styles: function() {
            return {
                height: `${this.$props.config.height}px`,
                width: `${this.$props.config.width}px`
            }
        },
        totalSizeOfTableData: function() {

            let size = 0;

            if (this.$props.attrData.value) {
                size = this.$props.attrData.value.length;
                this.showPagination = (size < this.totalItemPerPage) ? false : true;
            }

            return size;

        },
        //TODO: tableData vs displayTableData
        tableData: function() {
            return (this.$props.attrData.value) ? this.$props.attrData.value : [];
        },
        displayTableData: function() {

            if (this.$props.attrData.value) {

                let arr = this.$props.attrData.value;
                arr = arr.slice(this.pagination.start, this.pagination.end);

                if (this.$props.attrData.value.length > 0) {
                    attributeInnerEvents.$emit('change-pagination', {
                        start: this.pagination.start,
                        end: this.pagination.end
                    });
                }

                return arr;
            }

        },
        maxHeightTableBody: function() {

            if (this.$props.config) {
                if (this.$props.config.height) {
                    return `${this.$props.config.height - 70}px`;
                }
            }

        }
    },
    created() {
        
        attributeInnerEvents .$on('onSearchingPagination', this.onSearchingPagination);
        this.fnInit();

    },
    watch: {
        'attrData.field': {
            handler: function(newVal, oldVal) {
                //reset when changed field
                if(newVal != oldVal) {
                    this.fnInit();
                    this.resetPaginationNumberRange();
                    this.currentPage = 1;
                    this.isResetCurrentPage = true;
                }
                
            },
            deep: true
        }
    },
    methods: {
        fnInit() {

            let headers = [];

            if (this.$props.attrData.value) {

                if (this.$props.attrData.value.length > 0) {

                    let data = this.$props.attrData.value[0];

                    for (let props in data) {

                        if (data.hasOwnProperty(props)) {

                            let name = null;

                            if (this.$props.attrData.fieldType == 'number') {

                                switch (props) {
                            
                                    case 'attributeValue':
                                        name = 'Division';
                                        break;

                                    default:
                                        name = props;

                                }

                            } else {
                                name = (props == 'attributeValue') ? this.$props.attrData.field : props;
                            }

                            headers.push({
                                name: name,
                                iconArrow: 'default'
                            });
                        }
                    }

                }
            }

            this.$data.tableHeader = headers;

        },
        fnIsSelectAll: function() {
            
            this.isSelectAll = true;
            
            if(!TypeChecker.isUndefined(this.displayTableData)) {

                if(this.displayTableData.length > 0) {

                    this.displayTableData.find((obj) => {
                        if (!obj.selected) {
                            this.isSelectAll = false;
                        }
                    });

                } else {

                    this.isSelectAll = false;

                }
                

            } else {

                this.isSelectAll = false;
            
            }

            return this.isSelectAll;

        },
        clickSingleItem(event, index, checked) {

            this.displayTableData.find((obj, _index) => {
                if (index == _index) {
                    obj.selected = (checked) ? false : true;
                }
            });

            attributeInnerEvents.$emit('attribute-selected');

        },
        clickSelectAll() {

            let selected = (this.isSelectAll) ? false : true;
            
            this.displayTableData.find((obj) => {
                obj.selected = selected;
            });

            attributeInnerEvents.$emit('attribute-selected');

        },
        fnGetIconClass(iconArrow) {

            switch(iconArrow) {

                case 'up':
                  return 'icon-sort-up';
                  break;
    
                case 'down':
                  return 'icon-sort-down';
                  break;
    
                default: 
                  return 'icon-sort';
            
            }

        },
        sortColumn(index) {

            let currentArrow = this.tableHeader[index].iconArrow,
                currentName = this.tableHeader[index].name;

            this.tableHeader[index].iconArrow = (currentArrow == 'up') ? 'down' : 'up';

            this.tableData.sort((a, b) => {

                let val1 = a.attributeValue,
                    val2 = b.attributeValue;

                if(currentName == 'amountOfRange') {

                    val1 = val1.split('~')[0];
                    val2 = val2.split('~')[0];

                    return (currentArrow == 'up') ?
                        val2 - val1 : //latest -> earliest
                        val1 - val2;  //earliest -> latest
                
                } else {

                    return (currentArrow == 'up') ?
                        val2.localeCompare(val1) : //Z-A
                        val1.localeCompare(val2)   //A-Z

                }

            });

            //reset others column to default except current sorting column
            this.tableHeader.find((header, idx) => {
                if(index != idx) {
                  header.iconArrow = 'default'
                }
            });
           
        },
        showColumn(name) {

            let hideName = ['selected', 'attributeValueMax', '', 'minValue', 'maxValue'];

            return (hideName.includes(name)) ? false : true;
 
        },
        setPaginationNumberRange() {

            let pageIndex = this.currentPage;

            let num = null,
                end = null,
                start = this.totalItemPerPage * (pageIndex - 1);

            num = (this.totalSizeOfTableData % this.totalItemPerPage == 0) ? (this.totalSizeOfTableData / this.totalItemPerPage) : parseInt(this.totalSizeOfTableData / this.totalItemPerPage) + 1;
            end = (pageIndex == num) ? this.totalItemPerPage : this.totalItemPerPage * pageIndex;
    
            this.pagination = {
                start: start,
                end: end
            }

        },
        resetPaginationNumberRange() {

            this.pagination = {
                start: 0,
                end: 20
            }

        },
        onChangePageHandler(pageIndex) {
            
            this.currentPage = pageIndex;
            // this.isResetCurrentPage = false;

            this.setPaginationNumberRange();

        },
        onSearchingPagination(data) {

            if(data == "") {
                
                this.setPaginationNumberRange();

            } else {

                this.resetPaginationNumberRange();

            }

        }
    },
    filters: {
        camelToTitleCase: function(val) {
            let result = val.replace(/([A-Z])/g, " $1");
            return result.charAt(0).toUpperCase() + result.slice(1);
        },
        twoDecimalPoints: function(val) {
            let convertedVal = val * 100;

            return (convertedVal > 0) ? `${convertedVal.toFixed(2)} %` : '0%';
        },
        convertDuration: function(val) {
            //formula taken from variants component

            let num = null,
                str = null,
                count = 2;

            if (val === 0) {

                num = 0;
                return `${num.toFixed(count)} Second`;

            } else if (val < 60) {

                if(val) {

                    num = val;
                    str = (num > 1) ? `${num} Seconds` : `${num} Second`;

                    return str;

                } else {

                    return '-';

                }
              
            } else if (val < 60 * 60) {

                num = val / 60;
                str = (num > 1) ? `${num.toFixed(count)} Minutes` : `${num.toFixed(count)} Minute`;
                return str;

            } else if (val < 60 * 60 * 24) {

                num = val / (60 * 60);
                str = (num > 1) ? `${num.toFixed(count)} Hours` : `${num.toFixed(count)} Hour`;
                return str;

            } else {

                num = val / (60 * 60 * 24);
                str = (num > 1) ? `${num.toFixed(count)} Days` : `${num.toFixed(count)} Day`;
                return str;
            }

        }
    },
    beforeDestroy() {
        attributeInnerEvents .$off('onSearchingPagination', this.onSearchingPagination);     
    }
}