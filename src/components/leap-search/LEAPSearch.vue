<template>
	<div class="leap-search search-table-input">
		<div class="search-container" :class="{'disabled': disabled, 'have-error': haveError}">
			<input type="text" v-model="searchKey" ref="searchInput" :placeholder="placeholder" :disabled="disabled" :style="{ width : width }"/>
			<i :class="{'icon-search': !searchKey, 'icon-close': searchKey}" @click="searchKey && onClickClose()"></i>
		</div>
	</div>
</template>

<script src="./leap-search.js"></script>
<style src="./leap-search.css" scoped></style>