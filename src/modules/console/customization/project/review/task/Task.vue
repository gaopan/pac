<template>
  <div class="task-container">
    <div>
      <div class="task-title">
        <span>{{project.name}}</span>
        <span style="color: #7d7d7d">项目计划</span>
        <span class="proj-status" :class="{red:project.monthlyStatus=='red',yellow:project.monthlyStatus=='yellow',green:project.monthlyStatus=='green'}"></span>
      </div>
      <p class="task-guide"><span>三角形节点 </span>：项目关键/重大节点 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span>圆形节点 </span>：项目正常月度交付目标<br/><br/> <span class="red">红灯 </span>：项目进度严重推迟，且无长短期措施&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <span class="green">绿灯 </span>：项目正常推进&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <span class="yellow">黄灯 </span>：项目进度推迟，但有长短期措施<br/><br/> <span class="blue">蓝色对话框 </span>：当前月份的交付情况</p>
      <!-- <div class="task-tabs-wrapper" v-show="tasks&&tasks.length>0">
        <div class="task-tabs" ref="taskTabs">
          <div>
            <div class="task-tab" v-for="task in tasks" :class="{now: task.month==curMonth,active: task.month==curTask.month,'red':task.status=='red','green': task.status=='green'}"  @click="activeTask(task)">{{task.month}}</div>
          </div>
        </div>
        <div class="task-tab-content">
          <div class="task-month" v-if="curTask">
            <pre class="month-task-content" v-if="curTask.value" v-html="curTask.value"></pre>
          </div>
        </div>
      </div>
      <div class="no-data" v-show="!tasks||tasks.length<1">没有数据显示</div> -->
      <task-timeline :data="tasks" :currentMonth="curMonth"></task-timeline>
    </div>
  </div>
</template>
<script src="./task.js"></script>
<style src="./task.scss" lang="scss" scoped></style>
