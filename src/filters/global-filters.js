import CommonConverter from '@/utils/common-converter.js'
import TypeChecker from '@/utils/type-checker.js'
import Internationalization from '@/utils/internationalization.js'

export default {
  beforeTime: function(time) {
    if (!TypeChecker.isNumber(time)) return 'N/A';
    return CommonConverter.convertSecondToStr((new Date().getTime() - time) / 1000, 0, true);
  },
  bigCount: function(count){
  	if(!TypeChecker.isNumber(count)) return 'N/A';
  	return CommonConverter.convertBigCountToStr(count, 1);
  },
  internationalize: function(key){
  	return Internationalization.translate(key);
  }
}
