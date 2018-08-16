<!-- 
Implementation base from https://vuejs.org/v2/examples/modal.html
-->
<template>
  	<div class="custom-modal">
  	    <div class="custom-modal-mask">
	      <div class="custom-modal-wrapper">
	        <div class="custom-modal-container" :style="containerStyle">
	          <div class="custom-modal-header" :style="headerStyle">
	            <slot name="header">
	              default header
	            </slot>
	          </div>

	          <div class="custom-modal-body" :style="bodyStyle">
	            <slot name="body">
	              default body
	            </slot>
	          </div>

	          <div class="custom-modal-footer" :style="footerStyle" v-if="!hideFooter">
	            <slot name="footer">
	              <button class="custom-modal-default-button" @click="$emit('close')">
	                OK
	              </button>
	            </slot>
	          </div>
	        </div>
	      </div>
	    </div>
	</div>
</template>

<script src="./modal.js"></script>

<style src="./modal.scss" lang="scss" scoped></style>

