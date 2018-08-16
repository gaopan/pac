import TypeChecker from '@/utils/type-checker.js'
import Noty from '@/utils/noty-operation.js'

export default {
  handleApiRequestError(err) {
    if (TypeChecker.isObject(err.response) && TypeChecker.isObject(err.response.data) && TypeChecker.isString(err.response.data.message)) {
      if(err.response.data.code == 1122) {
      	Noty.notifyError({text: 'There are no cases in this process'});
      } else {
      	Noty.notifyError({text: err.response.data.message});
      }
    } else {
      Noty.notifyError({text: err.message});
    }
  }
}
