<template>
  <div class="monthly-review">
    <div class="tabs-container">
      <div class="tab-scroll" ref="tabs">
        <div class="tabs">
          <div class="tab" v-for="m in modules" @click="activeModule(m)" :class="{active: m==currentModule}">
            <div class="tab-name">{{m.name}}</div>
          </div>
        </div>
      </div>
      <div class="tab-content" v-if="currentModule">
      	<component :is="currentModule.dashboardConfig.type" :conf="currentModule.dashboardConfig.data"></component>
      </div>
    </div>
  </div>
</template>
<script src="./review.js"></script>
<style src="./review.scss" lang="scss"></style>
