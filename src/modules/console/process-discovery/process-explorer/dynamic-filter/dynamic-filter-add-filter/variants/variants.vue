<template>

	<div class="variants" ref="variantsContainer">
		<div class="variants-search">
			<h3>分支路径</h3>
			<div class="search-tool">
				<input type="text" placeholder="Search Variant" @keyup="searchVariants(searchVariantIpt)" v-model="searchVariantIpt"><i class="icon-search"></i>
			</div>
		</div>
		<div class="variants-chart-container" ref="variantsChartContainer">
			
		</div>
		<div class="variants-table-container" ref="variantsTableContainer">
			<table class="leap-table">
				<thead>
					<tr>
						<th v-for="(config,index) in tableTheadConfig" >
							<div v-if="config.name=='Variant'" class="select-all-variant" >
								<i :class="{'icon-check':config.selected,'variant-thead-checkbox':!config.selected}" @click="selectAllVariants(!config.selected)"></i>
								{{config.name}}
								<i :class="config.class" @click="sortVariantTableData(config)"></i>
							</div>
							<div v-if="config.name !='Variant'">
								<span>{{config.name}}</span>
								
								<i :class="config.class" @click="sortVariantTableData(config)"></i>
							</div>
						</th>
					</tr>
				</thead>
				<tbody ref="variantsTbodyContainer">
					<tr v-for="(data,index) in twoDimensionalTableData[currentPage]" :class="{'unselected':!data.selected,'selected':data.selected}">
						<td class="variants-table-firstTd">
							<i :class="{'variant-checkbox':!data.selected,'icon-check':data.selected}" @click="selectVariant(data,index)"></i>{{data.variantId}}
						</td>
						<td>{{data.cases}}</td>
						<td>{{data.events}}</td>
						<td>{{data.medianDuration}}</td>
						<td>{{data.averageDuration}}</td>
						<td>{{data.minimumDuration}}</td>
						<td>{{data.maximumDuration}}</td>
					</tr>
				<tr v-if='!twoDimensionalTableData[currentPage] || twoDimensionalTableData[currentPage].length===0'  class="no-data"><td :colspan="tableTheadConfig.length">没有数据。</td></tr>
				</tbody>

			</table>
			<div class="variants-pagination" v-if="showPaggination">
				<Pagging 
					:enableUpdatePageSize = "true"
					:page-size="pageSize" 
					:total="pageTotal" 
					:currentPage="currentPage+1" 
					:nextPageCount="3"
					v-on:pagehandler="pageHandler" 
					v-on:updatePageSize = "updatePageSize" 
					></Pagging>

			</div>

		</div>
	</div>


</template>
<script src="./variants.js"></script>
<style src="./variants.css"></style>
<style src="../attribute/attribute-panel/attribute-chart/attribute-chart-external.scss" lang="scss"></style>