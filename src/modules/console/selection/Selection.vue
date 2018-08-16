<template>
  <div class="process-selection">
    <div class="cust-info">
      <span class="cust-logo"><img :src="customer.logoUrl"/></span>
      <span class="cust-name">{{customer.name}}</span>
      <div class="cust-actions">
        <button class="btn btn-primary" @click="goToCust">客户定制</button>
      </div>
    </div>
    <div class="process-list">
      <div class="process-box" v-for="p in processes" @click="go(p)">
        <div class="process-name">{{p.name}}</div>
        <div class="upload-time">{{p.uploadTime | publishTime}}</div>
      </div>
    </div>
  </div>
</template>
<script src="./selection.js"></script>
<style lang="scss" src="./selection.scss"></style>
