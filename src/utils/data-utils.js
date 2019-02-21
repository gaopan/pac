export default {
  groupBy(list, key) {
    let res = {},
      keyValues = [];
    list.forEach(item => {
      if (keyValues.indexOf(item[key]) < 0) {
        keyValues.push(item[key]);
        res[item[key]] = [item];
      } else {
        res[item[key]].push(item);
      }
    });
    return res;
  },
  monthComparison(a, b) {
    let aA = a.split('-'),
      aB = b.split('-');
    let yearA = aA[0],
      monthA = aA[1],
      yearB = aB[0],
      monthB = aB[1];
    if (yearA != yearB) {
      return yearA - yearB;
    }
    return monthA - monthB;
  }
}
