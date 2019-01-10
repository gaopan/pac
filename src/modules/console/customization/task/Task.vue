<template>
  <div class="task-container">
    <div class="container">
      <div class="task-title">{{project.name}} <span style="color: #7d7d7d">项目计划</span>
      </div>
      <p class="task-guide"><span class="red">红色节点</span>：项目关键/重大节点 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="green">绿色节点</span>：项目正常月度交付目标</p>
      <div class="task-month" v-for="task in tasks">
        <div class="month-status" v-bind:class="{'red':task.status=='red','green': task.status=='green'}"></div>
        <div class="month-name">{{task.month}}</div>
        <div>月度交付物</div>
        <ul class="month-tasks" v-if="task.items && task.items.length > 0">
        	<li v-for="(item, index) in task.items">
        		<div class="">{{index + 1}}. {{item.name}}</div>
        	</li>
        </ul>
        <div class="month-no-task" v-else>本月暂时没有交付物</div>
      </div>
    </div>
  </div>
</template>
<script src="./task.js"></script>
<style src="./task.scss" lang="scss"></style>
