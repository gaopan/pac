<template>
	<div class="chart-area">
		<div class="activity-duration-chart-wrapper" ref="actDurChartContainer" id='actDurChartContainer'>
            
    </div>
     <div v-if='noData' class="noData"><span></span>没有数据显示</div>
    <div class="activity-duration-caption">
    	<div v-for='name in textTitle'>
	    	<p>{{name}}</p>
	    	<p :title="textContent[name]">{{textContent[name]}}</p>
    	</div>
    </div>

	</div>
</template>
<script src="./case-panel-chart.js"></script>
<style src="./case-panel-chart.css"></style>