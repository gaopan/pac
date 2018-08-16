<template>
  <div class="dynamic-filter">
  	<df-info-bar></df-info-bar>
  	<div v-show="isShowDFPanel">
			<df-panel :isEnableAttributeTab="isEnableAttributeTab"></df-panel>
		</div>
  	<div v-show="isShowAddFilterDetails">
			<df-add-filter :isEnableAttributeTab="isEnableAttributeTab" :isShowAddFilterDetails="isShowAddFilterDetails" v-on:propagateFilter="onPropagateFilter">
		</df-add-filter></div>
	</div>
</template>

<script src="./dynamic-filter.js"></script>