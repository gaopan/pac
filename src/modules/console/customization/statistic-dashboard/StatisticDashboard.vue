<template>
  <div class="statistic-dashboard">
    <div class="table-wrapper" v-show="!editCompanies">
      <div class="table-header">
        <div>
          <span class="table-title">工时跟踪</span>
          <span class="table-actions">
      		<button class="btn btn-primary" type="button" @click="toEdit">编辑数据</button>
      	</span>
        </div>
        <div class="selectors">
          <leap-select :class="'left'" :options="viewOptions" :initSelectedValue="selectedViewOption" @onSelectedValues="changedViewOption"></leap-select>
          <period-selector v-if="periods" :periods="periods" @change="changedPeriod"></period-selector>
        </div>
      </div>
      <div>
        <div v-for="d in data" v-show="selectedViewOption=='table'">
          <div class="chart-title">
            <span>{{d.month}}</span>
          </div>
          <table class="leap-table">
            <thead>
              <th>统计项</th>
              <th v-for="comp in companies">{{comp.name}}</th>
            </thead>
            <tbody>
              <tr v-for="header in headers">
                <td>
                  <div>{{header.name}}</div>
                </td>
                <td v-for="comp in d.data">
                  <div>{{comp[header.key]}}</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="chart-wrapper" v-if="selectedViewOption=='chart'">
          <chart-view v-for="comp in chartData" :data="comp"></chart-view>
        </div>
        <div v-if="!data || data.length < 1" class="no-data">没有数据显示</div>
      </div>
    </div>
    <edit-form v-if="editCompanies" :companies="editCompanies" @submitted="submit" @cancel="cancel"></edit-form>
  </div>
</template>
<script src="./statistic-dashboard.js"></script>
<style src="./statistic-dashboard.scss" lang="scss"></style>
