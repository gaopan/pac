<template>
  <div class="statistic-review">
    <div class="year-selector" v-if="selectedYear">
      <div>统计</div>
      <div><leap-select :options="years" :initSelectedValue="selectedYear" v-on:onSelectedValues="changedYear"></leap-select></div>
      <div>工时</div>
    </div>
    <div v-if="isNoData" class="no-data">没有数据显示</div>
    <div class="chart-wrapper" v-if="!isNoData">
      <chart-view :data="chartData"></chart-view>
    </div>
    <div class="table-wrapper" v-if="!isNoData">
      <div>
        <table class="leap-table">
          <thead>
            <th><div>{{company.name}}</div></th>
            <th v-for="month in months"><div>{{month}}</div></th>
          </thead>
          <tbody>
            <tr v-for="header in headers">
              <td>
                <div>{{header.name}} ({{header.unit}})</div>
              </td>
              <td v-for="month in months">
                <div>{{data[month][header.key]}}</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
<script src="./review.js"></script>
<style src="./review.scss" lang="scss"></style>
