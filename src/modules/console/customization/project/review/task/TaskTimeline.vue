<template>
	<div class="task-timeline" ref="timeline" :class="{'no-data':!data||data.length<1}"></div>
</template>
<script src="./task-timeline.js"></script>
<style src="./task-timeline.scss" lang="scss"></style>