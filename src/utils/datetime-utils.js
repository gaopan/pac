export default {
  getFullDate(dateObj, format) {
    let day = `0${dateObj.getDate()}`,
      month = `0${dateObj.getMonth() + 1}`,
      year = dateObj.getFullYear(),
      date;

    switch (format) {
      case 'yyyy-MM': 
       date = `${year}-${month.slice(-2)}`;
        break;
      case 'MM/dd/yyyy':
        date = `${month.slice(-2)}/${day.slice(-2)}/${year}`;
        break;
      case 'yyyy-MM-dd':
        date = `${year}-${month.slice(-2)}-${day.slice(-2)}`;
        break;
      default:
        //dd MMM yyyy
        date = `${day.slice(-2)} ${month.slice(-2)} ${year}`;
    }

    return date;
  },
  convertEpochDate(epoch, addOneDay) {

    let convertedDate;

    if (addOneDay) {
      convertedDate = new Date(epoch);
      convertedDate.setTime(convertedDate.getTime() + 86400000);
    } else {
      convertedDate = new Date(epoch);
    }

    return this.getFullDate(convertedDate, 'yyyy-MM-dd');
  },
  convertUTCTimestampToLocal(epoch) {
    let nTimezoneOffsetMiliseconds = new Date().getTimezoneOffset() * 60000;
    return epoch + nTimezoneOffsetMiliseconds;
  },
  convertUTCWithTimeZone(time) {
    time = +time;

    if (typeof time != 'number') return '';

    let ndate = new Date(time),
      year = ndate.getFullYear(),
      mouth = ('0' + (ndate.getMonth() + 1)).slice(-2),
      day = ('0' + ndate.getDate()).slice(-2),
      hour = ('0' + ndate.getHours()).slice(-2),
      minute = ('0' + ndate.getMinutes()).slice(-2),
      second = ('0' + ndate.getSeconds()).slice(-2),
      milli = ('00' + ndate.getMilliseconds()).slice(-3);

    return year + '-' + mouth + '-' + day + 'T' + hour + ':' + minute + ':' + second + '.' + milli + 'Z';
  }
}
