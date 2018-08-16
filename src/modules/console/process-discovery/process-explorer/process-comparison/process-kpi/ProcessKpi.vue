<template>
  <div class="process-kpi" :class="{standard: isStandard}">
    <div class="cap" v-if="!hideCaption">
      <div class="desc">{{ desc }}</div>
      <div class="actions">
        <button class="btn btn-primary" :show="!action.hide" :class="{disabled: action.disabled}" v-for="action in actions" @click="clickAction(action)">{{ action.title }}</button>
      </div>
    </div>
    <div class="kpis" :class="{'has-detail': detailToggle.visible}">
      <div class="kpi">
        <div class="kpi-wrapper">
          <b class="kpi-val">{{ kpi.cycleTime }}</b>
          <span class="kpi-title">Cycle Time</span>
        </div>
      </div>
      <div class="kpi">
        <div class="kpi-wrapper">
          <b class="kpi-val">{{ kpi.firstPassYield }}</b>
          <span class="kpi-title">First Pass Yield</span>
        </div>
      </div>
      <div class="kpi">
        <div class="kpi-wrapper">
          <b class="kpi-val">{{ kpi.compliance }}</b>
          <span class="kpi-title">Compliance</span>
        </div>
      </div>
    </div>
    <a class="kpi-detail-toggle" href="javascript:void(0)" v-if="detailToggle.visible" v-on:click="onClickDetailToggle">
      <i :class="{'icon-expand': !detailToggle.expand,'icon-compress': detailToggle.expand}"></i>
    </a>
  </div>
</template>
<script src="./process-kpi.js"></script>
<style src="./process-kpi.css"></style>
