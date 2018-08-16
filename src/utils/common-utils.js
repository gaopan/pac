import TypeChecker from './type-checker.js'

function clone(obj) {
  var copy;

  // Handle the 3 simple types, and null or undefined
  if (null == obj || "object" != typeof obj) return obj;

  // Handle Date
  if (obj instanceof Date) {
    copy = new Date();
    copy.setTime(obj.getTime());
    return copy;
  }

  // Handle Array
  if (obj instanceof Array) {
    copy = [];
    for (var i = 0, len = obj.length; i < len; i++) {
      copy[i] = clone(obj[i]);
    }
    return copy;
  }

  // Handle Object
  if (obj instanceof Object) {
    copy = {};
    for (var attr in obj) {
      if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
    }
    return copy;
  }

  throw new Error("Unable to copy obj! Its type isn't supported.");
}

function arrToStr(arr) {
  var res = '[',
    itemArr = [];
  arr.forEach(function(item) {
    if (TypeChecker.isObject(item)) {
      itemArr.push(objToStr(item));
    } else if (TypeChecker.isArray(item)) {
      itemArr.push(arrToStr(item));
    } else {
      itemArr.push(item);
    }
  });
  return res + itemArr.join(',') + ']';
}

function objToStr(obj) {
  var keys = Object.keys(obj);
  keys.sort(function(a, b) {
    return a.localeCompare(b);
  });
  var res = '{',
    fieldArr = [];
  keys.forEach(function(key) {
    if (obj.hasOwnProperty(key)) {
      if (TypeChecker.isObject(obj[key])) {
        fieldArr.push(key + ":" + objToStr(obj[key]));
      } else if (TypeChecker.isArray(obj[key])) {
        fieldArr.push(key + ":" + arrToStr(obj[key]));
      } else {
        fieldArr.push(key + ":" + obj[key]);
      }
    }
  });
  return res + fieldArr.join(',') + '}';
}
function ascendSort_ObjectsInArray(data, key) {
  if (TypeChecker.isArray(data)) {
    data.sort((a, b) => {
      if (!TypeChecker.isUndefined(a[key]) && !TypeChecker.isUndefined(b[key])) {
        if (/^((\d+\.?\d*)|(\d*\.\d+))\%$/.test(a[key])) {
          var A = a[key].substr(0, a[key].length - 1),
            B = b[key].substr(0, b[key].length - 1);
          return Number(A) - Number(B);
        } else if ((typeof a[key]) != "number") {
          return a[key].localeCompare(b[key]);
        } else {
          return a[key] - b[key];
        }
      } else {
        console.warn("no data for ascend sort or some is undefined!")
      }
    });
  }else{
    console.warn("the ordered data should be a array")
  }
}
function descendSort_ObjectsInArray(data, key) {
  if (TypeChecker.isArray(data)) {
    data.sort((a, b) => {
      if (!TypeChecker.isUndefined(a[key]) && !TypeChecker.isUndefined(b[key])) {
        if (/^((\d+\.?\d*)|(\d*\.\d+))\%$/.test(a[key])) {
          var A = a[key].substr(0, a[key].length - 1),
            B = b[key].substr(0, b[key].length - 1);
          return Number(B) - Number(A);
        } else if ((typeof a[key]) != "number") {
          return b[key].localeCompare(a[key]);
        } else {
          return b[key] - a[key];
        }
      } else {
        console.warn("no data for descend sort or some is undefined!")
      }
    });
  }else{
    console.warn("the ordered data should be a array")
  }
}
export default {
  deepClone: clone,
  toString: function(obj) {
    if (!obj) {
      return obj;
    }
    return objToStr(obj);
  },
  ascendSort_ObjectsInArray,
  descendSort_ObjectsInArray,
}
