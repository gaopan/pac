export default {
  prepareModuleToSave(module, curMonth) {
    let _data = { name: module.key, month: curMonth, value: {} };
    module.editConfig.fields.forEach(f => {
      if (f.list) {
        f.value = [];
        f.listData.forEach(d => {
          f.value.push(d);
        });
        _data.value[f.key] = f.value;
      } else {
        _data.value[f.key] = f.value;
      }
    });
    module.editConfig.tables.forEach(t => {
      let table = {};
      t.fields.forEach(f => {
        if (f.list) {
          f.value = [];
          f.listData.forEach(d => {
            f.value.push(d);
          });
          table[f.key] = f.value;
        } else if (f.type != 'current_month') {
          table[f.key] = f.value;
        }
      });
      _data.value[t.name] = table;
    });
    return _data;
  }
}
