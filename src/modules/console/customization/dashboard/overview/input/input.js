import Vue from 'vue'
import CommonUtils from '@/utils/common-utils.js'
import TypeChecker from '@/utils/type-checker.js'
import LeapSelect from '@/components/leap-select/LEAPSelect.vue'
import Noty from '@/utils/noty-operation.js'
import DashboardApi from '@/api/customization/dashboard.js'

import CommonGenerators from '@/utils/common-generators.js'

let UUIDGenerator = CommonGenerators.UUIDGenerator

export default {
  name: 'cust-dashboard-input',
  props: {
    module: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      currentModule: null
    };
  },
  components: { LeapSelect },
  created() {
    this.editModule(this.$props.module);
  },
  methods: {
    editModule(m) {
      this.currentModule = CommonUtils.deepClone(m);
      this.isEditing = true;

      let curRemoteMonthData = this.currentModule.monthData,
        curMonth = this.curMonth = new Date().getMonth() + 1 + '',
        curMonthData = null;
      if (TypeChecker.isObject(curRemoteMonthData)) {
        curMonthData = curRemoteMonthData[curMonth];

        if(TypeChecker.isString(curMonthData)) {
          curMonthData = JSON.parse(curMonthData);
        }
      } 
      this.currentModule.editConfig.fields.forEach(f => {
        if (f.type == 'current_month') {
          f.value = curMonth;
        } else if (f.list) {
          f.listData = [];
          f.fields.forEach(_f => {
            if(_f.list) {
              _f.listData = [];
            }
          });
          if (TypeChecker.isObject(curMonthData) && TypeChecker.isArray(curMonthData[f.key])) {
            curMonthData[f.key].forEach(row => {
              let d = {};
              f.fields.forEach(_f => {
                if(_f.list) {
                  if(TypeChecker.isArray(row[_f.key])) {
                    row[_f.key].forEach(_row => {
                      let _d = {};
                      _f.fields.forEach(__f => {
                        _d[__f.key] = _row[__f.key];
                      });
                      _f.listData.push(_d);
                    });
                  }
                } else {
                  d[_f.key] = row[_f.key];
                }
              });
              f.listData.push(d);
            });
          }
        } else {
          if (TypeChecker.isObject(curMonthData)) {
            f.value = curMonthData[f.key];
          }
        }
      });
      this.currentModule.editConfig.tables.forEach(t => {
        let tableData = null;
        if (TypeChecker.isObject(curMonthData)) {
          tableData = curMonthData[t.name];
        }
        t.fields.forEach(field => {
          if (field.type == 'current_month') {
            field.value = curMonth;
          } else if (field.list) {
            field.listData = [];
            if (TypeChecker.isObject(tableData) && TypeChecker.isArray(tableData[field.key])) {
              tableData[field.key].forEach(row => {
                let d = {};
                field.fields.forEach(f => {
                  d[f.key] = row[f.key];
                });
                field.listData.push(d);
              });
            }
          } else {
            if (TypeChecker.isObject(curMonthData)) {
              field.value = tableData[field.key];
            }
          }
        });
      });
    },
    cancel() {
      this.$emit("cancelled");
    },
    submit() {
      let vm = this;
      let prepareDataToSave = function() {
        let _data = { name: vm.currentModule.key, month: vm.curMonth, value: {} };
        _data.value['remind'] = vm.currentModule.monthData[vm.curMonth].remind;
        _data.value['support'] = vm.currentModule.monthData[vm.curMonth].support;
        vm.currentModule.editConfig.fields.forEach(f => {
          if(f.list) {
            f.value = [];
            f.listData.forEach(d => {
              f.value.push(d);
            });
            _data.value[f.key] = f.value;
          } else {
            _data.value[f.key] = f.value;
          }
        });
        vm.currentModule.editConfig.tables.forEach(t => {
          let table = {};
          t.fields.forEach(f => {
            if (f.list) {
              f.value = [];
              f.listData.forEach(d => {
                f.value.push(d);
              });
              table[f.key] = f.value;
            } else if (f.type != 'current_month') {
              table[f.key] = f.value;
            }
          });
          _data.value[t.name] = table;
        });
        return _data;
      };
      let saveTable = function(data) {
        DashboardApi.saveReport(data).then(res => {
          Noty.notifySuccess({text: '保存数据成功！'});
          vm.$emit('submitted');
        }, err => {
          Noty.notifyError({text: '保存数据失败！'});
        });
      };

      let data = prepareDataToSave();
      saveTable(data);

    },
    addNewRow(moduleTable, field) {
      Vue.set(moduleTable, 'showForm', true);
      Vue.set(moduleTable, 'form', {});
    },
    saveNewRow(moduleTable, field) {
      let form = moduleTable.form;

      if (!form.id) {
        form.id = UUIDGenerator.purchase();
        field.listData.push(form);
      } else {

      }
      Vue.set(moduleTable, 'showForm', false);
      Vue.set(moduleTable, 'form', null);
    },
    cancelNewRow(moduleTable, field) {
      Vue.set(moduleTable, 'showForm', false);
      Vue.set(moduleTable, 'form', null);
    },
    editRow(moduleTable, field, row) {
      Vue.set(moduleTable, 'showForm', true);
      Vue.set(moduleTable, 'form', CommonUtils.deepClone(row));
    },
    removeRow(moduleTable, field, row) {
      let index = -1;
      field.listData.every((item, i) => {
        if (item.id == row.id) {
          index = i;
          return false;
        }
        return true;
      });
      if (index > -1) {
        field.listData.splice(index, 1);
      }
    }
  }
}
