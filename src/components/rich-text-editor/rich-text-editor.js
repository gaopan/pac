import RTE from '@/lib/html-editor/index.js';
import TypeChecker from '@/utils/type-checker.js'

import shared from "@/shared.js"
var eventHub = shared.eventHub;

/**
 * props: config - config to bootstrap rte
 *        dataIn - initial data  (content)
 *        disabled - disabled text editor
 *        title - initial title name
 * event: getValue - send function to register rte get value. Need invoke the function in consumer side,
 *        getCharacters - send total characters
 *        getTitle - return title value
 * 
 * **/
export default {
    name: 'rte',
    props: {
        config: {
            type: Object,
            default: function(){
                return {
                    panel: {
                        style: {
                            "min-height": "200px"
                        }
                    },
                    mode: "full",
                    featureConfig: {
                        fontColor: {
                            value: ['#00C9FF','#64FF00','#666666','#D9D9D9'],
                            replace: false
                        }
                    }
                }
            }
        },
        dataIn: {
            type: String
        },
        disabled: {
            type: Boolean,
            default: function(){
                return false;
            }
        },
        titleIn: {
            type: String,
            default: ''
        },
        disabledHeader: {
            type: Boolean,
            default: function(){
                return false;
            }
        }
    },
    data(){
        return {
            rteObj: null
        };
    },
    created(){
        eventHub.$on('rte-updateData', this.setUpdateData);
    },
    mounted(){
        setTimeout(()=>{
            let config = this.$props.config;
            this.rteObj = RTE.bootstrap(this.$el.id,config,this.dataIn, this.titleIn);
            this.setEditorDisabled(this.$props.disabled);

            if(!this.$props.disabled){
                this.setEditorHeaderDisabled(this.$props.disabledHeader);
            }
            
        },0);
    },
    methods: {
        getValue(){
            this.$emit('getValue',this.show);
        },
        setEditorDisabled(flag){
            this.rteObj.disabledTextEditor(flag);
        },
        setEditorHeaderDisabled(flag){
            this.rteObj.disabledHeader(flag);
        },
        show(){
            return this.rteObj.EditorValue.value;
        },
        setUpdateData(receivedObj) {
            this.rteObj.updateData(receivedObj.title,receivedObj.content);
        },
        getCharacters() {
            this.$emit('getCharacters', this.rteObj.EditorValue.characters);
        },
        getTitle() {
            this.$emit('getTitle', this.rteObj.EditorValue.title);
        }
    },
    watch: {
        disabled: function(nVal,oVal){
            setTimeout(()=>{
                if(nVal != undefined){
                    this.rteObj.disabledTextEditor(nVal);

                    if(!nVal && this.$props.disabledHeader){
                        this.rteObj.disabledHeader(true);
                    }
                }
            })
        },
        disabledHeader: function(nVal,oVal){
            setTimeout(()=>{
                if(nVal != undefined){
                    if(nVal && !this.$props.disabled){
                        this.rteObj.disabledHeader(nVal);
                    }
                }
            })
        },
        'rteObj.EditorValue.title': {
            handler(newVal, oldVal) {
                if(!TypeChecker.isUndefined(oldVal)) {
                    this.getTitle();
                }
            },
            deep: true
        },
        'rteObj.EditorValue.value': {
            //Adib - to get html value after the changes
            handler(newVal, oldVal) {
                if(!TypeChecker.isUndefined(oldVal)) {
                    this.getValue();
                }
            },
            deep: true
        },
        'rteObj.EditorValue.characters': {
             handler(newVal, oldVal) {
                this.getCharacters();
            },
            deep: true
        },
        titleIn: {
            handler(newVal, oldVal){}
        },
        dataIn: {
            handler(newVal,oldVal){

            }
        }
    },
    beforeDestroy() {
        eventHub.$off('rte-updateData', this.setUpdateData);
    },
    destroy(){}
}