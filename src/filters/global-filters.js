import CommonConverter from '@/utils/common-converter.js'
import TypeChecker from '@/utils/type-checker.js'
import Internationalization from '@/utils/internationalization.js'

let projStatusOptions = [{
  name: "正在进行",
  value: "InProgress"
}, {
  name: "已经完成",
  value: "Completed"
}]

export default {
  beforeTime: function(time) {
    if (!TypeChecker.isNumber(time)) return 'N/A';
    return CommonConverter.convertSecondToStr((new Date().getTime() - time) / 1000, 0, true);
  },
  bigCount: function(count) {
    if (!TypeChecker.isNumber(count)) return 'N/A';
    return CommonConverter.convertBigCountToStr(count, 1);
  },
  internationalize: function(key) {
    return Internationalization.translate(key);
  },
  projectStatus: function(key) {
    let name = projStatusOptions[0].name;
    projStatusOptions.every(opt => {
      if (opt.value == key) {
        name = opt.name;
        return false;
      }
      return true;
    });
    return name;
  }
}
