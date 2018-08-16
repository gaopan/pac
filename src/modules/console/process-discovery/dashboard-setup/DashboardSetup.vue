<template>
	<div class="dashboard-setup">
		<div class="head">
			<span class="title">{{title}}</span>
			<span class="actions">
			  <button class="btn btn-primary" v-if="currentStatus==1" @click="toEditView" :class="{'disabled':!availableFields||!loadedConfig}"><i class="icon-edit"></i>Edit View</button>
			  <button class="btn btn-secondary" @click="close" v-if="currentStatus==1">Close</button>
				<button class="btn btn-secondary" @click="cancel" v-if="currentStatus==2">Cancel</button>
			</span>
		</div>
		<div class="body" :class="{'config': isShowConfPanel}">
			<dashboard-configure-panel :config = "currentDashboardConf" :min-order="minOrder" :max-order="maxOrder" :order="currentTileOrder" :fields="availableFields" v-if="isShowConfPanel" @prev="prev" @next="next" @save="saveConfiguration"></dashboard-configure-panel>
			<tile-panel :tiles="tiles" config="{fixed: true}" :tile-panel-id="tilePanelId"></tile-panel>
		</div>
	</div>
</template>

<script src="./dashboard-setup.js"></script>
<style src="./dashboard-setup.scss" lang="scss"></style>
<style src="./template/value-comparison/value-comparison.css"></style>