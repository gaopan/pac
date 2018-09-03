
function findDataWithKeyPrefixs(keyPrefixs, data){
  let _data = [];
  let parent = data;
  do {
    let keyPrefix = keyPrefixs[0];
    p
  } while(keyPrefixs.length);
  return _data;
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
            numeric: true
          }
        }, {
          key: '合格里程',
          name: '合格里程',
          validate: {
            required: true,
            numeric: true
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
            decimal: true
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
          validate: {
            required: true
          }
        }, {
          key: '错误发生率',
          name: '错误发生率',
          validate: {
            required: true,
            decimal: true
          }
        }, {
          key: '错误发生率标准',
          name: '错误发生率标准',
          validate: {
            required: true,
            decimal: true
          }
        }, {
          key: '错误流出率',
          name: '错误流出率',
          validate: {
            required: true,
            decimal: true
          }
        }, {
          key: '错误流出率标准',
          name: '错误流出率标准',
          validate: {
            required: true,
            decimal: true
          }
        }]
      }]
    }]
  }
};
// quality.adapt = function(remoteData){
//   let data = {up: [], down: []};
//   let upDataKeys = ["外业批次", "区域", "总里程", "合格里程", "合格率", "对策", "合格标准"];
//   let upDataKeyPrefixs = ["外业合格率", "批次"]: 
//   let downDataKeys = ["错误发生率", "错误发生率标准", "错误流出率", "错误流出率标准"];
//   let downDataKeyPrefixs = ["内业错误率", "类型"];



// };

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
          numeric: true
        }
      }, {
        key: "总公里数",
        name: "总公里数（公里）",
        validate: {
          required: true,
          numeric: true
        }
      }, {
        key: "市区成本",
        name: "市区成本（元/公里）",
        validate: {
          required: true,
          numeric: true
        }
      }, {
        key: "市区成本目标",
        name: "市区成本目标（元/公里）",
        validate: {
          required: true,
          numeric: true
        }
      }, {
        key: "高速成本目标",
        name: "高速成本目标（元/公里）",
        validate: {
          required: true,
          numeric: true
        }
      }, {
        key: "高速成本目标",
        name: "高速成本目标（元/公里）",
        validate: {
          required: true,
          numeric: true
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
          numeric: true
        }
      }, {
        key: "总公里数",
        name: "总公里数（公里）",
        validate: {
          required: true,
          numeric: true
        }
      }, {
        key: "成本",
        name: "成本（元/公里）",
        validate: {
          required: true,
          numeric: true
        }
      }, {
        key: "成本目标",
        name: "成本目标（元/公里）",
        validate: {
          required: true,
          numeric: true
        }
      }, {
        key: '备注',
        name: '备注',
        texteara: true,
        validate: {}
      }]
    }]
  }
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
          numeric: true
        }
      }, {
        key: "硕士人数",
        name: "硕士人数",
        validate: {
          required: true,
          numeric: true
        }
      }, {
        key: "本科人数",
        name: "本科人数",
        validate: {
          required: true,
          numeric: true
        }
      }, {
        key: "大专及以下人数",
        name: "大专及以下人数",
        validate: {
          required: true,
          numeric: true
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
          numeric: true
        }
      }, {
        key: "在职人数",
        name: "在职人数",
        validate: {
          required: true,
          numeric: true
        }
      }, {
        key: "本月预计到岗人数",
        name: "本月预计到岗人数",
        validate: {
          required: true,
          numeric: true
        }
      }, {
        key: "本月实际到岗人数",
        name: "本月实际到岗人数",
        validate: {
          required: true,
          numeric: true
        }
      }, {
        key: '备注',
        name: '备注',
        texteara: true,
        validate: {}
      }]
    }]
  }
};

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
  }
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
          numeric: true
        }
      }, {
        key: "存款",
        name: "存款",
        validate: {
          required: true,
          numeric: true
        }
      }, {
        key: "理财",
        name: "理财",
        validate: {
          required: true,
          numeric: true
        }
      }, {
        key: "状态",
        name: "状态",
        validate: {
          required: true,
          numeric: true
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
        key: '备注',
        name: '备注',
        texteara: true,
        validate: {}
      }, {
        key: "类型列表",
        name: '类型',
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
          validate: {
            required: true
          }
        }, {
          key: "状态",
          name: "状态",
          validate: {
            required: true
          }
        }]
      }]
    }]
  }
};

let respond = {
  icon: 'icon-zap',
  name: '响应',
  key: 'respond',
  editConfig: {
    tables: [],
    fields: [{
      name: '月份',
      key: 'month',
      type: 'current_month'
    }, {
      key: "status",
      name: "状态",
      select: true,
      options: [{ name: "黄色", value: 'y' }, { name: "红色", value: 'r' }, { name: "绿色", value: 'g' }]
    }, {
      key: "项目详细",
      name: "项目详细",
      list: true,
      fields: [{
        key: "项目",
        name: "项目",
        validate: {
          required: true
        }
      }, {
        key: "实施",
        name: "实施",
        list: true,
        fields: [{
          key: "实施情况",
          name: "实施情况",
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
    }],

  }
};

let leadership = {
  icon: 'icon-crosshair',
  name: '领导关注和支持事项',
  key: 'leadership',
  editConfig: {
    tables: [],
    fields: [{
      name: '月份',
      key: 'month',
      type: 'current_month'
    }, {
      key: "status",
      name: "状态",
      select: true,
      options: [{ name: "黄色", value: 'y' }, { name: "红色", value: 'r' }, { name: "绿色", value: 'g' }]
    }, {
      key: "事项",
      name: "事项",
      list: true,
      fields: [{
        key: "事项",
        name: "事项",
        validate: {
          required: true
        }
      }, {
        key: "内容",
        name: "内容",
        texteara: true,
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
  }
};

modules.push(quality);
modules.push(cost);
modules.push(hr);
modules.push(safty);
modules.push(operation);
modules.push(respond);
modules.push(leadership);

export default modules
