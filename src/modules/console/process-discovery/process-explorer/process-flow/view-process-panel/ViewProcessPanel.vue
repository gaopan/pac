<template>
  <div class="view-process" id="viewProcess">
    <div class="button-area" @click="panelSwitch()">
      <i class="icon-chevron-right" v-if="panelShow&&iconShow"></i>
      <i class="icon-chevron-left" v-if="!panelShow&&iconShow"></i>
    </div>
    <div class="textarea">
      <div>热力分布基于</div>
      <div v-if="showTransaction">{{data.transaction.activityFrequency}}</div>
      <div v-if="showDuration">持续时间 - {{data.duration.activityDuration}}</div>
    </div>
    <div class="panel" v-if="panelShow" id="panel">
      <div class="transaction">
        <div class="btn" v-bind:class="{active:showTransaction}" @click="showTrans()">
          <div><i class="icon-sliders"></i></div>
          <div>事务</div>
        </div>
        <div class="info" v-if="showTransaction">
          <div class="selection">
            <div class="form-group">
              <div>
                <select class="form-control select-input" @change="selectActivityFrequency()" v-model="data.transaction.activityFrequency">
                  <option v-for="activityFrequency in activityFrequency" v-bind:value="activityFrequency.label">{{activityFrequency.label}}</option>
                </select>
              </div>
            </div>
          </div>
          <div class="chartarea">
            <div id="transaction-chart">
              <heat-map-chart :config="{mode: 'transaction',data:dTrans}"></heat-map-chart>
            </div>
          </div>
        </div>
      </div>
      <div class="duration">
        <div class="btn" v-bind:class="{active:showDuration}" @click="showDu()">
          <div><i class="icon-clock"></i></div>
          <div>持续时间</div>
        </div>
        <div class="info" v-if="showDuration">
          <div class="selection">
            <div class="form-group">
              <div>
                <label class="fontSemiBold control-label">活动持续时间</label>
                <select class="form-control select-input" @change="selectActivityDuration()" v-model="data.duration.activityDuration">
                  <option v-for="activityDuration in activityDuration" v-bind:value="activityDuration.label">{{activityDuration.label}}</option>
                </select>
              </div>
              <div>
                <label class="fontSemiBold control-label">权值</label>
                <select class="form-control select-input" @change="selectWeightedBy()" v-model="data.duration.weightedBy" v-bind:disabled="selectDisable">
                  <option v-for="weightedBy in weightedBy" v-bind:value="weightedBy.label">{{weightedBy.label}}</option>
                </select>
              </div>
            </div>
          </div>
          <div class="chartarea">
            <div id="duration-chart">
              <heat-map-chart :config="{mode: 'duration',data:dDu}"></heat-map-chart>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script src="./view-process-panel.js"></script>
<style src="./view-process-panel.scss" lang="scss"></style>
