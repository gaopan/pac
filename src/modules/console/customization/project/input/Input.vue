<template>
  <div class="project-input">
    <div class="tabs-container">
      <div class="tab-scroll" ref="tabs">
        <div class="tabs">
          <div class="tab" v-for="m in projects" @click="activeProject(m)" :class="{active: m==currentProject}">
            <div class="tab-name">{{m.name}}</div>
          </div>
        </div>
      </div>
      <div class="tab-content" v-if="currentProject">
      	<input-form :project="currentProject" :month="curMonth"></input-form>
      </div>
    </div>
  </div>
</template>
<script src="./input.js"></script>
<style src="./input.scss"></style>
