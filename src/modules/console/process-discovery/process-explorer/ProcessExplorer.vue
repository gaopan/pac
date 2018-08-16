<template>
	<div class="process-explorer">
		<dynamic-filter></dynamic-filter>
		<div class="process-explorer-content">
			<router-view></router-view>
		</div>
	</div>
</template>

<script src="./process-explorer.js"></script>
<style src="./process-explorer.scss" lang="scss"></style>