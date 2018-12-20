import Noty from '@/utils/noty-operation.js'
import DashboardApi from '@/api/customization/dashboard.js'
const REQUEST_KEY = 'statistic'
export default {
  props: {
    companies: {
      type: Array,
      required: true
    },
    requestId: {
      type: Number
    }
  },
  data() {
    return {
      keys: [{
        name: '企业员工人数',
        value: '企业员工人数',
        validate: {
          required: true,
          decimal: 0
        }
      }, {
        name: "研发人员人数",
        value: "研发人员人数",
        validate: {
          required: true,
          decimal: 0
        }
      }, {
        name: "法定工作总时长",
        value: "法定工作总时长",
        validate: {
          required: true,
          decimal: 0
        }
      }, {
        name: "研发人员法定工作总时长",
        value: "研发人员法定工作总时长",
        validate: {
          required: true,
          decimal: 0
        }
      }, {
        name: "实际工作时长",
        value: "实际工作时长",
        validate: {
          required: true,
          decimal: 0
        }
      }, {
        name: "研发人员实际工作时长",
        value: "研发人员实际工作时长",
        validate: {
          required: true,
          decimal: 0
        }
      }, {
        name: "加班总时长",
        value: "加班总时长",
        validate: {
          required: true,
          decimal: 0
        }
      }, {
        name: "研发人员加班总时长",
        value: "研发人员加班总时长",
        validate: {
          required: true,
          decimal: 0
        }
      }, {
        name: "法定工作时长（人均）",
        value: "法定工作时长（人均）",
        validate: {
          required: true,
          decimal: 0
        }
      }, {
        name: "研发人员法定工作时长（人均）",
        value: "研发人员法定工作时长（人均）",
        validate: {
          required: true,
          decimal: 0
        }
      }, {
        name: "实际工作时长（人均）",
        value: "实际工作时长（人均）",
        validate: {
          required: true,
          decimal: 0
        }
      }, {
        name: "研发人员实际工作时长（人均）",
        value: "研发人员实际工作时长（人均）",
        validate: {
          required: true,
          decimal: 0
        }
      }, {
        name: "加班时长（人均）",
        value: "加班时长（人均）",
        validate: {
          required: true,
          decimal: 0
        }
      }, {
        name: "研发人员加班时长（人均）",
        value: "研发人员加班时长（人均）",
        validate: {
          required: true,
          decimal: 0
        }
      }]
    };
  },
  created() {
    let curMonth = this.curMonth = new Date().getFullYear() + "-" + (new Date().getMonth() + 1);
  },
  methods: {
    parseData() {

    },
    onInputChange(company, key) {

    },
    prepareDataToRequest(isSubmitted) {
      let vm = this;
      let data = { name: REQUEST_KEY, month: this.curMonth, value: {} };
      data.value.isSubmitted = !!isSubmitted;
      this.companies.forEach(comp => {
        data.value[comp.key] = {};
        Object.keys(comp.data).forEach(key => {
          data.value[comp.key][key] = comp.data[key] ? Number(comp.data[key]) : 0;
        });
      });
      return data;
    },
    save() {
      let vm = this;
      let saveTable = function(data) {
        let promise = null;
        let _dataToSend = {
          month: data.month,
          value: JSON.stringify(data.value)
        };
        if(vm.$props.requestId) {
          promise = DashboardApi.updateStatistics(vm.$props.requestId, _dataToSend);
        } else {
          promise = DashboardApi.addStatistics(_dataToSend);
        }
        
        promise.then(res => {
          Noty.notifySuccess({ text: '保存数据成功！' });
          vm.$emit('submitted');
        }, err => {
          Noty.notifyError({ text: '保存数据失败！' });
        });
      };
      let dataToSend = this.prepareDataToRequest(false);
      saveTable(dataToSend);
    },
    submit() {
      let vm = this;
      let saveTable = function(data) {
        let promise = null;
        let _dataToSend = {
          month: data.month,
          value: JSON.stringify(data.value)
        };
        if(vm.$props.requestId) {
          promise = DashboardApi.updateStatistics(vm.$props.requestId, _dataToSend);
        } else {
          promise = DashboardApi.addStatistics(_dataToSend);
        }

        promise.then(res => {
          Noty.notifySuccess({ text: '提交数据成功！' });
          vm.$emit('submitted');
        }, err => {
          Noty.notifyError({ text: '提交数据失败！' });
        });
      };
      let dataToSend = this.prepareDataToRequest(true);
      saveTable(dataToSend);
    },
    cancel() {
      this.$emit('cancel');
    }
  }
}
