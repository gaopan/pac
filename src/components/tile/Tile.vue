<template>
  <div class="tile" :id="id" :class="{dragging: isResizing || isTransforming, hover: isHover, 'full-screen': isFullScreen}" :style="{transform: transToString(), width: size.width + 'px', height: size.height + 'px'}">
    <div class="tile-wrapper" :id="title">
      <div class="tile-title" :style="styles.title">
        <header>{{title}}</header>
      </div>
      <div class="tile-layout" :style="styles.layout">
        <slot></slot>
      </div>
      <div class="tile-actions" :style="styles.actions">
        <div class="handler" title="Full screen" v-if="!isDisabledFullScreen" :show="!isFullScreen" v-on:click="toFullScreen">
          <i class="icon-maximize-2"></i>
        </div>
        <div class="handler" title="Exit full screen" v-if="!isDisabledFullScreen" :show="isHover&&isFullScreen" v-on:click="exitFullScreen">
          <i class="icon-minimize-2"></i>
        </div>
        <div class="handler" title="Refresh" v-if="!isDisabledRefresh" :show="isHover" v-on:click="broadcastResized">
          <i class="icon-refresh"></i>
        </div>
        <div class="handler" title="Cancel loading" v-if="isLoading" :show="isLoading" v-on:click="cancelLoad">
          <i class="icon-ban"></i>
        </div>
        <div class="handler" v-if="conf.customActions && conf.customActions.length > 0" v-for="act in conf.customActions" :class="act.class" :show="isHover&&!act.hide" v-on:click="act.onClick($event, self)">
          <i :class="act.icon"></i>
        </div>
        <transform-handler v-if="!isFixed" :show="isHover&&!isFullScreen" :tile-id="id"></transform-handler>
      </div>
      <resize-handler v-if="!isFixed" :show="isHover&&!isFullScreen" :tile-id="id"></resize-handler>
    </div>
  </div>
</template>
<script src="./tile.js"></script>
<style src="./tile.css"></style>
