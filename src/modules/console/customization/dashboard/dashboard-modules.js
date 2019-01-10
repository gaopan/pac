import TypeChecker from '@/utils/type-checker.js'

function findDataWithKeyPrefixs(keyPrefixs, data) {
  let _data = data,
    _keyPrefixs = keyPrefixs.slice();
  while (_keyPrefixs.length && TypeChecker.isObject(_data)) {
    let keyPrefix = _keyPrefixs[0];
    _data = _data[keyPrefix];
    _keyPrefixs.splice(0, 1);
  }
  return _data;
}

function findArrayDataWithKeyPrefixs(keyPrefixs, data) {
  let _data = findDataWithKeyPrefixs(keyPrefixs, data);
  return TypeChecker.isArray(_data) ? _data : [];
}

function findObjectDataWithKeyPrefixs(keyPrefixs, data) {
  let _data = findDataWithKeyPrefixs(keyPrefixs, data);
  return TypeChecker.isObject(_data) ? _data : {};
}

function parseTableData(dataKeyPrefixs, dataKeys, numberDataKeys, month, monthData, distData) {
  let rawData = findArrayDataWithKeyPrefixs(dataKeyPrefixs, monthData);
  let data = [];
  rawData.forEach(d => {
    let item = {};
    dataKeys.forEach(key => {
      if (numberDataKeys.indexOf(key) < 0) {
        item[key] = d[key];
      } else {
        item[key] = Number(d[key]);
      }
    });
    data.push(item);
  });
  distData.push({
    month: month,
    data: data
  });
}

function parseObjectData(dataKeyPrefixs, dataKeys, numberDataKeys, month, monthData, distData) {
  let rawData = findObjectDataWithKeyPrefixs(dataKeyPrefixs, monthData);
  let data = {};
  dataKeys.forEach(key => {
    if (numberDataKeys.indexOf(key) < 0) {
      data[key] = rawData[key];
    } else {
      data[key] = Number(rawData[key]);
    }
  });
  distData.push({
    month: month,
    data: data
  });
}

function parseCommentData(month, monthData, distData) {
  let data = monthData.comments;
  distData.push({
    month: month,
    data: data
  });
}

let modules = [];
let quality = {
  icon: 'icon-aperture',
  name: '质量',
  key: "quality",
  editConfig: {
    fields: [{
      name: '月份',
      key: 'month',
      type: 'current_month'
    }, {
      key: "status",
      name: "状态",
      select: true,
      options: [{ name: "黄色", value: 'y' }, { name: "红色", value: 'r' }, { name: "绿色", value: 'g' }]
    }],
    tables: [{
      name: "外业合格率",
      fields: [{
        key: '备注',
        name: '备注',
        texteara: true,
        validate: {}
      }, {
        key: '批次',
        name: '批次',
        list: true,
        fields: [{
          key: '外业批次',
          name: '外业批次',
          validate: {
            required: true
          }
        }, {
          key: '区域',
          name: '区域',
          validate: {
            required: true
          }
        }, {
          key: '总里程',
          name: '总里程(KM)',
          validate: {
            required: true,
            decimal: 10
          }
        }, {
          key: '合格里程',
          name: '合格里程',
          validate: {
            required: true,
            decimal: 10
          }
        }, {
          key: '对策',
          name: '对策',
          validate: {
            required: true
          }
        }, {
          key: '合格标准',
          name: '合格标准',
          validate: {
            required: true,
            decimal: 10
          }
        }]
      }]
    }, {
      name: "内业错误率",
      fields: [{
        key: '备注',
        name: '备注',
        texteara: true,
        validate: {}
      }, {
        key: "类型",
        name: '类型',
        list: true,
        fields: [{
          key: '类型',
          name: '类型',
          select: true,
          options: [{ name: "路网", value: "路网" }, { name: "地物", value: "地物" }],
          validate: {
            required: true
          }
        }, {
          key: '错误发生率',
          name: '错误发生率',
          validate: {
            required: true,
            decimal: 10
          }
        }, {
          key: '错误发生率标准',
          name: '错误发生率标准',
          validate: {
            required: true,
            decimal: 10
          }
        }, {
          key: '错误流出率',
          name: '错误流出率',
          validate: {
            required: true,
            decimal: 10
          }
        }, {
          key: '错误流出率标准',
          name: '错误流出率标准',
          validate: {
            required: true,
            decimal: 10
          }
        }]
      }]
    }]
  },
  dashboardConfig: {
    width: { xs: 6 },
    height: { xs: 12 },
    transform: { xs: { x: 0, y: 0 } },
    type: 'QualityChart',
    title: '质量',
    allowScroll: true
  }
};
quality.dashboardConfig.adaptData = function(remoteData, months) {
  let data = {
    up: [],
    down: [],
    table: { list: [] },
    comments: [],
    module: {
      name: '质量',
      key: "quality",
      monthData: remoteData
    }
  };
  let upDataKeys = ["外业批次", "区域", "总里程", "合格里程", "合格率", "对策", "合格标准"];
  let upDataNumberKeys = ["总里程", "合格里程", "合格率", "合格标准"];
  let upDataKeyPrefixs = ["外业合格率", "批次"];
  let downDataKeys = ["类型", "错误发生率", "错误发生率标准", "错误流出率", "错误流出率标准"];
  let downDataNumberKeys = ["错误发生率", "错误发生率标准", "错误流出率", "错误流出率标准"];
  let downDataKeyPrefixs = ["内业错误率", "类型"];
  let tableDataKeys = ["外业批次", "区域", "总里程", "合格里程", "合格率", "对策", "合格标准"];
  let tableDataNumberKeys = ["总里程", "合格里程", "合格率", "合格标准"];
  let tableDataKeyPrefixs = ["外业合格率", "批次"];
  data.table.headers = [
    { key: "外业批次", name: "外业批次", width: "10%" },
    { key: "区域", name: "区域", width: "10%" },
    { key: "总里程", name: "总里程", width: "10%" },
    { key: "合格里程", name: "合格里程", width: "10%" },
    { key: "合格率", name: "合格率", width: "10%" },
    { key: "合格标准", name: "合格标准", width: "10%" },
    { key: "对策", name: "对策", width: "40%" }
  ];

  if (!remoteData) return data;

  months.forEach(m => {
    let month = m;
    if (m.indexOf('-') < 0) month = new Date().getFullYear() + '-' + m;
    let monthData = remoteData[m];
    parseCommentData(month, monthData, data.comments);
    parseTableData(tableDataKeyPrefixs, tableDataKeys, tableDataNumberKeys, month, monthData, data.table.list);
    parseTableData(upDataKeyPrefixs, upDataKeys, upDataNumberKeys, month, monthData, data.up);
    parseTableData(downDataKeyPrefixs, downDataKeys, downDataNumberKeys, month, monthData, data.down);
  });
  console.log(data);
  return data;
};

