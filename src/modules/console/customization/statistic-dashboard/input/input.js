import DashboardApi from '@/api/customization/dashboard.js'
import CommonUtils from '@/utils/common-utils.js'
import TypeChecker from '@/utils/type-checker.js'
import Noty from '@/utils/noty-operation.js'
import shared from '@/shared.js'
import CommonGenerators from '@/utils/common-generators.js'

let UUIDGenerator = CommonGenerators.UUIDGenerator

let eventHub = shared.eventHub
export default {
  data() {
    return {
      data: {
        formData: {}
      },
      keys: [{
        name: '企业员工人数',
        value: 'qyygrs',
        default: 0,
        validate: {
          required: true,
          decimal: 2
        }
      }, {
        name: "研发人员人数",
        value: "yfryrs",
        default: 0,
        validate: {
          required: true,
          decimal: 2
        }
      }, {
        name: "法定工作总时长",
        value: "fdgzzsc",
        default: 0,
        validate: {
          required: true,
          decimal: 2
        }
      }, {
        name: "研发人员法定工作总时长",
        value: "yfryfdgzzsc",
        default: 0,
        validate: {
          required: true,
          decimal: 2
        }
      }, {
        name: "实际工作时长",
        value: "sjgzsc",
        default: 0,
        validate: {
          required: true,
          decimal: 2
        }
      }, {
        name: "研发人员实际工作时长",
        value: "yfrysjgzsc",
        default: 0,
        validate: {
          required: true,
          decimal: 2
        }
      }, {
        name: "加班总时长",
        value: "jbzsc",
        default: 0,
        validate: {
          required: true,
          decimal: 2
        }
      }, {
        name: "研发人员加班总时长",
        value: "yfryjbzsc",
        default: 0,
        validate: {
          required: true,
          decimal: 2
        }
      }, {
        name: "法定工作时长（人均）",
        value: "fdgzscrj",
        default: 0,
        // disabled: false,
        disabled: true,
        validate: {
          required: true,
          decimal: 2
        }
      }, {
        name: "研发人员法定工作时长（人均）",
        value: "yfryfdgzscrj",
        default: 0,
        // disabled: false,
        disabled: true,
        validate: {
          required: true,
          decimal: 2
        }
      }, {
        name: "实际工作时长（人均）",
        value: "sjgzscrj",
        default: 0,
        // disabled: false,
        disabled: true,
        validate: {
          required: true,
          decimal: 2
        }
      }, {
        name: "研发人员实际工作时长（人均）",
        value: "yfrysjgzscrj",
        default: 0,
        // disabled: false,
        disabled: true,
        validate: {
          required: true,
          decimal: 2
        }
      }, {
        name: "加班时长（人均）",
        value: "jbscrj",
        default: 0,
        // disabled: false,
        disabled: true,
        validate: {
          required: true,
          decimal: 2
        }
      }, {
        name: "研发人员加班时长（人均）",
        value: "yfryjbscrj",
        default: 0,
        // disabled: false,
        disabled: true,
        validate: {
          required: true,
          decimal: 2
        }
      }]
    };
  },
  created() {
    this.user = this.$store.getters.userProfile;
    eventHub.$on("global-date", this.onGlobalDateChange);
    this.companyId = Number(this.$router.currentRoute.params.companyId);
    let globalDate = new Date(localStorage.getItem("global-date")) || new Date();
    this.curMonth = globalDate.getFullYear() + "-" + (globalDate.getMonth() + 1);
    this.refresh();
  },
  beforeDestroy() {
    eventHub.$off("global-date", this.onGlobalDateChange);
  },
  methods: {
    onGlobalDateChange(newDate) {
      let theDate = new Date(newDate);
      this.curMonth = theDate.getFullYear() + '-' + (theDate.getMonth() + 1);
      this.refresh();
    },
    refresh() {
      let curMonthData = null;
      let statPromise = DashboardApi.getStatisticsByCompanyId(this.companyId);
      delete this.data.id;
      let _formData = {};
      this.keys.forEach(key => {
        if (TypeChecker.isUndefined(_formData[key.value])) {
          _formData[key.value] = key.default;
        }
      });
      this.data.formData = _formData;

      statPromise.then(res => {
        let stats = res.data;
        curMonthData = stats.filter(stat => stat.month == this.curMonth);
        curMonthData = curMonthData.length > 0 ? curMonthData[0] : null;
        this.data.companyId = this.companyId;
        this.data.month = this.curMonth;
        if (curMonthData) {
          this.data.id = curMonthData.id;
          let formData = null;
          try {
            formData = JSON.parse(curMonthData.value);
          } catch (err) {
            console.log(err);
          }
          if (formData) {
            this.keys.forEach(key => {
              if (TypeChecker.isUndefined(formData[key.value])) {
                formData[key.value] = key.default;
              }
            });
            this.data.formData = formData;
          }
        }
      });

    },
    parseData() {

    },
    onInputChange(key) {

    },
    prepareDataToRequest() {
      let vm = this,
          data = { companyId: this.companyId, month: this.curMonth, value: {} },
          formData = this.data.formData;

      if (this.data.id) {
        data.id = this.data.id;
      }

      Object.keys(formData).forEach(key => {     
        switch(key){
          case 'fdgzscrj': 
            data.value[key] = this.validateNumber(formData['fdgzzsc']/(formData['yfryrs']));
            break;
          case 'yfryfdgzscrj':
            data.value[key] = this.validateNumber(formData['yfryfdgzzsc']/(formData['yfryrs']));
            break;
          case 'sjgzscrj':
            data.value[key] = this.validateNumber(formData['sjgzsc']/(formData['qyygrs']));
            break;
          case 'yfrysjgzscrj':
            data.value[key] = this.validateNumber(formData['yfrysjgzsc']/(formData['yfryrs']));
            break;
          case 'jbscrj':
            data.value[key] = this.validateNumber(formData['jbzsc']/(formData['qyygrs']));
            break;
          case 'yfryjbscrj':
            data.value[key] = this.validateNumber(formData['yfryjbzsc']/(formData['yfryrs']));
            break;
          default:
            data.value[key] = this.data.formData[key] ? Number(this.data.formData[key]) : 0;
        }

      });
      console.log(data);
      return data;
    },
    validateNumber(num){
      num = {}.toString.call(num) === "[object Number]" ? num : parseInt(num);
      return !isFinite(num)||isNaN(num) ? 0 : +(num.toFixed(1));
    },
    request(type) {
      let req = null,
        name = null,
        dataToSend = this.prepareDataToRequest();
      if (type == "save") {
        name = "保存";
      } else if (type == "submit") {
        dataToSend.value.isSubmitted = true;
        name = "提交";
      } else if (type == "approve") {
        dataToSend.value.isApproved = true;
        name = "保存";
      } else if (type == "reject") {
        dataToSend.value.isSubmitted = false;
        dataToSend.value.isApproved = false;
        name = "保存";
      } else if (type == "withdraw") {
        dataToSend.value.isSubmitted = false;
        dataToSend.value.isApproved = false;
        name = "保存";
      }

      let promise = null;
      let _dataToSend = {
        companyId: dataToSend.companyId,
        month: dataToSend.month,
        value: JSON.stringify(dataToSend.value)
      };
      if (dataToSend.id) {
        promise = DashboardApi.updateStatistics(dataToSend.id, _dataToSend);
      } else {
        promise = DashboardApi.addStatistics(_dataToSend);
      }

      promise.then(res => {
        Noty.notifySuccess({ text: `${name}数据成功！` });
        this.refresh();
      }, err => {
        Noty.notifyError({ text: `${name}数据失败！` });
      });
    }
  }
}
