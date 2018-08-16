<template>
    <div class="box-area">
      <div class="box-container">
        <div class="total-invoice">
          <div class="wrapper">
            <div class="box-title">
              <p>{{'Total Cases'|internationalize}}</p>
            </div>
            <div class="count-display">
              <span><i class="icon-play"></i></span>
              <span><p>{{caseCount}} {{'out of'|internationalize}} {{totalCaseCount}}</p></span>
            </div>
          </div>
        </div>
        <div class="average-cycle-time">
          <div class="wrapper">
            <div class="box-title">
              <p>{{'Average Cycle Time'|internationalize}}</p>
            </div>
            <div class="count-display">
              <span><i class="icon-play"></i></span>
              <span><p>{{averageDuration}}</p></span>
            </div>
          </div>
        </div>
        <div class="time-period">
          <div class="wrapper">
            <div class="box-title">
              <p>{{'Time Period'|internationalize}}</p>
            </div>
            <div class="count-display">
              <span> <i class="icon-play"></i></span>
              <span><p>{{startTime}} - {{endTime}}</p></span>
            </div>
          </div>
        </div>

      </div>
    </div>
</template>

<script src="./box-chart.js"></script>
<style src="./box-chart.css" scoped></style>