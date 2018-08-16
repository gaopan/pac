<template>
	<div class="deviation-chart" ref='container'>
		<p class="deviation-chart-title">{{deviationTitle}}</p>
		<div class='deviation-back-button' v-show='buttonshow' @click='backDraw()'>Back to deviation</div>
		<div class="deviation-char-buttons">
			 <ul v-show="deviationChartShow">
        <li v-for="button in deviationChartButtons">
          <a :class="{active: activeButton.index === button.index}" @click="buttonChanged(button)" href="javascript: void(0);">{{button.name}}</a>
        </li>
      </ul>
		</div>
		<div id="deviation-bar-chart"></div>
	</div>
</template>

<script src="./process-deviation-kpi.js"></script>
<style src="./process-deviation-kpi.css"></style>