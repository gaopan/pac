<template>
  <div class="vdp-datepicker" :class="[wrapperClass, enabledTime ? 'has-time' : '']">
    <!-- Input Label -->
    <div class="wrapper-label" :class="{'input-group' : bootstrapStyling}">
      <span class="vdp-datepicker__calendar-button" :class="[ iconClass, {'input-group-addon' : bootstrapStyling} ]" v-if="calendarButton" @click="showCalendar">
                <i :class="calendarButtonIcon">
                    <span v-if="calendarButtonIcon.length === 0">&hellip;</span>
      </i>
      </span>
      <input :type="inline ? 'hidden' : 'text'" :class="[ inputClass, { 'form-control' : bootstrapStyling } ]" :name="name" :id="id" @click="showCalendar" :value="formattedValue" :placeholder="placeholder" :clear-button="clearButton" :disabled="disabledPicker" :required="required" readonly />
    </div>
    <div class="wrapper-body" v-show="showDayView || showMonthView || showYearView">
      <!-- Day View -->
      <div :class="[calendarClass, 'vdp-datepicker__calendar']" v-show="showDayView && !disabledDayView" v-bind:style="calendarStyle">
        <header>
          <span @click="previousMonth" class="prev" v-bind:class="{ 'disabled' : previousMonthDisabled(pageDate) }">
                    <i class="icon-chevron-left"></i>
                </span>
          <span @click="showMonthCalendar" class="up">{{ currMonthName }} {{ currYear }}</span>
          <span @click="nextMonth" class="next" v-bind:class="{ 'disabled' : nextMonthDisabled(pageDate) }">
                    <i class="icon-chevron-right"></i>
                </span>
        </header>
        <span class="cell day-header" v-for="d in daysOfWeek">{{ d }}</span>
        <span class="cell day blank" v-for="d in blankDays"></span>
        <span class="cell day" v-for="day in days" track-by="timestamp" v-bind:class="{ 'selected':day.isSelected, 'disabled':day.isDisabled, 'highlighted': day.isHighlighted, 'today': day.isToday}" @click="selectDate(day)">{{ day.date }}
            </span>
        <div class="clear-btn" v-show="clearDateButton">
          <button class="btn btn-secondary" :class="{ 'disabled': !selectedDate }" @click="clearDate()">Clear Date</button>
        </div>
      </div>
      <!-- Month View -->
      <div :class="[calendarClass, 'vdp-datepicker__calendar']" v-show="showMonthView" v-bind:style="calendarStyle">
        <header>
          <span @click="previousYear" class="prev" v-bind:class="{ 'disabled' : previousYearDisabled(pageDate) }">
                    <i class="icon-chevron-left"></i>
                </span>
          <span @click="showYearCalendar" class="up">{{ getPageYear() }}</span>
          <span @click="nextYear" class="next" v-bind:class="{ 'disabled' : nextYearDisabled(pageDate) }">
                    <i class="icon-chevron-right"></i>
                </span>
        </header>
        <span class="cell month" v-for="month in months" track-by="timestamp" v-bind:class="{ 'selected': month.isSelected, 'disabled': month.isDisabled }" @click.stop="selectMonth(month)">{{ month.month }}
            </span>
      </div>
      <!-- Year View -->
      <div :class="[calendarClass, 'vdp-datepicker__calendar']" v-show="showYearView" v-bind:style="calendarStyle">
        <header>
          <span @click="previousDecade" class="prev" v-bind:class="{ 'disabled' : previousDecadeDisabled(pageDate) }">
                    <i class="icon-chevron-left"></i>
                </span>
          <span>{{ getPageDecade() }}</span>
          <span @click="nextDecade" class="next" v-bind:class="{ 'disabled' : nextMonthDisabled(pageDate) }">
                    <i class="icon-chevron-right"></i>
                </span>
        </header>
        <span class="cell year" v-for="year in years" track-by="timestamp" v-bind:class="{ 'selected': year.isSelected, 'disabled': year.isDisabled }" @click.stop="selectYear(year)">{{ year.year }}
            </span>
      </div>
      <div class="vdp-datepicker__time" v-if="enabledTime" v-show="showDayView || showMonthView || showYearView">
        <div class="time-btn" v-show="!isOnTimeView">
          <button class="btn btn-primary" @click="isOnTimeView=true"><i class="icon-clock-o"></i></button>
        </div>
      </div>
      <div class="vdp-datepicker__time-panel" v-if="enabledTime" v-show="isOnTimeView && (showDayView || showMonthView || showYearView)">
        <header>
          <div class="time-btn">
            <button class="btn btn-primary" @click="isOnTimeView=false"><i class="icon-calendar"></i></button>
          </div>
        </header>
        <div>
          <div class="regulation">
            <div class="cell hour increment" @click="increaseHour(1)"><i class="icon-arrow-up2"></i></div>
            <div class="">
              <span v-for="hour in hours" v-if="hour.isSelected">{{hour.hour | zerolize}}</span>
            </div>
            <div class="cell hour decrement" @click="increaseHour(-1)"><i class="icon-arrow-down2"></i></div>
          </div>
          <div class="time-seperator">:</div>
          <div class="regulation">
            <div class="cell minute increment" @click="increaseMinute(1)"><i class="icon-arrow-up2"></i></div>
            <div class="">
              <span v-for="minute in minutes" v-show="minute.isSelected">{{minute.minute | zerolize}}</span>
            </div>
            <div class="cell minute decrement" @click="increaseMinute(-1)"><i class="icon-arrow-down2"></i></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script src="./datepicker.js"></script>
<style src="./datepicker.css" scoped></style>
