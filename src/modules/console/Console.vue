<template>
	<div class="m-console">
		<header v-if="menus">
			<navigator :menus="menus"></navigator>
		</header>
		<section>
			<router-view></router-view>
		</section>
	</div>
</template>
<style src="./console.scss" lang="scss"></style>
<script src="./console.js"></script>