let cost = {
  icon: 'icon-box',
  name: '成本',
  key: 'cost',
  editConfig: {
    fields: [{
      name: '月份',
      key: 'month',
      type: 'current_month'
    }, {
      key: "status",
      name: "状态",
      select: true,
      options: [{ name: "黄色", value: 'y' }, { name: "红色", value: 'r' }, { name: "绿色", value: 'g' }]
    }],
    tables: [{
      name: "外业成本",
      fields: [{
        key: "总成本",
        name: "总成本（元）",
        validate: {
          required: true,
          decimal: 10
        }
      }, {
        key: "总公里数",
        name: "总公里数（公里）",
        validate: {
          required: true,
          decimal: 10
        }
      }, {
        key: "市区成本",
        name: "市区成本（元/公里）",
        validate: {
          required: true,
          decimal: 10
        }
      }, {
        key: "市区成本目标",
        name: "市区成本目标（元/公里）",
        validate: {
          required: true,
          decimal: 10
        }
      }, {
        key: "高速成本",
        name: "高速成本（元/公里）",
        validate: {
          required: true,
          decimal: 10
        }
      }, {
        key: "高速成本目标",
        name: "高速成本目标（元/公里）",
        validate: {
          required: true,
          decimal: 10
        }
      }, {
        key: '备注',
        name: '备注',
        texteara: true,
        validate: {}
      }]
    }, {
      name: "内业成本",
      fields: [{
        key: "总成本",
        name: "总成本（元）",
        validate: {
          required: true,
          decimal: 10
        }
      }, {
        key: "总公里数",
        name: "总公里数（公里）",
        validate: {
          required: true,
          decimal: 10
        }
      }, {
        key: "成本",
        name: "成本（元/公里）",
        validate: {
          required: true,
          decimal: 10
        }
      }, {
        key: "成本目标",
        name: "成本目标（元/公里）",
        validate: {
          required: true,
          decimal: 10
        }
      }, {
        key: '备注',
        name: '备注',
        texteara: true,
        validate: {}
      }]
    }]
  },
  dashboardConfig: {
    width: { xs: 6 },
    height: { xs: 12 },
    transform: { xs: { x: 6, y: 0 } },
    type: 'CostChart',
    title: '成本',
    allowScroll: true
  }
};
cost.dashboardConfig.adaptData = function(remoteData, months) {
  let data = {
    comments: [],
    module: {
      name: '成本',
      key: "cost",
      monthData: remoteData
    }
  };
  let upData = data['内业'] = [],
    downData = data['外业'] = [];
  let upDataKeys = ["总成本", "总公里数", "成本", "成本目标", "备注"];
  let upDataNumberKeys = ["总成本", "总公里数", "成本", "成本目标"];
  let upDataKeyPrefixs = ["内业成本"];
  let downDataKeys = ["总成本", "总公里数", "市区成本目标", "高速成本目标", "市区成本", "高速成本"];
  let downDataNumberKeys = ["总成本", "总公里数", "市区成本目标", "高速成本目标", "市区成本", "高速成本"];
  let downDataKeyPrefixs = ["外业成本"];

  if (!remoteData) return data;

  months.forEach(m => {
    let month = m;
    if (m.indexOf('-') < 0) month = new Date().getFullYear() + '-' + m;
    let monthData = remoteData[m];
    parseCommentData(month, monthData, data.comments);
    parseObjectData(upDataKeyPrefixs, upDataKeys, upDataNumberKeys, month, monthData, upData);
    parseObjectData(downDataKeyPrefixs, downDataKeys, downDataNumberKeys, month, monthData, downData);
  });
  return data;
};

