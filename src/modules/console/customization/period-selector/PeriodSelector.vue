<template>
	<div class="period-selector">
		<div>按</div>
		<div class="selector">
			<leap-select :options="periodOptions" :initSelectedValue="selectedPeriodOption" v-on:onSelectedValues="changedPeriodOption"></leap-select>
		</div>
		<div>统计</div>
		<div class="selector" v-if="periodList">
			<leap-select :options="periodList" :initSelectedValue="selectedPeriodItem" @onSelectedValues="changedPeriodItem"></leap-select>
		</div>
	</div>
</template>
<script src="./period-selector.js"></script>
<style src="./period-selector.scss" lang="scss"></style>