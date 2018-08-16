<template>
  <div v-if="isLoading" class="component-loader" :style="{'margin-left': -(data.width || 246)/2 + 'px', 'margin-top': -(data.height || 311 + 17)/2 + 'px'}">
    <div class="loader-content">
      <div v-if="isShow" class="content-text">
        请稍等，正在加载 &#8226; &#8226; &#8226;
      </div>
    </div>
  </div>
</template>
<script src="./loader.js"></script>
<style lang="scss" src="./loader.scss" scoped></style>