let hr = {
  icon: 'icon-users',
  name: '人力资源',
  key: 'hr',
  editConfig: {
    fields: [{
      name: '月份',
      key: 'month',
      type: 'current_month'
    }, {
      key: "status",
      name: "状态",
      select: true,
      options: [{ name: "黄色", value: 'y' }, { name: "红色", value: 'r' }, { name: "绿色", value: 'g' }]
    }],
    tables: [{
      name: "学历构成",
      fields: [{
        key: "博士人数",
        name: "博士人数",
        validate: {
          required: true,
          decimal: 10
        }
      }, {
        key: "硕士人数",
        name: "硕士人数",
        validate: {
          required: true,
          decimal: 10
        }
      }, {
        key: "本科人数",
        name: "本科人数",
        validate: {
          required: true,
          decimal: 10
        }
      }, {
        key: "大专及以下人数",
        name: "大专及以下人数",
        validate: {
          required: true,
          decimal: 10
        }
      }, {
        key: '备注',
        name: '备注',
        texteara: true,
        validate: {}
      }]
    }, {
      name: "招聘情况",
      fields: [{
        key: "全年计划人数",
        name: "全年计划人数",
        validate: {
          required: true,
          decimal: 10
        }
      }, {
        key: "在职人数",
        name: "在职人数",
        validate: {
          required: true,
          decimal: 10
        }
      }, {
        key: "本月预计到岗人数",
        name: "本月预计到岗人数",
        validate: {
          required: true,
          decimal: 10
        }
      }, {
        key: "本月实际到岗人数",
        name: "本月实际到岗人数",
        validate: {
          required: true,
          decimal: 10
        }
      }, {
        key: '备注',
        name: '备注',
        texteara: true,
        validate: {}
      }]
    }]
  },
  dashboardConfig: {
    width: { xs: 6 },
    height: { xs: 12 },
    transform: { xs: { x: 0, y: 12 } },
    type: 'HrChart',
    title: '人力资源',
    allowScroll: true
  }
};
hr.dashboardConfig.adaptData = function(remoteData, months) {
  let data = {
    comments: [],
    module: {
      name: '人力资源',
      key: "hr",
      monthData: remoteData
    }
  };
  let upData = data['degree'] = [],
    downData = data['recruit'] = [];
  let upDataKeys = ["博士人数", "硕士人数", "本科人数", "大专及以下人数", "备注"];
  let upDataNumberKeys = ["博士人数", "硕士人数", "本科人数", "大专及以下人数"];
  let upDataKeyPrefixs = ["学历构成"];
  let downDataKeys = ["全年计划人数", "在职人数", "本月预计到岗人数", "本月实际到岗人数", "备注"];
  let downDataNumberKeys = ["全年计划人数", "在职人数", "本月预计到岗人数", "本月实际到岗人数"];
  let downDataKeyPrefixs = ["招聘情况"];

  if (!remoteData) return data;

  months.forEach(m => {
    let month = m;
    if (m.indexOf('-') < 0) month = new Date().getFullYear() + '-' + m;
    let monthData = remoteData[m];
    parseCommentData(month, monthData, data.comments);
    parseObjectData(upDataKeyPrefixs, upDataKeys, upDataNumberKeys, month, monthData, upData);
    parseObjectData(downDataKeyPrefixs, downDataKeys, downDataNumberKeys, month, monthData, downData);
  });
  return data;
}

