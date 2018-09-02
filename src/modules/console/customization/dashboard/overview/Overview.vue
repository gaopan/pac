<template>
  <div class="cust-dashboard-overview">
    <div class="header">
      <h1>报表类别总览</h1>
      <p>我们现在有质量，成本，人力资源，安全，运营情况，响应，领导关注和支持事项一共七种报表供配置。</p>
    </div>
    <div class="container-fluid" v-if="modules" v-show="!editingModule&&!moduleCreating">
      <div class="row">
        <div class="col-xs-12 col-md-4 col-lg-3" v-for="m in modules" v-if="m.curMonthData && m.curMonthData.month">
          <div class="module" :class="{red: m.curMonthData.status=='r',yellow:m.curMonthData.status=='y',green:m.curMonthData.status=='g'}">
            <div class="head" @click="selectModule(m)">
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
                <button class="btn btn-primary" @click.stop="toEditData(m)" v-if="user.isAA || user.isAdmin" v-show="!m.isEditRemind&&!m.isEditSupport&&!m.isViewPastRS">编辑数据</button>
                <button class="btn btn-primary" v-if="user.isAA || user.isAdmin || user.isBoss" @click.stop="toViewPastRemindAndSupport(m)" v-show="!m.isEditRemind&&!m.isEditSupport&&!m.isViewPastRS">查看往月记录</button>
                <button class="btn btn-primary" @click.stop="cancelViewPastRS(m)" v-if="m.isViewPastRS">取消</button>
                <button class="btn btn-primary" v-if="user.isAA|| user.isAdmin" @click.stop="toEditRemind(m)" v-show="!m.isEditRemind&&!m.isEditSupport&&!m.isViewPastRS">编辑提醒</button>
                <button type="button" v-if="m.isEditRemind" class="btn btn-primary" @click.stop="submitRemind(m)">提交</button>
                <button class="btn btn-primary" v-if="m.isEditRemind" @click.stop="cancelEditRemind(m)">取消</button>
                <button class="btn btn-primary" v-if="user.isBoss|| user.isAdmin" @click.stop="toEditSupport(m)" v-show="!m.isEditRemind&&!m.isEditSupport&&!m.isViewPastRS">支持决策</button>
                <button type="button" class="btn btn-primary" @click.stop="submitSupport(m)" v-if="m.isEditSupport">提交</button>
                <button class="btn btn-primary" @click.stop="cancelEditSupport(m)" v-if="m.isEditSupport">取消</button>
              </div>
              <div class="content current-rs" v-show="!m.isEditRemind && !m.isEditSupport && !m.isViewPastRS">
                <div v-if="m.curMonthData.remind" class="remind">
                  <div>提醒：</div>
                  <div>{{m.curMonthData.remind}}</div></div>
                <div v-else class="remind">本月暂时没有需要支持和决策的提醒</div>
                <div v-if="m.curMonthData.support" class="support">
                  <div>决策：</div>
                  <div>{{m.curMonthData.support}}</div>
                </div>
                <div v-else class="support">本月暂时没有支持和决策</div>
              </div>
              <div class="content content-edit" v-if="m.isEditRemind">
                <form>
                  <div>
                    <textarea class="form-control" v-model="m.curMonthData.remind" :placeholder="'提醒'"></textarea>
                  </div>
                </form>
              </div>
              <div class="content content-edit" v-if="m.isEditSupport">
                <form>
                  <div>
                    <textarea class="form-control" v-model="m.curMonthData.support" :placeholder="'决策'"></textarea>
                  </div>
                </form>
              </div>
              <div class="content past-rs" v-if="m.isViewPastRS">
                <ul class="past-rs" v-if="m.pastRS">
                  <li v-for="rs in m.pastRS">
                    <div>{{rs.month}}</div>
                    <div>
                      <div class="remind"><div>提醒：</div><div>{{rs.remind}}</div></div>
                      <div class="support"><div>决策：</div><div>{{rs.support}}</div></div>
                    </div>
                  </li>
                </ul>
                <div v-else>暂时往月得需支持和决策</div>
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
