<template>
    <div class="mini-loader" v-if="isLoading">
        <div class="mini-loader-bar" :style="{width: width}" @click="onClickLoaderBar" title="点击这里取消."></div>
        <div class="mini-loader-mask">
        	<loader :is-loading="isLoading" :show-text="true"></loader>
        </div>
        <div class="mini-loader-mask-tip" :style="{left: width}" v-if="showMaskTip">
        	<button class="btn" @click="cancel">取消</button>
        </div>
    </div>
</template>

<script src="./mini-loader.js"></script>

<style src="./mini-loader.scss" lang="scss"></style>