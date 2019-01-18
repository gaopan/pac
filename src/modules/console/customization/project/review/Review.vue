<template>
  <div class="project-review">
    <div class="tabs-container">
      <div class="tab-scroll" ref="tabs">
        <div class="tabs">
          <div class="tab" v-for="m in projects" @click="activeProject(m)" :class="{active: m==currentProject}">
            <div class="tab-name">{{m.name}}</div>
          </div>
        </div>
      </div>
      <div class="tab-content" v-if="currentProject">
      	<task :project="currentProject"></task>
      </div>
    </div>
  </div>
</template>
<script src="./review.js"></script>
<style src="./review.scss"></style>
