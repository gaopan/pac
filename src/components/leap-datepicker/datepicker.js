import DateUtils from './utils/DateUtils.js'
import DateLanguages from './utils/DateLanguages.js'
import datetimeUtils from '../../utils/datetime-utils.js'

let zerolize = function(num) {
  return (num < 10 ? '0' : '') + num;
}

export default {
  props: {
    value: {
      validator: function(val) {
        return val === null || val instanceof Date || typeof val === 'string'
      }
    },
    name: {
      value: String
    },
    id: {
      value: String
    },
    language: {
      value: String,
      default: 'zh'
    },
    disabled: {
      type: Object
    },
    highlighted: {
      type: Object
    },
    placeholder: {
      type: String
    },
    inline: {
      type: Boolean
    },
    wrapperClass: {
      type: [String, Object]
    },
    inputClass: {
      type: [String, Object]
    },
    calendarClass: {
      type: [String, Object]
    },
    iconClass: {
      type: [String, Object]
    },
    mondayFirst: {
      type: Boolean,
      default: false
    },
    clearButton: {
      type: Boolean,
      default: false
    },
    clearButtonIcon: {
      type: String,
      default: ''
    },
    calendarButton: {
      type: Boolean,
      default: true
    },
    calendarButtonIcon: {
      type: String,
      default: 'icon-calendar'
    },
    bootstrapStyling: {
      type: Boolean,
      default: false
    },
    initialView: {
      type: String,
      default: 'day'
    },
    disabledPicker: {
      type: Boolean,
      default: false
    },
    required: {
      type: Boolean,
      default: false
    },
    currentPageDate: {
      type: Number
    },
    //pan add  to show Clear Date Button
    clearDateButton: {
      type: Boolean,
      default: true
    },
    enabledTime: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      /*
       * Vue cannot observe changes to a Date Object so date must be stored as a timestamp
       * This represents the first day of the current viewing month
       * {Number}
       */
      pageDate: (this.$props.currentPageDate) ? this.$props.currentPageDate : new Date(new Date().getFullYear(), new Date().getMonth(), 1, new Date().getHours(), new Date().getMinutes()).getTime(),
      /*
       * Selected Date
       * {Date}
       */
      selectedDate: null,
      /*
       * Flags to show calendar views
       * {Boolean}
       */
      showDayView: false,
      showMonthView: false,
      showYearView: false,
      /*
       * Positioning
       */
      calendarHeight: 0,
      format: 'yyyy年MM月',
      /*
       * Time View 
       */
      isOnTimeView: false
    }
  },
  watch: {
    value(value) {
      this.setValue(value)
    }
  },
  filters: {
    zerolize
  },
  computed: {
    formattedValue() {
      if (!this.selectedDate) {
        return null
      }
      if(!this.enabledTime) {
        return DateUtils.formatDate(new Date(this.selectedDate), this.format, this.translation)
      } 
      let theDate = new Date(this.selectedDate);
      return DateUtils.formatDate(theDate, this.format, this.translation) + ' ' + zerolize(theDate.getHours()) + ":" + zerolize(theDate.getMinutes());
    },
    translation() {
      return DateLanguages.translations[this.language]
    },
    currMonthName() {
      const d = new Date(this.pageDate)
      return DateUtils.getMonthNameAbbr(d.getMonth(), this.translation.months.original)
    },
    currYear() {
      const d = new Date(this.pageDate)
      return d.getFullYear()
    },
    /**
     * Returns the day number of the week less one for the first of the current month
     * Used to show amount of empty cells before the first in the day calendar layout
     * @return {Number}
     */
    blankDays() {
      const d = new Date(this.pageDate)
      let dObj = new Date(d.getFullYear(), d.getMonth(), 1, d.getHours(), d.getMinutes())
      if (this.mondayFirst) {
        return dObj.getDay() > 0 ? dObj.getDay() - 1 : 6
      }
      return dObj.getDay()
    },
    daysOfWeek() {
      if (this.mondayFirst) {
        const tempDays = this.translation.days.slice()
        tempDays.push(tempDays.shift())
        return tempDays
      }
      return this.translation.days
    },
    days() {
      const d = new Date(this.pageDate)
      let days = []
      // set up a new date object to the beginning of the current 'page'
      let dObj = new Date(d.getFullYear(), d.getMonth(), 1, d.getHours(), d.getMinutes())
      let daysInMonth = DateUtils.daysInMonth(dObj.getFullYear(), dObj.getMonth())
      for (let i = 0; i < daysInMonth; i++) {
        days.push({
          date: dObj.getDate(),
          timestamp: dObj.getTime(),
          isSelected: this.isSelectedDate(dObj),
          isDisabled: this.isDisabledDate(dObj),
          isHighlighted: this.isHighlightedDate(dObj),
          isToday: dObj.toDateString() === (new Date()).toDateString()
        })
        dObj.setDate(dObj.getDate() + 1)
      }
      return days
    },
    months() {
      const d = new Date(this.pageDate)
      let months = []
      // set up a new date object to the beginning of the current 'page'
      let dObj = new Date(d.getFullYear(), 0, d.getDate(), d.getHours(), d.getMinutes())
      for (let i = 0; i < 12; i++) {
        months.push({
          month: DateUtils.getMonthName(i, this.translation.months.original),
          timestamp: dObj.getTime(),
          isSelected: this.isSelectedMonth(dObj),
          isDisabled: this.isDisabledMonth(dObj)
        })
        dObj.setMonth(dObj.getMonth() + 1)
      }
      return months
    },
    hours() {
      const d = new Date(this.pageDate);
      let hours = [];
      // set up a new date object to the beginning of the current 'page'
      let dObj = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, d.getMinutes());
      for (let i = 0; i < 24; i++) {
        hours.push({
          hour: dObj.getHours(),
          timestamp: dObj.getTime(),
          isSelected: this.isSelectedHour(dObj),
          isDisabled: this.isDisabledHour(dObj)
        });
        dObj.setHours(dObj.getHours() + 1);
      }
      return hours;
    },
    minutes() {
      const d = new Date(this.pageDate);
      let minutes = [];
      // set up a new date object to the beginning of the current 'page'
      let dObj = new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), 0);
      for (let i = 0; i < 60; i++) {
        minutes.push({
          minute: dObj.getMinutes(),
          timestamp: dObj.getTime(),
          isSelected: this.isSelectedMinute(dObj),
          isDisabled: this.isDisabledMinute(dObj)
        });
        dObj.setMinutes(dObj.getMinutes() + 1);
      }
      return minutes;
    },
    years() {
      const d = new Date(this.pageDate)
      let years = []
      // set up a new date object to the beginning of the current 'page'
      let dObj = new Date(Math.floor(d.getFullYear() / 10) * 10, d.getMonth(), d.getDate(), d.getHours(), d.getMinutes())
      for (let i = 0; i < 10; i++) {
        years.push({
          year: dObj.getFullYear(),
          timestamp: dObj.getTime(),
          isSelected: this.isSelectedYear(dObj),
          isDisabled: this.isDisabledYear(dObj)
        })
        dObj.setFullYear(dObj.getFullYear() + 1)
      }
      return years
    },
    calendarStyle() {
      let styles = {}

      if (this.isInline) {
        styles.position = 'static'
      }

      return styles
    },
    isOpen() {
      return this.showDayView || this.showMonthView || this.showYearView
    },
    isInline() {
      return typeof this.inline !== 'undefined' && this.inline
    }
  },
  methods: {
    /**
     * Close all calendar layers
     */
    close() {
      this.showDayView = this.showMonthView = this.showYearView = false
      if (!this.isInline) {
        this.$el.querySelector('.vdp-datepicker div').style.boxShadow = "none";
        this.$emit('closed');
        document.removeEventListener('click', this.clickOutside, false)
      }
    },
    resetDefaultDate() {
      if (this.selectedDate === null) {
        this.setPageDate()
        return
      }
      this.setPageDate(this.selectedDate)
    },
    /**
     * Effectively a toggle to show/hide the calendar
     * @return {mixed} [description]
     */
    showCalendar() {
      if (this.isInline) {
        return false
      }
      if (this.isOpen) {
        return this.close()
      }
      switch (this.initialView) {
        case 'year':
          this.showYearCalendar()
          break
        case 'month':
          this.showMonthCalendar()
          break
        default:
          this.showDayCalendar()
          break
      }
    },
    showDayCalendar() {
      this.close()
      this.showDayView = true
      if (!this.isInline) {

        this.$el.querySelector('.vdp-datepicker div').style.boxShadow = "0 0 0 2px #000";
        this.$emit('opened');
        document.addEventListener('click', this.clickOutside, false)
      }
    },
    showMonthCalendar() {
      this.close()
      this.showMonthView = true
      if (!this.isInline) {
        document.addEventListener('click', this.clickOutside, false)
      }
    },
    showYearCalendar() {
      this.close()
      this.showYearView = true
      if (!this.isInline) {
        document.addEventListener('click', this.clickOutside, false)
      }
    },

    setDate(timestamp) {
      const date = new Date(timestamp)
      this.selectedDate = new Date(date)
      this.setPageDate(date)
      this.$emit('selected', new Date(date))

      if (!this.enabledTime) {
        let convertedDate = datetimeUtils.getFullDate(new Date(date), "yyyy-MM");
        this.$emit('input', convertedDate);
      } else {
        let theDate = new Date(date);
        let convertedDate = datetimeUtils.getFullDate(theDate, this.format) + 'T' + zerolize(theDate.getHours()) + ':' + zerolize(theDate.getMinutes()) + ':00.000';
        this.$emit('input', convertedDate);
      }
    },

    clearDate() {
      if (this.selectedDate) {
        this.selectedDate = null;
        this.$emit('selected', null);
        this.$emit('input', null);
        this.$emit('cleared');
      }
    },

    /**
     * @param {Object} day
     */
    selectDate(day) {
      if (day.isDisabled) {
        return false
      }
      this.setDate(day.timestamp)
      if (this.isInline) {
        return this.showDayCalendar()
      }
      this.close()
    },

    /**
     * @param {Object} month
     */
    selectMonth(month) {
      if (month.isDisabled) {
        return false
      }
      const date = new Date(month.timestamp)
      this.setPageDate(date)
      this.showDayCalendar()
      this.$emit('changedMonth', month)
    },

    /**
     * @param {Object} year
     */
    selectYear(year) {
      if (year.isDisabled) {
        return false
      }
      const date = new Date(year.timestamp)
      this.setPageDate(date)
      this.showMonthCalendar()
      this.$emit('changedYear', year)
    },

    /**
     * @return {Number}
     */
    getPageDate() {
      let date = new Date(this.pageDate)
      return date.getDate()
    },

    /**
     * @return {Number}
     */
    getPageMonth() {
      let date = new Date(this.pageDate)
      return date.getMonth()
    },

    /**
     * @return {Number}
     */
    getPageYear() {
      let date = new Date(this.pageDate)
      return date.getFullYear()
    },

    /**
     * @return {String}
     */
    getPageDecade() {
      let date = new Date(this.pageDate)
      let sD = Math.floor(date.getFullYear() / 10) * 10
      return sD + '\'s'
    },

    previousMonth() {
      if (this.previousMonthDisabled()) {
        return false
      }
      let date = new Date(this.pageDate)
      date.setMonth(date.getMonth() - 1)
      this.setPageDate(date)
      this.$emit('changedMonth', date)
    },

    previousMonthDisabled() {
      if (typeof this.disabled === 'undefined' || typeof this.disabled.to === 'undefined' || !this.disabled.to) {
        return false
      }
      let d = new Date(this.pageDate)
      if (
        this.disabled.to.getMonth() >= d.getMonth() &&
        this.disabled.to.getFullYear() >= d.getFullYear()
      ) {
        return true
      }
      return false
    },

    increaseHour(increment) {
      let date = new Date(this.pageDate);
      let theHours = date.getHours() + increment;
      if (theHours < 24 && theHours >= 0) {
        date.setHours(theHours);
      } else if (theHours == 24) {
        date.setHours(0);
      } else if (theHours == -1) {
        date.setHours(23);
      }
      this.setDate(date.getTime());
    },

    increaseMinute(increment) {
      let date = new Date(this.pageDate);
      let theMinutes = date.getMinutes() + increment;
      if (theMinutes < 60 && theMinutes >= 0) {
        date.setMinutes(theMinutes);
      } else if (theMinutes == 60) {
        date.setMinutes(0);
      } else if (theMinutes == -1) {
        date.setMinutes(59);
      }
      this.setDate(date.getTime());
    },

    nextMonth() {
      if (this.nextMonthDisabled()) {
        return false
      }
      let date = new Date(this.pageDate)
      date.setMonth(date.getMonth() + 1)
      this.setPageDate(date)
      this.$emit('changedMonth', date)
    },

    nextMonthDisabled() {
      if (typeof this.disabled === 'undefined' || typeof this.disabled.from === 'undefined' || !this.disabled.from) {
        return false
      }
      let d = new Date(this.pageDate)
      if (
        this.disabled.from.getMonth() <= d.getMonth() &&
        this.disabled.from.getFullYear() <= d.getFullYear()
      ) {
        return true
      }
      return false
    },

    previousYear() {
      if (this.previousYearDisabled()) {
        return false
      }
      let date = new Date(this.pageDate)
      date.setYear(date.getFullYear() - 1)
      this.setPageDate(date)
      this.$emit('changedYear')
    },

    previousYearDisabled() {
      if (typeof this.disabled === 'undefined' || typeof this.disabled.to === 'undefined' || !this.disabled.to) {
        return false
      }
      let d = new Date(this.pageDate)
      if (this.disabled.to.getFullYear() >= d.getFullYear()) {
        return true
      }
      return false
    },

    nextYear() {
      if (this.nextYearDisabled()) {
        return false
      }
      let date = new Date(this.pageDate)
      date.setYear(date.getFullYear() + 1)
      this.setPageDate(date)
      this.$emit('changedYear')
    },

    nextYearDisabled() {
      if (typeof this.disabled === 'undefined' || typeof this.disabled.from === 'undefined' || !this.disabled.from) {
        return false
      }
      let d = new Date(this.pageDate)
      if (this.disabled.from.getFullYear() <= d.getFullYear()) {
        return true
      }
      return false
    },

    previousDecade() {
      if (this.previousDecadeDisabled()) {
        return false
      }
      let date = new Date(this.pageDate)
      date.setYear(date.getFullYear() - 10)
      this.setPageDate(date)
      this.$emit('changedDecade')
    },

    previousDecadeDisabled() {
      if (typeof this.disabled === 'undefined' || typeof this.disabled.to === 'undefined' || !this.disabled.to) {
        return false
      }
      let d = new Date(this.pageDate)
      if (Math.floor(this.disabled.to.getFullYear() / 10) * 10 >= Math.floor(d.getFullYear() / 10) * 10) {
        return true
      }
      return false
    },

    nextDecade() {
      if (this.nextDecadeDisabled()) {
        return false
      }
      let date = new Date(this.pageDate)
      date.setYear(date.getFullYear() + 10)
      this.setPageDate(date)
      this.$emit('changedDecade')
    },

    nextDecadeDisabled() {
      if (typeof this.disabled === 'undefined' || typeof this.disabled.from === 'undefined' || !this.disabled.from) {
        return false
      }
      let d = new Date(this.pageDate)
      if (Math.ceil(this.disabled.from.getFullYear() / 10) * 10 <= Math.ceil(d.getFullYear() / 10) * 10) {
        return true
      }
      return false
    },

    /**
     * Whether a day is selected
     * @param {Date}
     * @return {Boolean}
     */
    isSelectedDate(dObj) {
      return this.selectedDate && this.selectedDate.toDateString() === dObj.toDateString()
    },

    /**
     * Whether a day is disabled
     * @param {Date}
     * @return {Boolean}
     */
    isDisabledDate(date) {

      let disabled = false
      if (typeof this.disabled === 'undefined') {
        return false
      }

      if (typeof this.disabled.dates !== 'undefined') {
        this.disabled.dates.forEach((d) => {
          if (date.toDateString() === d.toDateString()) {
            disabled = true
            return true
          }
        })
      }
      if (typeof this.disabled.to !== 'undefined' && this.disabled.to && date < this.disabled.to) {
        disabled = true
      }
      if (typeof this.disabled.from !== 'undefined' && this.disabled.from && date > this.disabled.from) {
        disabled = true
      }
      if (typeof this.disabled.days !== 'undefined' && this.disabled.days.indexOf(date.getDay()) !== -1) {
        disabled = true
      }

      return disabled
    },

    /**
     * Whether a day is highlighted (only if it is not disabled already)
     * @param {Date}
     * @return {Boolean}
     */
    isHighlightedDate(date) {
      if (this.isDisabledDate(date)) {
        return false
      }

      let highlighted = false

      if (typeof this.highlighted === 'undefined') {
        return false
      }

      if (typeof this.highlighted.dates !== 'undefined') {
        this.highlighted.dates.forEach((d) => {
          if (date.toDateString() === d.toDateString()) {
            highlighted = true
            return true
          }
        })
      }

      if (this.isDefined(this.highlighted.from) && this.isDefined(this.highlighted.to)) {
        highlighted = date >= this.highlighted.from && date <= this.highlighted.to
      }

      if (typeof this.highlighted.days !== 'undefined' && this.highlighted.days.indexOf(date.getDay()) !== -1) {
        highlighted = true
      }
      return highlighted
    },

    /**
     * Helper
     * @param  {mixed}  prop
     * @return {Boolean}
     */
    isDefined(prop) {
      return typeof prop !== 'undefined' && prop
    },

    /**
     * Whether the selected date is in this month
     * @param {Date}
     * @return {Boolean}
     */
    isSelectedMonth(date) {
      return (this.selectedDate &&
        this.selectedDate.getFullYear() === date.getFullYear() &&
        this.selectedDate.getMonth() === date.getMonth())
    },

    /**
     * Whether a month is disabled
     * @param {Date}
     * @return {Boolean}
     */
    isDisabledMonth(date) {
      let disabled = false

      if (typeof this.disabled === 'undefined') {
        return false
      }

      if (typeof this.disabled.to !== 'undefined' && this.disabled.to) {
        if (
          (date.getMonth() < this.disabled.to.getMonth() && date.getFullYear() <= this.disabled.to.getFullYear()) ||
          date.getFullYear() < this.disabled.to.getFullYear()
        ) {
          disabled = true
        }
      }
      if (typeof this.disabled.from !== 'undefined' && this.disabled.from) {
        if (
          this.disabled.from &&
          (date.getMonth() > this.disabled.from.getMonth() && date.getFullYear() >= this.disabled.from.getFullYear()) ||
          date.getFullYear() > this.disabled.from.getFullYear()
        ) {
          disabled = true
        }
      }
      return disabled
    },

    /**
     * Whether an hour is selected
     */
    isSelectedHour(date) {
      return this.selectedDate && this.selectedDate.getHours() === date.getHours();
    },
    /**
     * Whether an hour is disabled
     */
    isDisabledHour(date) {
      let isDisabled = false
      if (typeof this.disabled === 'undefined' || !this.disabled) {
        return false
      }
      if (typeof this.disabled.to !== 'undefined' && this.disabled.to) {
        if (date.getHours() < this.disabled.to.getHours()) {
          isDisabled = true
        }
      }
      if (typeof this.disabled.from !== 'undefined' && this.disabled.from) {
        if (date.getHours() > this.disabled.from.getHours()) {
          isDisabled = true
        }
      }
      return isDisabled
    },

    /**
     * Whether an hour is selected
     */
    isSelectedMinute(date) {
      return this.selectedDate && this.selectedDate.getMinutes() === date.getMinutes();
    },
    /**
     * Whether an hour is disabled
     */
    isDisabledMinute(date) {
      let isDisabled = false
      if (typeof this.disabled === 'undefined' || !this.disabled) {
        return false
      }
      if (typeof this.disabled.to !== 'undefined' && this.disabled.to) {
        if (date.getMinutes() < this.disabled.to.getMinutes()) {
          isDisabled = true
        }
      }
      if (typeof this.disabled.from !== 'undefined' && this.disabled.from) {
        if (date.getMinutes() > this.disabled.from.getMinutes()) {
          isDisabled = true
        }
      }
      return isDisabled
    },

    /**
     * Whether a year is disabled
     * @param {Date}
     * @return {Boolean}
     */
    isSelectedYear(date) {
      return this.selectedDate && this.selectedDate.getFullYear() === date.getFullYear()
    },

    /**
     * Whether a month is disabled
     * @param {Date}
     * @return {Boolean}
     */
    isDisabledYear(date) {
      let disabled = false
      if (typeof this.disabled === 'undefined' || !this.disabled) {
        return false
      }

      if (typeof this.disabled.to !== 'undefined' && this.disabled.to) {
        if (date.getFullYear() < this.disabled.to.getFullYear()) {
          disabled = true
        }
      }
      if (typeof this.disabled.from !== 'undefined' && this.disabled.from) {
        if (date.getFullYear() > this.disabled.from.getFullYear()) {
          disabled = true
        }
      }

      return disabled
    },

    /**
     * Set the datepicker value
     * @param {Date|String|null} date
     */
    setValue(date) {
      if (typeof date === 'string') {
        let dateReg = /^([0-9]{4})\-([0-9]{2})$/,
          timeReg = /^([0-9]{4})\-([0-9]{2})\-([0-9]{2})T([0-9]{2})\:([0-9]{2})\:([0-9]{2})\.([0-9]{3})$/;
        if (dateReg.test(date)) {
          date += 'T00:00:00.000';
        } else if (!timeReg.test(date)) {
          console.warn('The date format is not valid. Valid format: "yyyy-MM" or "yyyy-MM-ddThh:mm:ss.SSS"');
          return;
        }
        let parsed = new Date(date)
        date = isNaN(parsed.valueOf()) ? null : parsed
      }
      if (!date) {
        this.setPageDate()
        this.selectedDate = null
        return
      }
      this.selectedDate = date
      this.setPageDate(date)
    },

    setPageDate(date) {
      if (!date) {
        this.pageDate = (this.$props.currentPageDate) ? this.$props.currentPageDate : new Date();
      } else {
        this.pageDate = new Date(date.getFullYear(), date.getMonth(), 1, date.getHours(), date.getMinutes()).getTime();
      }
    },

    /**
     * Close the calendar if clicked outside the datepicker
     * @param  {Event} event
     */
    clickOutside(event) {
      if (this.$el && !this.$el.contains(event.target)) {
        if (this.isInline) {
          return this.showDayCalendar()
        }
        this.resetDefaultDate()
        this.close()
        document.removeEventListener('click', this.clickOutside, false)
      }
    },

    init() {
      if (this.value) {
        this.setValue(this.value)
      }
      if (this.isInline) {
        this.showDayCalendar()
      }
    }
  },
  /**
   * Vue 1.x
   */
  ready() {
    this.init()
  },
  /**
   * Vue 2.x
   */
  mounted() {
    this.init()
  }
}
