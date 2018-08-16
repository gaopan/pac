<template>
	<div class="process-flow-process-chart">
		<pn-chart :tile-id="tileId" :conf="pnChartConf"></pn-chart>
		<!-- <div class="case-detail-shadow" v-show="showCaseDetailShadow"></div> -->
		<variant-case-panel v-if="showCaseDetailShadow" :conf="vcPanelConf"></variant-case-panel>
	</div>
</template>

<script src="./process-flow-process-chart.js" scoped></script>
<style src="./process-flow-process-chart.scss" lang="scss"></style>