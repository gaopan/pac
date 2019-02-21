<template>
  <div class="project-view">
    <div v-show="!newProject">
      <div class="tabs-container" v-show="projects&&(projects.length>0||user.isAdmin||user.isAA)">
        <div class="tab-scroll" ref="tabs">
          <div class="tabs">
            <div class="tab" v-for="m in projects" @click="activeProject(m)" :class="{active: m==currentProject}">
              <div class="tab-name">{{m.name}}</div>
            </div>
            <div class="tab" @click="toAddProject" v-if="user.isAdmin||user.isAA">
              <div class="tab-name"><i class="icon-plus"></i></div>
            </div>
          </div>
        </div>
        <div class="tab-content" v-if="currentProject">
          <input-form :project="currentProject" :month="curMonth" @requested="onFormRequested"></input-form>
        </div>
      </div>
      <div v-show="(!projects||projects.length<1)&&!user.isAA&&!user.isAdmin" class="no-data">没有项目，请联系管理员配置项目。</div>
    </div>
    <div v-if="newProject">
      <div class="cust-dashboard-input editing">
        <div class="container-fluid">
          <div class="row">
            <div class="col-xs-12">
              <form class="form-horizontal">
                <div class="container-fluid">
                  <div class="row">
                    <div class="col-xs-12">
                      <h3>新增项目</h3>
                    </div>
                  </div>
                </div>
                <div class="container-fluid">
                  <div class="row">
                    <div class="col-xs-12">
                      <fieldset>
                        <legend>
                          <h4>基本信息</h4>
                        </legend>
                        <div>
                          <div class="col-xs-12">
                            <div class="form-group">
                              <label class="col-sm-2 control-label">项目名：</label>
                              <div class="col-sm-10"><input type="text" name="projectName" v-model="newProject.name" class="form-control" v-validate="{required: true}" :class="{'has-error':errors.has('projectName')}" /></div>
                            </div>
                          </div>
                          <div class="col-xs-12">
                            <div class="form-group">
                              <label class="col-sm-2 control-label">项目状态：</label>
                              <div class="col-sm-10">
                                <leap-select :options="projStatusOptions" :initSelectedValue="newProject.status" v-on:onSelectedValues="(args)=>{newProject.status=args.value}"></leap-select>
                              </div>
                            </div>
                          </div>
                          <div class="col-xs-12">
                            <div class="form-group">
                              <label class="col-sm-2 control-label">描述：</label>
                              <div class="col-sm-10"><textarea v-model="newProject.description" class="form-control" /></div>
                            </div>
                          </div>
                        </div>
                      </fieldset>
                    </div>
                  </div>
                </div>
                <div class="container-fluid form-actions">
                  <div class="row">
                    <div class="form-group">
                      <div class="col-xs-12">
                        <button type="button" class="btn btn-primary" @click="submit" :disabled="errors.any()">提交</button>
                        <button type="button" class="btn btn-secondary" @click="cancel">取消</button>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script src="./input.js"></script>
<style src="./input.scss" lang="scss" scoped></style>
