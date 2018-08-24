<template>
  <div class="company-container">
    <div class="container">
      <div class="row">
        <div class="col-xs-12 col-md-4 col-lg-3" v-for="company in companies">
          <div class="company" @click="toDashboard(company)">
            <div class="company-name">{{company.name}}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script src="./company.js"></script>
<style src="./company.scss" lang="scss" scoped></style>
