import TypeChecker from '@/utils/type-checker.js'

let dataAdapter = {};

dataAdapter.buildFullOriginData = function(data, arrKey, mainKey, originObj) {
  let valueKeys = [];

  data.forEach(function(d){
    if (!TypeChecker.isArray(d[arrKey])) {
      d[arrKey] = [];
    }else {
      d[arrKey].forEach(function(v){ valueKeys.indexOf(v[mainKey]) === -1 && valueKeys.push(v[mainKey]) });
    }
  });

  data.forEach(function(d){
    let lackKeys = valueKeys.concat();

    d[arrKey].forEach(function(v){
      let i = lackKeys.indexOf(v[mainKey]);
      if (i !== -1) lackKeys.splice(i, 1);
    });

    lackKeys.forEach(function(key){
      let obj = Object.assign({}, originObj);
      obj[mainKey] = key;
      d[arrKey].push(obj);
    });
  });

  return data;
};

export default dataAdapter;