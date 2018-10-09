<template>
  <div class="cust-dashboard-overview">
    <div class="container header-wrapper">
      <div class="header">
        <h1 v-if="isEditRemind || isEditSupport">领导关注、支持事项</h1>
        <h1 v-else-if="isViewPastRS">领导关注、支持事项往月记录</h1>
        <h1 v-else>报表类别总览</h1>
        <div class="header-actions" v-show="!moduleCreating">
          <button type="button" class="btn btn-primary" @click="toViewPastRemindAndSupport" v-show="!isEditRemind&&!isEditSupport&&!isViewPastRS">查看往月记录</button>
          <button type="button" class="btn btn-primary" @click="toEditRemind" v-if="user.isAA || user.isAdmin" v-show="!isEditRemind&&!isEditSupport&&!isViewPastRS">编辑待领导关注、支持事项</button>
          <button type="button" class="btn btn-primary" @click="toEditSupport" v-if="user.isBoss || user.isAdmin" v-show="!isEditRemind&&!isEditSupport&&!isViewPastRS">处理待领导关注、支持事项</button>
        </div>
        <p v-show="!isEditRemind && !isEditSupport && !isViewPastRS">我们现在有质量，成本，人力资源，安全，运营情况和响应一共六种报表供配置。</p>
      </div>
    </div>
    <div class="container" v-if="modules" v-show="!editingModule&&!moduleCreating&&!isEditRemind&&!isEditSupport&&!isViewPastRS">
      <div class="row">
        <div class="col-xs-12 col-md-4 col-lg-4" v-for="m in modules" v-if="m.curMonthData && m.curMonthData.month">
          <div class="module" :class="{red: m.curMonthData.status=='r',yellow:m.curMonthData.status=='y',green:m.curMonthData.status=='g'}">
            <div class="head" @click="selectModule(m)">
              <div class="avatar">
                <i :class="m.icon"></i>
              </div>
              <div class="caption">
                <div class="module-name">{{m.name}}</div>
                <p class="module-desc">{{m.desc}}</p>
              </div>
              <div class="actions">
                <span @click.stop="toEditData(m)" v-if="user.isAdmin || !m.curMonthData.isSubmitted"><i class="icon-edit-2"></i></span>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xs-12 col-md-4 col-lg-4" v-if="(user.isAA ||user.isAdmin) && remoteModules.length < configuredModules.length">
          <div class="action-add module" @click="toAddData">
            <i class="icon-plus"></i>
          </div>
        </div>
      </div>
    </div>
    <div class="container" v-if="isEditRemind">
      <form>
        <div>
          <textarea class="form-control" v-model="rs.curMonthData.remind" :placeholder="'待领导关注、支持事项'"></textarea>
        </div>
        <div class="form-static-box" v-if="rs.curMonthData.support">
          <div>领导回复</div>
          <div>{{rs.curMonthData.support}}</div>
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-primary" @click.stop="submitRemind">提交</button>
          <button type="button" class="btn btn-secondary" @click.stop="cancelEditRemind">取消</button>
        </div>
      </form>
    </div>
    <div class="container" v-if="isEditSupport">
      <form>
        <div class="form-static-box">
          <div>待关注、支持事项</div>
          <div>{{rs.curMonthData.remind}}</div>
        </div>
        <div>
          <textarea class="form-control" v-model="rs.curMonthData.support" :placeholder="'领导处理意见'"></textarea>
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-primary" @click.stop="submitSupport">提交</button>
          <button type="button" class="btn btn-secondary" @click.stop="cancelEditSupport">取消</button>
        </div>
      </form>
    </div>
    <div class="container" v-if="isViewPastRS">
      <ul class="past-rs" v-if="rs.pastData">
        <li v-for="rs in rs.pastData">
          <div>
            <div class="remind">
              <div>提醒：</div>
              <div>{{rs.remind}}</div>
            </div>
            <div class="support" v-if="rs.support">
              <div>决策：</div>
              <div>{{rs.support}}</div>
            </div>
            <div class="support" v-else>没有往月的领导关注、支持事项</div>
          </div>
          <div><div>{{rs.month}}</div></div>
        </li>
      </ul>
      <div v-else>没有领导的回复</div>
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" @click.stop="cancelViewPastRS">关闭</button>
      </div>
    </div>
    <div class="module-selection" v-show="moduleCreating&&!editingModule">
      <div class="container">
        <div class="close" @click="cancelModuleCreating"><i class="icon-x"></i></div>
        <h4 class="title">请选择一种新的类别去添加数据</h4>
        <div class="row">
          <div class="col-xs-12 col-md-4 col-lg-4" v-for="m in unConfiguredModules">
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