let safty = {
  icon: 'icon-alert-triangle',
  name: '安全',
  key: 'safty',
  editConfig: {
    fields: [{
      name: '月份',
      key: 'month',
      type: 'current_month'
    }, {
      key: "status",
      name: "状态",
      select: true,
      options: [{ name: "黄色", value: 'y' }, { name: "红色", value: 'r' }, { name: "绿色", value: 'g' }]
    }],
    tables: [{
      name: "安全详细",
      fields: [{
        name: '安全事项',
        key: '安全事项',
        list: true,
        fields: [{
          key: "序号",
          name: "序号",
          validate: {
            required: true
          }
        }, {
          key: "内容",
          name: "内容",
          validate: {
            required: true
          }
        }, {
          key: "责任人",
          name: "责任人",
          validate: {
            required: true
          }
        }, {
          key: "实施措施",
          name: "实施措施",
          texteara: true,
          validate: {
            required: true
          }
        }, {
          key: "状态",
          name: "状态",
          validate: {
            required: true
          }
        }, {
          key: '备注',
          name: '备注',
          texteara: true,
          validate: {}
        }]
      }]
    }]
  },
  dashboardConfig: {
    width: { xs: 6 },
    height: { xs: 12 },
    transform: { xs: { x: 6, y: 12 } },
    type: 'TableChart',
    title: '安全',
    allowScroll: true
  }
};
safty.dashboardConfig.adaptData = function(remoteData, months) {
  let data = {
    comments: [],
    module: {
      name: '安全',
      key: "safty",
      monthData: remoteData
    }
  };
  data.headers = [{
    key: "序号",
    name: "序号",
    width: "10%"
  }, {
    key: "内容",
    name: "内容",
    width: "20%"
  }, {
    key: "责任人",
    name: "责任人",
    width: "10%"
  }, {
    key: "实施措施",
    name: "实施措施",
    width: "20%"
  }, {
    key: "状态",
    name: "状态",
    width: "20%"
  }, {
    key: "备注",
    name: "备注",
    width: "20%"
  }];
  let list = data.list = [];
  let dataKeys = ["序号", "内容", "责任人", "实施措施", "状态", "备注"];
  let dataNumberKeys = [];
  let dataKeyPrefixs = ["安全详细", "安全事项"];

  if (!remoteData) return data;

  months.forEach(m => {
    let month = m;
    if (m.indexOf('-') < 0) month = new Date().getFullYear() + '-' + m;
    let monthData = remoteData[m];
    parseCommentData(month, monthData, data.comments);
    parseTableData(dataKeyPrefixs, dataKeys, dataNumberKeys, month, monthData, list);
  });
  return data;
};

let operation = {
  icon: 'icon-server',
  name: '运营情况',
  key: 'operation',
  editConfig: {
    fields: [{
      name: '月份',
      key: 'month',
      type: 'current_month'
    }, {
      key: "status",
      name: "状态",
      select: true,
      options: [{ name: "黄色", value: 'y' }, { name: "红色", value: 'r' }, { name: "绿色", value: 'g' }]
    }],
    tables: [{
      name: "现金流",
      fields: [{
        key: "活期",
        name: "活期",
        validate: {
          required: true,
          decimal: 10
        }
      }, {
        key: "存款",
        name: "存款",
        validate: {
          required: true,
          decimal: 10
        }
      }, {
        key: "理财",
        name: "理财",
        validate: {
          required: true,
          decimal: 10
        }
      }, {
        key: "状态",
        name: "状态",
        validate: {
          required: true
        }
      }, {
        key: '备注',
        name: '备注',
        texteara: true,
        validate: {}
      }]
    }, {
      name: "运营表格",
      fields: [{
        key: "运营事项",
        name: '运营事项',
        list: true,
        fields: [{
          key: "内容",
          name: "内容",
          validate: {
            required: true
          }
        }, {
          key: "实施情况",
          name: "实施情况",
          texteara: true,
          validate: {
            required: true
          }
        }, {
          key: "状态",
          name: "状态",
          validate: {
            required: true
          }
        }, {
          key: '备注',
          name: '备注',
          texteara: true,
          validate: {}
        }]
      }]
    }]
  },
  dashboardConfig: {
    width: { xs: 6 },
    height: { xs: 12 },
    transform: { xs: { x: 0, y: 24 } },
    type: 'TableChart',
    title: '运营情况',
    allowScroll: true
  }
};
operation.dashboardConfig.adaptData = function(remoteData, months) {
  let data = {
    comments: [],
    module: {
      name: '运营情况',
      key: "operation",
      monthData: remoteData
    }
  };
  data.headers = [{
    key: "内容",
    name: "内容",
    width: "25%"
  }, {
    key: "实施情况",
    name: "实施情况",
    width: "25%"
  }, {
    key: "状态",
    name: "状态",
    width: "25%"
  }, {
    key: "备注",
    name: "备注",
    width: "25%"
  }];
  let list = data.list = [];
  let dataKeys = ["内容", "实施情况", "状态", "备注"];
  let dataNumberKeys = [];
  let dataKeyPrefixs = ["运营表格", "运营事项"];

  if (!remoteData) return data;

  months.forEach(m => {
    let month = m;
    if (m.indexOf('-') < 0) month = new Date().getFullYear() + '-' + m;
    let monthData = remoteData[m];
    parseCommentData(month, monthData, data.comments);
    parseTableData(dataKeyPrefixs, dataKeys, dataNumberKeys, month, monthData, list);
  });
  return data;
};

