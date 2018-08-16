<template>
<div class="cycle-time-kpi">
    <div class="row">
		<div class="col-md-8 col-xs-12 cycle-time-kpi-select-box" >
			<leap-select 
				:initSelectedValue="'Overall Cycle Time'" 
				:options="processSelection" 
				v-on:onSelectedValues="fnSelected">
			</leap-select>
		</div>
		<div class="buttons col-md-4">
		  <ul v-show="showTimeBreakdownChart">
		    <li v-for="button in timeBreakdownButtons">
		      <a :class="{active: timeBreakdConnButton.index === button.index}" @click="buttonTBChanged(button)" href="javascript: void(0);">{{button.name}}</a>
		    </li>
		  </ul> 
		  <ul v-show="showTimeBreakdownActiveChart">
		    <li v-for="button in timeBreakdownButtons">
		      <a :class="{active: timeBreakdActiveButton.index === button.index}" @click="buttonTBAhanged(button)" href="javascript: void(0);">{{button.name}}</a>
		    </li>
		  </ul>
		 <ul class="row " v-show=" showTimeConsumingChange"> 
	      <span class="col-md-7" style="padding:0;">Top 3 possible discrepancies and probability</span>
	        <li class="col-md-5" style="padding:0;">
	          <a  @click="buttonTCCChanged()" href="javascript: void(0);" style="padding:3px;height:17px;">Bcak</a>
	        </li>
	      </ul>
		  <ul v-show="showTimeConsumingChart">
		    <li v-for="button in timeConsumingButtons">
		      <a :class="{active: timeConsumingactiveButton.index === button.index}" @click="buttonTCChanged(button)" href="javascript: void(0);">{{button.name}}</a>
		    </li>
		  </ul>
 		</div>
 	</div>
	<div class="overallCycleTimeChart" 
	     ref="overallCycleTimeChart"
	     id="overallCycleTimeChart"
	     v-show="showOverallCycleTimeChart">
	</div>
	<div class="cycle-detail" 
	     ref="timeBreakdownActiveChart"
	     id="timeBreakdownActiveChart"
	     v-show="showTimeBreakdownActiveChart">
	</div>
	<div class="cycle-detail" 
	     ref="timeBreakdownChart"
	     id="timeBreakdownChart"
	     v-show="showTimeBreakdownChart">
	</div>
	<div class="cycle-detail" 
	     ref="timeConsumingChart"
	     id="timeConsumingChart"
	     v-show="showTimeConsumingChart">
	</div>
    <div class="cycle-detail" 
	     ref="cycleBarChart"
	     id="cycleBarChart"
	     v-show="showTimeConsumingChange">
	</div>
</div>
</template>
<script src="./cycle-time-kpi.js"></script>
<style src="./cycle-time-kpi.css"></style>