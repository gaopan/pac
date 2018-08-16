<template>
	<div class="df-touch-points">
		<h3>接触点</h3>
		<p class="tp-search">
			<leap-search
				:searchTitle="'Touch Point'"
				v-on:searchText="fnDoSearch">
			</leap-search>
		</p>
		<div class="tp-content">
			<div class="tp-chart-container" >
				<div class="tp-box-wrapper" ref="tpContainer">
					<div id="tp-bar-chart"></div>
				</div>
			</div>
			<div class="tp-table-container">
				<div class="tp-box-wrapper"> 
					<table>
						<thead class="tp-thead">
							<tr>
								<th v-for="(tableHeader,heIndex) in tableData.headers">
									<div class="select-header" :class="{'select-header':!showAllSelect,'show-all-select':showAllSelect}"v-if="heIndex == 0" @click="fnSelectAll()">
 								  	<i class="icon-check"></i>
    						  </div>

									<div class="sort-column" >{{tableHeader.name}}</div>
									<span class="sort-icons pull-right"><i @click="fnSortColumn(heIndex)" :class="tableHeader.icons"></i></span>
								</th>
							</tr>
						</thead>
						<tbody class="tp-tbody">
							<tr v-for = "(rowData,index) in tableData.data" :class="{'select-tr':rowData.select}">
								<td class="display-td">
									<div class="single-checkbox select-column icon-check" :class="{'selected':rowData.select}" @click="fnClickTableColumn(index)">
									</div>
									<div class="cell-content cell-content-attribute-value">
										<p class="attribute-value">{{rowData.attributeValue}}</p>
									</div>
								</td>
								<td class="display-td">
									<div class="cell-content">
										<div class="table-td-text">{{rowData.frequency}}</div>
									</div>
								</td>
								<td class="display-td">
									<div class="cell-content">
										<div class="table-td-text">{{rowData.medianDuration}}</div>
									</div>
								</td>
								<td class="display-td">
									<div class="cell-content">
										<div class="table-td-text">{{rowData.averageDuration}}</div>
									</div>
								</td>
								<td class="display-td">
									<div class="cell-content">
										<div class="table-td-text">{{rowData.minimumDuration}}</div>
									</div>
								</td>
								<td class="display-td">
									<div class="cell-content">
										<div class="table-td-text">{{rowData.maximumDuration}}</div>
									</div>
								</td>
							</tr>
							<tr v-if='tableData.data.length == 0' class="no-data"><td :colspan="tableData.headers.length">没有数据。</td></tr>
						</tbody>
					</table>
				</div>
			</div>
			<div class="tp-paging-container" v-if="showPaggination">        
				<Pagging
					:enableUpdatePageSize="true"
					:page-size="tpPageSize" 
					:total="tpTotal" 
					:currentPage="currentIndexPage" 
					:nextPageCount="3"
					v-on:updatePageSize = "fnUpdateListSize"
					v-on:pagehandler="fnTpPageHandler">
				</Pagging>			
      </div>
		</div>
	</div>
</template>

<script src="./touch-points.js"></script>
<style src="./touch-points.css"></style>