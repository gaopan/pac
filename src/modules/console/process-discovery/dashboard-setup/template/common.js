import TypeChecker from '@/utils/type-checker.js'

let common = {};

let fnFindLabelWithField = function(fields, field){
  let label = null;
  fields.every(f => {
    if(f.key == field) {
      label = f.label;
      return false;
    }
    return true;
  });
  return label;
};

common.convertDataToArrayFormat = function(data){
  if(!TypeChecker.isObject(data) || !TypeChecker.isArray(data.list)) return null;
  let aData = [];
  data.list.forEach(d => {
    let cycleTime = d.average, caseCount = d.count;
    aData.push({
      name: d.name,
      cycleTime: cycleTime,
      caseCount: caseCount
    });
  });
  return aData;
};

common.parseTabsFromOnlyGroups = function(groups, type){
  let tabs = [];
  if (type == 4) {
    tabs = groups.map(g => {
      let method = {
        name: g.aggregate,
        value: g.aggregate
      }, dataField = {
        name: g.by.label,
        value: g.by.key
      }, groupBy = {
        name: g.groupBy.label,
        value: g.groupBy.key
      };
      return {
        title: method.name + ' of ' + dataField.name + ' by ' + groupBy.name,
        isPlainTitle: true,
        type: method,
        dataField: dataField,
        groupBy: groupBy
      };
    });
  } else if(type == 1 || type == 2 || type == 3) {
    let namePrefixs = ['Case Distribution Trend By ', 'Case Value Comparison By ', 'Case Value Ranking By '];
    tabs = groups.map(g => {
      let label = g.label;
      return {
        title: namePrefixs[type - 1] + label,
        isPlainTitle: true,
        groupBy: {
          name: label,
          value: g.key
        }
      };
    });
  }
  return tabs;
};

// type: 1. Case Distribution Trend, 2. Case Value Comparison, 3. Case Value Ranking, 4. Case Group By
common.parseTabsFromGroups = function(fields, groups, type) {
  let tabs = [];
  if (type == 4) {
    tabs = groups.map(g => {
      let method = {
        name: g.aggregate,
        value: g.aggregate
      }, dataField = {
        name: fnFindLabelWithField(fields.field, g.by),
        value: g.by
      }, groupBy = {
        name: fnFindLabelWithField(fields.groupBy, g.groupBy),
        value: g.groupBy
      };
      return {
        title: method.name + ' of ' + dataField.name + ' by ' + groupBy.name,
        isPlainTitle: true,
        type: method,
        dataField: dataField,
        groupBy: groupBy
      };
    });
  } else if(type == 1 || type == 2 || type == 3) {
    let namePrefixs = ['Case Distribution Trend By ', 'Case Value Comparison By ', 'Case Value Ranking By '];
    tabs = groups.map(g => {
      let label = fnFindLabelWithField(fields, g);
      return {
        title: namePrefixs[type - 1] + label,
        isPlainTitle: true,
        groupBy: {
          name: label,
          value: g
        }
      };
    });
  }
  return tabs;
};

export default common
