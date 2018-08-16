<template>
	<div class="casePanelTableContainer">
		<table class="leap-table">
				<thead>
					<tr>
						<th v-for="(d,index) in theadConfig" :width="d.width">
							<div class="robot-thead-cell">
								<span>{{d.name}}</span>
								<i :class="{
									'icon-sort':d.sort=='normal',
									'icon-arrow-up':d.sort=='up',
									'icon-arrow-down':d.sort=='down',
									}"  @click="sortTable(index)">
								</i>
							</div>							
						</th>
					</tr>
				</thead>
				<tbody >
					<tr v-for="d in caseItemTableData">
						<td :title='d.activity'>{{d.activity}}</td>
						<td>{{d.startTime}}</td>
						<td>{{d.endTime}}</td>
						<td>{{d.waitingTime}}</td>
						<td>{{d.processingTime}}</td>
						<td>{{d.totalDuration}}</td>
						<td>{{d.userName}}</td>
					</tr>

					<tr v-if='!caseItemTableData || caseItemTableData.length===0' class="no-timeline-data">
						<td :colspan="theadConfig.length">没有数据显示</td>
					</tr>
				</tbody>
		</table>
	</div>
</template>
<script src="./case-panel-table.js"></script>
<style src="./case-panel-table.css" scoped></style>