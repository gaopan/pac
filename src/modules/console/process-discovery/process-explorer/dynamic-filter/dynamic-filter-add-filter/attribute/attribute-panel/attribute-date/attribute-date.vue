<template>
    <div class="attribute-date">
        <div class="mixed-chart">
            <div class="line-chart">
                <div class="chart" ref="lineChart"></div>
                <div class="x-axis">{{'Unit' | internationalize}}</div>
            </div>
            <div class="dragged-ruler">
                <div class="chart" ref="draggerLine"></div>
            </div>
        </div>
        <div class="mixed-box" ref="mixedBox">
            <div class="range-start">
                <span>{{'Start Date' | internationalize}}</span>
                <Datepicker v-model="rangeDate.start" :format="'yyyy-MM-dd'" :inline="true" :placeholder="'Start Date'| internationalize" :calendarButton="false" :disabled="startDateDisable" :clearDateButton="false"></Datepicker>
            </div>
            <div class="selected-cases">
                <div class="content-box">
                    <p>{{'Selected cases'| internationalize}}</p>
                    <p class="value">{{ selectedCasesPercent }} {{'of' | internationalize}} {{'cases' | internationalize}}</p>
                </div>
            </div>
            <div class="range-end">
                <span>{{'End Date' | internationalize}}</span>
                <Datepicker v-model="rangeDate.end" :format="'yyyy-MM-dd'" :inline="true" :placeholder="'Start Date'| internationalize" :calendarButton="false" :disabled="endDateDisable" :clearDateButton="false"></Datepicker>
            </div>
        </div>
    </div>
</template>
<script src="./attribute-date.js"></script>
<style src="./attribute-date-external.css"></style>
<style src="./attribute-date.scss" lang="scss" scoped></style>