import TypeChecker from './type-checker.js'

export default {
  convertSecondToStr: function(duration, precision, isHazilyBefore) {
    isHazilyBefore = !!isHazilyBefore;
    precision = precision || 0;
    var divisorOfMinute = 60,
      divisorOfHour = 60 * 60,
      divisorOfDay = 60 * 60 * 24,
      divisorOfMonthHazily = 60 * 60 * 24 * 30,
      divisorOfYearHazily = 60 * 60 * 24 * 365;
    // Seconds -> Minutes -> Hours -> Days
    if (!TypeChecker.isNumber(duration)) return 'N/A';
    if (duration / divisorOfMinute < 1) {
      if (isHazilyBefore) return '刚刚';
      return duration.toFixed(precision) + '秒';
    } else if (duration / divisorOfHour < 1) {
      return (duration / divisorOfMinute).toFixed(precision) + '分钟' + (isHazilyBefore ? '前' : '');
    } else if (duration / divisorOfDay < 1) {
      return (duration / divisorOfHour).toFixed(precision) + '小时' + (isHazilyBefore ? '前' : '');
    } else {
      if (!isHazilyBefore) return (duration / divisorOfDay).toFixed(precision) + '天';
      if (duration / divisorOfMonthHazily < 1) {
        return (duration / divisorOfDay).toFixed(precision) + '天前'
      } else if (duration / divisorOfYearHazily < 1) {
        return (duration / divisorOfMonthHazily).toFixed(precision) + '月前';
      } else {
        return (duration / divisorOfYearHazily).toFixed(precision) + '年前';
      }
    }
  },
  convertBigCountToStr: function(count, precision) {
    precision = precision || 0;
    if (!TypeChecker.isNumber(count)) return 'N/A';
    if (count / 10000 < 1) {
      return count;
    } else if (count / 10000 / 10000 < 1) {
      return (count / 10000).toFixed(precision) + '万';
    } else {
      return (count / 10000 / 10000).toFixed(precision) + '亿';
    }
  },
  convertedUnitFromSecond: function(duration, precision) {
    precision = precision || 0;
    var divisorOfMinute = 60,
      divisorOfHour = 60 * 60,
      divisorOfDay = 60 * 60 * 24;
    // Seconds -> Minutes -> Hours -> Days
    if (!TypeChecker.isNumber(duration)) return '';
    if (duration / divisorOfMinute < 1) {
      return ' 秒';
    } else if (duration / divisorOfHour < 1) {
      return ' 分钟';
    } else if (duration / divisorOfDay < 1) {
      return ' 小时';
    } else {
      return ' 天';
    }
  },
  convertValueFromSecond: function(duration, precision) {
    precision = precision || 0;
    var divisorOfMinute = 60,
      divisorOfHour = 60 * 60,
      divisorOfDay = 60 * 60 * 24;
    // Seconds -> Minutes -> Hours -> Days
    if (!TypeChecker.isNumber(duration)) return 'N/A';
    if (duration / divisorOfMinute < 1) {
      return duration.toFixed(precision);
    } else if (duration / divisorOfHour < 1) {
      return (duration / divisorOfMinute).toFixed(precision);
    } else if (duration / divisorOfDay < 1) {
      return (duration / divisorOfHour).toFixed(precision);
    } else {
      return (duration / divisorOfDay).toFixed(precision);
    }
  },
  convertNumberToStr: function(number, precision) {
    var s = number + "";
    if (s.indexOf('.') < 0) {
      s += '.';
      for (var i = 0; i < precision; i++) {
        s += "0";
      }
      return s;
    }
    return number.toFixed(precision);
  },
  convertSecondToStr1: function(duration, precision) {
    precision = precision || 0;
    var divisorOfMinute = 60,
      divisorOfHour = 60 * 60,
      divisorOfDay = 60 * 60 * 24;
    // Seconds -> Minutes -> Hours -> Days
    if (!TypeChecker.isNumber(duration)) return '';
    if (duration < 0) {
      return '';
    } else {
      if (duration / divisorOfMinute < 1) {
        return duration.toFixed(precision) + ' 秒';
      } else if (duration / divisorOfHour < 1) {
        return (duration / divisorOfMinute).toFixed(precision) + ' 分';
      } else if (duration / divisorOfDay < 1) {
        return (duration / divisorOfHour).toFixed(precision) + ' 时';
      } else {
        return (duration / divisorOfDay).toFixed(precision) + ' 天';
      }
    }
  },
  convertUrlStr: function(oQuery) {
    if (!TypeChecker.isObject(oQuery)) return '';

    var sQuery = '?',
      k;

    for (k in oQuery) {
      if (TypeChecker.isArray(oQuery[k])) {
        if (oQuery[k].length) {
          oQuery[k].forEach(function(ele) {
            if (!TypeChecker.isUndefined(ele) && !TypeChecker.isNull(ele)) {
              sQuery += encodeURIComponent(k) + '=' + encodeURIComponent(ele.toString()) + '&';
            }
          });
        }
      } else {
        if (!TypeChecker.isUndefined(oQuery[k]) && !TypeChecker.isNull(oQuery[k])) {
          sQuery += encodeURIComponent(k) + '=' + encodeURIComponent(oQuery[k].toString()) + '&';
        }
      }
    }

    return sQuery.substr(0, sQuery.length - 1);
  }
}
