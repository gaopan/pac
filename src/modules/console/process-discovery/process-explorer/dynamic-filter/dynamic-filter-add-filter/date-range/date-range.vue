<template>
  <div class="date-range" ref="date-range">
    <h4>日期范围</h4>
    <div class="mixed-chart">
      <div class="line-chart">
        <div class="chart"></div>
      </div>
      <div class="dragged-ruler">
        <div class="chart"></div>
      </div>
    </div>
    <div class="mixed-box">
      <div class="range-start">
        <span>起始日期</span>
        <Datepicker v-model="rangDate.startDate" :format="'yyyy-MM-dd'" :inline="true" :placeholder="'Start Date'" :calendarButton="false" :disabled="startDateDisable" :clearDateButton="false"></Datepicker>
      </div>
      <div class="date-status-box">
        <span>请选择一种方法去过滤实例</span>
        <div class="date-status">
          <div class="row">
            <div class="col-lg-4 col-xs-12">
              <div class="status-box start" :class="{active: filterData.value.way==='started'}">
                <button @click="clickStatus('started')" :disabled="currentData.length==0"> 开始时间在范围内 </button>
                <div class="status-line ">
                  <div class="range-box"></div>
                  <em class="beforeline1"></em>
                  <em class="beforeline2"></em>
                  <em class="beforeline3"></em>
                  <em class="beforeline4"></em>
                  <em class="beforeline5"></em>
                  <em class="beforeline6"></em>
                  <em class="beforeline7"></em>
                  <em class="beforeline8"></em>
                  <em class="beforeline9"></em>
                </div>
              </div>
            </div>
            <div class="col-lg-4 col-xs-12">
              <div class="status-box completed" :class="{active:  filterData.value.way==='completed'}">
                <button @click="clickStatus('completed')" :disabled="currentData.length==0"> 结束时间在范围内 </button>
                <div class="status-line ">
                  <div class="range-box"></div>
                  <em class="beforeline1"></em>
                  <em class="beforeline2"></em>
                  <em class="beforeline3"></em>
                  <em class="beforeline4"></em>
                  <em class="beforeline5"></em>
                  <em class="beforeline6"></em>
                  <em class="beforeline7"></em>
                  <em class="beforeline8"></em>
                  <em class="beforeline9"></em>
                </div>
              </div>
            </div>
            <div class="col-lg-4 col-xs-12">
              <div class="status-box intersecting" :class="{active: filterData.value.way==='intersection'}">
                <button @click="clickStatus('intersection')" :disabled="currentData.length==0"> 都可以 </button>
                <div class="status-line ">
                  <div class="range-box"></div>
                  <em class="beforeline1"></em>
                  <em class="beforeline2"></em>
                  <em class="beforeline3"></em>
                  <em class="beforeline4"></em>
                  <em class="beforeline5"></em>
                  <em class="beforeline6"></em>
                  <em class="beforeline7"></em>
                  <em class="beforeline8"></em>
                  <em class="beforeline9"></em>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="range-end">
        <span>终止日期</span>
        <Datepicker v-model="rangDate.endDate" :format="'yyyy-MM-dd'" :inline="true" :placeholder="'End Date'" :calendarButton="false" :disabled="endDateDisable" :clearDateButton="false"></Datepicker>
      </div>
    </div>
  </div>
</template>
<script src="./date-range.js"></script>
<style src="./date-range.scss" lang="scss"></style>
