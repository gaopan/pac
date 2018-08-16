<template>
  <div class="comparison-panel">
    <div class="variant-pf" :class="{mapping: isMapping}">
      <div class="pf-container">
        <pn-chart :tile-id="tileId" :conf="variantConf"></pn-chart>
      </div>
      <div class="kpi-container" :show="!showSelection">
        <process-kpi :conf="variantKpiConf"></process-kpi>
      </div>
    </div>
    <div class="industry-pf">
      <div class="pf-container recipe-container" :show="showSelection">
        <recipe-selection :tile-id="tileId" :conf="selectionConf"></recipe-selection>
      </div>
      <div class="pf-container" :show="!showSelection">
        <pn-chart :tile-id="tileId" :conf="industryConf"></pn-chart>
      </div>
      <div class="pf-container pf-kpi-detail-container" v-if="showKpiDetail">
        <a href="javascript:void(0)" class="pf-kpi-detail-close" @click="closeKpiDetail"><i class="icon-times"></i></a>
        <div class="pf-kpi-detail-body">
          <div class="pf-kpi-detail">
          <div class="pf-kpi-label">Overall Cycle Time</div>
          <div class="pf-kpi-detail-wrapper">
          <cycle-time-kpi :tile-id="tileId" :conf="cycleTimeKpiConf"></cycle-time-kpi>
          </div>
        </div>
        <div class="pf-kpi-detail">
          <div class="pf-kpi-label">Process Variance Analysis</div>
          <div class="pf-kpi-detail-wrapper">
          <process-variant-kpi :tile-id="tileId" :conf="processVariantKpiConf"></process-variant-kpi>
          </div>
        </div>
        <div class="pf-kpi-detail">
          <div class="pf-kpi-label">Process Deviation Analysis</div>
          <div class="pf-kpi-detail-wrapper">
          <process-deviation-kpi :tile-id='tileId' :conf="processDeviationKpiConf"></process-deviation-kpi>
          </div>
        </div>
        </div>
      </div>
      <div class="kpi-container" :show="!showSelection">
        <process-kpi :conf="industryKpiConf"></process-kpi>
      </div>
    </div>
    <div class="notify" :show="!showSelection && !isMapping && showMapTip">
      <div class="desc">
        <i class="icon-warning"></i>
        <span> You have process activities haven't mapped to any of the activities in the process you compare to. </span>
      </div>
      <a class="action" href="javascript:void(0)" @click="toMapActivities">Work on activities mapping</a>
      <a href="javascript:void(0)" class="notify-close" @click="showMapTip=false"><i class="icon-close"></i></a>
    </div>
    <div class="confirm-box-wrapper" :show="showConfirmModal">
      <div class="confirm-box">
        <p class="confirm-box-message">You have activities which can be linked. Do you want to set up the linkage? </p>
        <div class="confirm-box-actions">
          <button @click="setupMapping">Yes</button>
          <button @click="cancelSetupMapping" class="default">No</button>
        </div>
      </div>
    </div>
    <div class="mapping-container" ref="mappingContainer"></div>
  </div>
</template>
<script src="./comparison-panel.js"></script>
<style src="./comparison-panel.css"></style>