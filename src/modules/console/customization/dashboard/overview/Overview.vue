<template>
  <div class="cust-dashboard-overview">
    <div class="container" v-if="modules" v-show="!editingModule&&!moduleCreating">
      <div class="row">
        <div class="col-xs-12 col-md-4 col-lg-3" v-for="m in modules" v-if="m.curMonthData && m.curMonthData.month">
          <div class="module" @click="selectModule(m)" :class="{red: m.curMonthData.status=='r',yellow:m.curMonthData.status=='y',green:m.curMonthData.status=='g'}">
            <div class="head">
              <div class="avatar">
                <i :class="m.icon"></i>
              </div>
              <div class="caption">
                <div class="module-name">{{m.name}}</div>
                <p class="module-desc">{{m.desc}}</p>
              </div>
            </div>
            <div class="comments">
              <div class="actions">
                <button class="btn btn-primary" @click.stop="toEditData(m)" v-if="user.isAA || user.isAdmin">编辑数据</button>
                <button class="btn btn-primary" v-if="user.isAA || user.isAdmin || user.isBoss">查看往月记录</button>
                <button class="btn btn-primary" v-if="user.isAA">编辑提醒</button>
                <button class="btn btn-primary" v-if="user.isBoss">支持决策</button>
              </div>
              <div class="content">
                <ul v-if="m.curMonthData.comments && m.curMonthData.comments.length > 0">
                  <li v-for="comment in m.curMonthData.comments">
                    <div>{{comment.content}}</div>
                  </li>
                </ul>
                <div v-else>本月暂时没有需要支持和决策的提醒</div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xs-12 col-md-4 col-lg-3" v-if="remoteModules.length < configuredModules.length">
          <div class="action-add module" @click="toAddData">
            <i class="icon-plus"></i>
          </div>
        </div>
      </div>
    </div>
    <div class="module-selection" v-show="moduleCreating&&!editingModule">
      <div class="container">
        <div class="close" @click="cancelModuleCreating"><i class="icon-x"></i></div>
        <h4 class="title">请选择一种新的类别去添加数据</h4>
        <div class="row">
          <div class="col-xs-12 col-md-4 col-lg-3" v-for="m in unConfiguredModules">
            <div class="module" @click="toEditData(m)">
              <div class="head">
                <div class="avatar">
                  <i :class="m.icon"></i>
                </div>
                <div class="caption">
                  <div class="module-name">{{m.name}}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <report-input v-if="editingModule" :module="editingModule" @cancelled="cancelledEdit" @submitted="submittedEdit"></report-input>
  </div>
</template>
<script src="./overview.js"></script>
<style src="./overview.scss" lang="scss"></style>