let respond = {
  icon: 'icon-zap',
  name: '响应',
  key: 'respond',
  editConfig: {
    fields: [{
      name: '月份',
      key: 'month',
      type: 'current_month'
    }, {
      key: "status",
      name: "状态",
      select: true,
      options: [{ name: "黄色", value: 'y' }, { name: "红色", value: 'r' }, { name: "绿色", value: 'g' }]
    }],
    tables: [{
      name: "项目详细",
      fields: [{
        key: "实施",
        name: "实施",
        list: true,
        fields: [{
          key: "项目",
          name: "项目",
          validate: {
            required: true
          }
        }, {
          key: "实施情况",
          name: "实施情况",
          texteara: true,
          validate: {
            required: true
          }
        }, {
          key: "状态",
          name: "状态",
          validate: {
            required: true
          }
        }, {
          key: '备注',
          name: '备注',
          texteara: true,
          validate: {}
        }]
      }]
    }]
  },
  dashboardConfig: {
    width: { xs: 6 },
    height: { xs: 12 },
    transform: { xs: { x: 6, y: 24 } },
    type: 'TableChart',
    title: '响应',
    allowScroll: true
  }
};
respond.dashboardConfig.adaptData = function(remoteData, months) {
  let data = {
    comments: [],
    module: {
      name: '响应',
      key: "respond",
      monthData: remoteData
    }
  };
  data.headers = [{
    key: "项目",
    name: "项目",
    width: "25%"
  }, {
    key: "实施情况",
    name: "实施情况",
    width: "25%"
  }, {
    key: "状态",
    name: "状态",
    width: "25%"
  }, {
    key: "备注",
    name: "备注",
    width: "25%"
  }];
  let list = data.list = [];
  let dataKeys = ["项目", "实施情况", "状态", "备注"];
  let dataNumberKeys = [];
  let dataKeyPrefixs = ["项目详细", "实施"];

  if (!remoteData) return data;

  months.forEach(m => {
    let month = m;
    if (m.indexOf('-') < 0) month = new Date().getFullYear() + '-' + m;
    let monthData = remoteData[m];
    parseCommentData(month, monthData, data.comments);
    parseTableData(dataKeyPrefixs, dataKeys, dataNumberKeys, month, monthData, list);
  });
  return data;
};

// let leadership = {
//   icon: 'icon-crosshair',
//   name: '领导关注和支持事项',
//   key: 'leadership',
//   editConfig: {
//     tables: [],
//     fields: [{
//       name: '月份',
//       key: 'month',
//       type: 'current_month'
//     }, {
//       key: "status",
//       name: "状态",
//       select: true,
//       options: [{ name: "黄色", value: 'y' }, { name: "红色", value: 'r' }, { name: "绿色", value: 'g' }]
//     }, {
//       key: "事项",
//       name: "事项",
//       list: true,
//       fields: [{
//         key: "事项",
//         name: "事项",
//         validate: {
//           required: true
//         }
//       }, {
//         key: "内容",
//         name: "内容",
//         texteara: true,
//         validate: {
//           required: true
//         }
//       }, {
//         key: '备注',
//         name: '备注',
//         texteara: true,
//         validate: {}
//       }]
//     }]
//   }
// };

modules.push(quality);
modules.push(cost);
modules.push(hr);
modules.push(safty);
modules.push(operation);
modules.push(respond);
// modules.push(leadership);

export default modules
