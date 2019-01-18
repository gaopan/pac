<template>
  <div class="monthly-input">
    <div class="tabs-container">
      <div class="tab-scroll" ref="tabs">
        <div class="tabs">
          <div class="tab" v-for="m in modules" @click="activeModule(m)" :class="{active: m==editingModule}">
            <div class="tab-name">{{m.name}}</div>
          </div>
        </div>
      </div>
      <div class="tab-content">
        <report-input v-if="editingModule" :companyId="companyId" :month="curMonth" :module="editingModule" @cancelled="cancelledEdit" @submitted="submittedEdit"></report-input>
      </div>
    </div>
  </div>
</template>
<script src="./input.js"></script>
<style src="./input.scss" lang="scss"></style>
