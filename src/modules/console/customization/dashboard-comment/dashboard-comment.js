import Noty from '@/utils/noty-operation.js'
import DashboardApi from '@/api/customization/dashboard.js'
import CommonUtils from '@/utils/common-utils.js'

export default {
  data() {
    return {
      curMonth: new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + "",
      data: []
    };
  },
  props: {
    module: {
      type: Object,
      required: true
    },
    comments: {
      type: Array,
      required: true
    }
  },
  created() {
    let curMonth = this.curMonth;
    this.companyId = this.$router.currentRoute.params.company.substr(this.$router.currentRoute.params.company.lastIndexOf('_') + 1);
    this.data = this.$props.comments.slice();
    if (this.data.filter(item => item.month == curMonth) < 1) {
      this.data.push({
        month: curMonth,
        content: ""
      });
    }
    this.data.sort((a, b) => {
      let arrA = a.month.split('-'),
        arrB = b.month.split('-');
      let yearA = Number(arrA[0]),
        monthA = Number(arrA[1]),
        yearB = Number(arrB[0]),
        monthB = Number(arrB[1]);
      if (yearA < yearB) {
        return true;
      } else if (yearA > yearB) {
        return false;
      } else {
        return monthA < monthB;
      }
    });
  },
  methods: {
    editComment(comment) {
      this.$set(comment, "isEditing", true);
      this.$set(comment, "_content", comment.content);
    },
    cancelEditComment(comment) {
      this.$set(comment, "isEditing", false);
    },
    saveComment(comment) {
      comment.content = comment._content;
      let module = CommonUtils.deepClone(this.$props.module),
        curMonthData = module.monthData[this.curMonth];
      let curMonthComments = this.data.filter(item => item.month == this.curMonth)[0].content;
      curMonthData.comments = curMonthComments;
      let dataToSend = {
        moduleName: module.key,
        value: JSON.stringify(curMonthData)
      };
      DashboardApi.updateModuleByMonth(this.companyId, this.curMonth, dataToSend).then(res => {
        Noty.notifySuccess({ text: "保存数据成功！" });
        this.$set(comment, "isEditing", false);
      }, err => {
        Noty.notifyError({ text: "保存数据失败！" });
      });
    }
  }
}
