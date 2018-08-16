<!-- Draw PN Chart Movie with canvas -->
<template>
  <chart>
    <div class="pn-chart-movie">
      <div class="pnp-content" ref="container"></div>
      <div class="pnp-controls">
        <span class="pnp-play-btn-wrapper">
						<button @click="togglePlay()"><i :class="{'icon-pause':isPlaying, 'icon-play':!isPlaying}"></i></button>
					</span>
        <div class="pnp-progress-bar-wrapper">
          <div class="pnp-progress-bar">
            <div class="pnp-play-progress" :style="{width: progress}"></div>
          </div>
        </div>
        <div class="pnp-current-time-wrapper">
          <div class="pnp-current-time-container">
            <div class="pnp-current-time">{{currentFrameDate.hour}}:{{currentFrameDate.minute}}:{{currentFrameDate.second}}</div>
            <div class="pnp-current-date">
              <div class="pnp-current-date-week">{{currentFrameDate.day}} {{currentFrameDate.date}}</div>
              <div class="pnp-current-date-day">{{currentFrameDate.month}} {{currentFrameDate.year}}</div>
            </div>
          </div>
        </div>
        <div class="pnp-speed-controller-wrapper">
          <div class="pnp-speed-controller">
            <div class="pnp-slider" ref="speedSlider"></div>
          </div>
          <div class="pnp-speed-controller-caption">
            <label class="label-slow">slow</label>
            <label class="label-fast">fast</label>
          </div>
        </div>
      </div>
    </div>
  </chart>
</template>
<script src="./pn-chart-movie.js" scoped></script>
<style src="./pn-chart-movie.css"></style>
