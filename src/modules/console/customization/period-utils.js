import TypeChecker from '@/utils/type-checker.js'
export default {
  parsePeriodsFromMonths(months) {
    let _months = [],
      _years = [],
      quarters = [],
      currentFullYear = new Date().getFullYear();
    if (TypeChecker.isArray(months)) {
      months.forEach(month => {
        let monthArr = month.split('-');
        if (monthArr.length == 2) {
          if (_years.indexOf(monthArr[0]) < 0) {
            _years.push(monthArr[0]);
          }
          _months.push({
            year: parseInt(monthArr[0]),
            month: parseInt(monthArr[1])
          });
        } else if (monthArr.length == 1) {
          if (_years.indexOf(currentFullYear) < 0) {
            _years.push(currentFullYear);
          }
          _months.push({
            year: currentFullYear,
            month: parseInt(monthArr[0])
          });
        }
      });
      _months.sort((a, b) => {
        if (a.year > b.year) {
          return true;
        } else if (a.year < b.year) {
          return false;
        } else {
          return a.month > b.month;
        }
      });

      if (_months.length > 0) {
        let firstMonth = _months[0];
        let quarter = Math.floor((firstMonth.month - 1) / 3) + 1;
        quarters.push({
          year: firstMonth.year,
          quarter: quarter
        });
        for (let i = 1; i < _months.length; i++) {
          let _month = _months[i];
          let _quarter = Math.floor((_month.month - 1) / 3) + 1;
          let qStr = quarters.map(q => q.year + '-' + q.quarter);
          if (qStr.indexOf(_month.year + '-' + _quarter) < 0) {
            quarters.push({
              year: _month.year,
              quarter: _quarter
            });
          }
        }
      }
    }

    return {
      years: _years,
      months: _months,
      quarters: quarters
    };
  },
  convertPeriodToMonths(period, periodType) {
    let months = [];
    if (periodType == 'year') {
      for (let i = 1; i <= 12; i++) {
        months.push({
          year: parseInt(period),
          month: i
        });
      }
    } else if (periodType == 'quarter') {
      let monthArr = period.split('-');
      let quarter = parseInt(monthArr[1]);
      for (let i = (quarter - 1) * 3 + 1; i <= quarter * 3; i++) {
        months.push({
          year: parseInt(monthArr[0]),
          month: i
        });
      }
    } else if (periodType == 'month') {
      let monthArr = period.split('-');
      months.push({
        year: parseInt(monthArr[0]),
        month: parseInt(monthArr[1])
      });
    }
    return months;
  }
}
