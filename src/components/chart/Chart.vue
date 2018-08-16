<template>
	<div class="chart-container">
		<slot></slot>
	</div>
</template>

<script>
export default {
  name: 'chart'
}
</script>
<style>
.chart-container {
	width: 100%;
	height: 100%;
}
</style>
