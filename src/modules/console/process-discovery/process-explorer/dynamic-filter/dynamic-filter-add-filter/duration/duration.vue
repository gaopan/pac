<template>
  <div class="df-duration" ref="df-duration">
    <h4>持续时间</h4>
    <div class="mixed-chart">
      <div class="line-chart">
        <div class="chart"></div>
        <div class="x-axis" v-show="durationData.length">持续时间</div>
      </div>
      <div class="dragged-ruler">
        <div class="chart"></div>
      </div>
    </div>
    <div class="mixed-box">
      <div class="choosed-box min-box">
        <div class="title">设置最小持续时间</div>
        <form class="form-inline" novalidate>
          <div class="form-group">
            <input type="number" v-model="minDurationConf.model.num" class="form-control" />
          </div>
          <div class="form-group">
            <leap-select
              :options="selectList"
              :initSelectedValue="minDurationConf.unit"
              @onSelectedValues="(args) => { changedUnit('min', args) }">
            </leap-select>
          </div>
        </form>
        <button class="btn btn-primary"
          @click="setDurationValue('min')"
          :disabled="minDurationConf.num === minDurationConf.model.num && minDurationConf.unit == minDurationConf.model.unit">
          设置
        </button>
      </div>
      <div class="state-box">
        <p class="title">选择的实例</p>
        <p class="state">{{casePercent}}</p>
        <!-- <p class="note">Use cases running shorter that {{maxDurationConf.num}} {{maxDurationConf.unit}}</p> -->
      </div>
      <div class="choosed-box max-box">
        <div class="title">设置最大持续时间</div>
        <form class="form-inline" novalidate>
          <div class="form-group">
            <input type="number" v-model="maxDurationConf.model.num" class="form-control" />
          </div>
          <div class="form-group">
            <leap-select
              :options="selectList"
              :initSelectedValue="maxDurationConf.unit"
              @onSelectedValues="(args) => { changedUnit('max', args) }">
            </leap-select>
          </div>
        </form>
        <button class="btn btn-primary"
          @click="setDurationValue('max')"
          :disabled="maxDurationConf.num === maxDurationConf.model.num && maxDurationConf.unit == maxDurationConf.model.unit">
          设置
        </button>
      </div>
    </div>
  </div>
</template>

<script src="./duration.js"></script>
<style src="./duration.css"></style>
