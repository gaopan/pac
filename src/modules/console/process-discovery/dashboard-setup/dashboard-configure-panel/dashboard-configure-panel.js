import TypeChecker from '@/utils/type-checker.js'

import LeapSelect from '@/components/leap-select/LEAPSelect.vue'
import CommonUtils from '@/utils/common-utils.js'
import Vue from 'vue'

import DashboardConfigurePanelConfig from './dashboard-configure-panel.conf.js'

export default {
  name: 'dashboard-configure-panel',
  props: {
    order: {
      type: Number,
      required: true
    },
    minOrder: {
      type: Number,
      required: true
    },
    maxOrder: {
      type: Number,
      required: true
    },
    // remote config
    config: {
      validator: function(_config) {
        if (!TypeChecker.isObject(_config)) return false;
        let valid = true;
        

        for (let key in DashboardConfigurePanelConfig.settings) {
          if (DashboardConfigurePanelConfig.settings.hasOwnProperty(key)) {
            if(!TypeChecker.isArray(_config[DashboardConfigurePanelConfig.settings[key].key])){
              valid = false;
              break
            }
          }
        }
        return valid;
      }
    },
    // available fields
    fields: {
      validator: function(_fields) {
        if (!TypeChecker.isObject(_fields)) return false;
        let valid = true;
        for (let key in DashboardConfigurePanelConfig.settings) {
          if (DashboardConfigurePanelConfig.settings.hasOwnProperty(key)) {

            let _fieldsKey = _fields[DashboardConfigurePanelConfig.settings[key].key];
            if (!(TypeChecker.isArray(_fieldsKey) || TypeChecker.isObject(_fieldsKey))) {
              valid = false;
              break;
            }
          }
        }
        return valid;
      }
    }
  },
  components: { LeapSelect },
  data() {
    return {
      templates: null,
      currentTemplate: null
    };
  },
  watch: {
    order(val) {
      this.currentTemplate = this.templates[val - 1];
    }
  },
  created() {
    let vm = this;

    DashboardConfigurePanelConfig.parseDashboardConfigFields(this.$props.fields);
    this.templates =  this.initPanelConfiguration(DashboardConfigurePanelConfig.templates,this.$props.config);
    this.currentTemplate = this.templates[this.$props.order - 1];

  },
  beforeDestroy() {
    this.$off()
  },
  computed: {
    isNextable() {
      return this.$props.order < this.$props.maxOrder;
    },
    isPrevable() {
      return this.$props.order > this.$props.minOrder;
    },

    isNewGroupValid() {
      let valid = true;
      if (this.currentTemplate.order == 4) {
        let g = this.currentTemplate.currentGroup;
        if (!TypeChecker.isObject(g.type) || !TypeChecker.isObject(g.dataField) || !TypeChecker.isObject(g.groupBy)) {
          valid = false;
          return valid;
        }
        if (!TypeChecker.isString(g.type.name) || !TypeChecker.isString(g.dataField.name) || !TypeChecker.isString(g.groupBy.name)) {
          valid = false;
          return valid;
        }
      }
      return valid;
    }
  },
  methods: {
    initPanelConfiguration(templates,config){
      if(config){
        let chartName = {
          1: "caseDistributionTrendBy",
          2: "valueComparisonBy",
          3: "valueRankingBy",
          4: "valueGroupBy"
        };

        templates.forEach(temp=>{
          if(temp.order!=4){
            temp.groups = generateInitalConfig(config[chartName[temp.order]]);
            temp.groups.forEach(g=>{
              temp.config.availableFields.forEach((f,i)=>{
                if(f.value == g.value){
                  temp.config.availableFields.splice(i,1);
                }
              })
            })

          }else{

            let valueGroupByConfig = config[chartName[temp.order]],
                valueGroupByGroups = [];

            valueGroupByConfig.forEach((c,i)=>{
              valueGroupByGroups.push({});
              valueGroupByGroups[i].name = c.aggregate+ " of "+c.by.label+" by "+c.groupBy.label
            })

            temp.groups = valueGroupByGroups;            
          }


        })
        function generateInitalConfig (config){
          let groups = [];
          if(config&&config.length){
            config.forEach((conf,i)=>{
              groups.push({});
              groups[i].name = conf.label;
              groups[i].value = conf.key;
            })
          }
          return groups
        }

        return templates;
      }      
    },
    saveTemplateGroup() {
      this.$emit("save", this.templates)
    },
    resetTemplateGroup() {
      if (!this.currentTemplate.isAdding) {
        this.currentTemplate.groups = [];
      }
    },
    toAddTemplateGroup() {
      if(this.currentTemplate.config.availableFields.length===0)return;
      Vue.set(this.currentTemplate, 'isAdding', true);

      if (this.currentTemplate.order == 4) {
        this.currentTemplate.currentGroup = {
          name: 'Untitled',
          type: {},
          dataField: {},
          groupBy: {}
        };
      }
    },
    deleteTemplateGroup(group) {

      let index = null;
      this.currentTemplate.groups.every((g, i) => {
        if (g.value == group.value) {
          index = i;
          return false;
        }
        return true;
      });
      if(group.order!= 4){
        this.currentTemplate.config.availableFields.push(this.currentTemplate.groups[index])
      }
      if (index != null) {
        this.currentTemplate.groups.splice(index, 1);
      }
    },
    selectTemplateItem(args) {
      //14 Feb 2018: adib.ghazali@hpe.com - refactor LEAP Select for emit data
      let val = args.value;
      // let selectedField = this.currentTemplate.config.availableFields.filter(d => d.value == val)[0];

      //fix defect #4959 hong-yu.chen@hpe.com<194-199>
      let selectedField = this.currentTemplate.config.allFields.filter(d => d.value == val)[0];
      let selectedFieldIndex = this.currentTemplate.config.availableFields.findIndex(d=>{
        return d.value === selectedField.value;
      })
      this.currentTemplate.config.availableFields.splice(selectedFieldIndex,1)


      let bRepeatedName = this.currentTemplate.groups.some(d => {
        return d.value == selectedField.value;
      })
      if (!bRepeatedName) {
        this.currentTemplate.groups.push(selectedField);
      }
      Vue.set(this.currentTemplate, 'isAdding', false);
    },
    cancelAddTemplateGroup() {
      Vue.set(this.currentTemplate, 'isAdding', false);
    },
    addTemplateGroup() {

      if (this.isNewGroupValid) {
        let currentGroupName = this.currentTemplate.currentGroup.name;

        let bRepeatedName = this.currentTemplate.groups.some(d => {
          return d.name == currentGroupName;
        })

        let newGroup = {};

        newGroup.name = currentGroupName;

        if (!bRepeatedName) {
          this.currentTemplate.groups.push(newGroup);
        }
        Vue.set(this.currentTemplate, 'isAdding', false);
      }
    },
    updateTemplateGroupName() {
      let g = this.currentTemplate.currentGroup;
      g.name = `${g.type.name||''} of ${g.dataField.name||''} by ${g.groupBy.name||''}`;
    },
    selectTemplateTypeItem(args) {
      //14 Feb 2018: adib.ghazali@hpe.com - refactor LEAP Select for emit data
      let val = args.value;

      let selectedType = this.currentTemplate.config.type.filter(d => d.value == val)[0];
      this.currentTemplate.currentGroup.type = selectedType;
      this.updateTemplateGroupName();
    },
    selectTemplateDateFieldItem(args) {
      //14 Feb 2018: adib.ghazali@hpe.com - refactor LEAP Select for emit data
      let val = args.value;

      let selectedDataField = this.currentTemplate.config.availableFields.filter(d => d.value == val)[0];
      this.currentTemplate.currentGroup.dataField = selectedDataField;
      this.updateTemplateGroupName();
    },
    selectTemplateGroupByItem(args) {
      //14 Feb 2018: adib.ghazali@hpe.com - refactor LEAP Select for emit data
      let val = args.value;

      let selectedGroupBy = this.currentTemplate.config.availableGroupByFields.filter(d => d.value == val)[0];
      this.currentTemplate.currentGroup.groupBy = selectedGroupBy;
      this.updateTemplateGroupName();
    },
    prev() {
      this.$emit('prev');
    },
    next() {
      this.$emit('next');
    }
  }
} 

