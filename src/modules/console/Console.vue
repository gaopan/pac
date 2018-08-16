<template>
	<div class="m-console">
		<header v-if="showNav">
			<navigator :menus="menus"></navigator>
		</header>
		<section :class="{'no-nav': !showNav}">
			<router-view></router-view>
		</section>
	</div>
</template>
<style src="./console.scss" lang="scss"></style>
<script src="./console.js"></script>