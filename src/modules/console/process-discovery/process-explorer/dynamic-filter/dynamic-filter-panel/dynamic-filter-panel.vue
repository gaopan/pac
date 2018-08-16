<template>
  <div class="dynamic-filter-panel">
  	<div class="dynamic-filter-panel-hidden"></div>
  	<div class= "dynamic-filter-panel-container">
		<div class="container">
			<p class="title">过滤条件</p>
			<div class="information">
				<p>您可以选择一个或者一组过滤条件对原始数据进行过滤.</p> 
			</div>
			<div class="selections">
				<div class="item-container" >
					<div :class="{'item-normal': !filter.highLight, 'item-normal-light':filter.highLight}" v-for="(filter,index) in seleFilters" @click="highLightItem(index)">
						<span>{{filter.label}}</span>
					</div>
				</div>
				<div class="bottom-button-container">
					<button class="btn btn-primary btn-large add" @click="selectedFilters.length > 0 && showAddFilterDetails()" :class="{ 'disabled': selectedFilters.length == 0}">添加</button>
					<p class="user-instructions" v-show="selectedFilters.length == 0">请选择至少一个过滤条件</p>
				</div>
			</div>
			
		</div>
  	</div>
  	<div>
  		<df-navigate-bar :applyFilter="false"></df-navigate-bar>
  	</div>
  </div>
</template>
<script src="./dynamic-filter-panel.js"></script>
<style src="./dynamic-filter-panel.css"></style>
