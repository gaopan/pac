<template>
  <div class="img-upload-as-data-url">
    <div class="content">
      <label>
        <i v-show="!sDataUrl" class="icon icon-cloud-upload"></i>
        <span v-show="!sDataUrl">Click to upload</span>
        <img v-show="sDataUrl" :src="sDataUrl" alt="Wrong Image Data" />
        <input type="file" ref="imgUpload" @change="fileChanged()" accept="image/*" />
      </label>
    </div>
  </div>
</template>

<script src="./img-upload-as-data-url.js"></script>
<style src="./img-upload-as-data-url.css"></style>