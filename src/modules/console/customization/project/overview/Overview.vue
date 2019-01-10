<template>
	<div class="project-container">
    <div class="container">
      <div class="row">
        <div class="col-xs-12 col-md-4 col-lg-3" v-for="project in projects">
          <div class="project" v-bind:class="{red: project.status=='red', green: project.status=='green', yellow: project.status=='yellow'}">
            <div class="project-name">{{project.name}}</div>
            <div class="project-caption">
              <button type="button" class="btn btn-primary" @click="toViewTask(project)">查看交付情况</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script src="./overview.js"></script>
<style lang="scss" src="./overview.scss" scoped></style>