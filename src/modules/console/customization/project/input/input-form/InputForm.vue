<template>
  <div class="cust-dashboard-input editing">
    <div class="container-fluid">
      <div class="row">
        <div class="col-xs-12">
          <form class="form-horizontal">
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
                          <div class="col-sm-10"><input type="text" v-model="proj.name" disabled="true" class="form-control" /></div>
                        </div>
                      </div>
                      <div class="col-xs-12">
                        <div class="form-group">
                          <label class="col-sm-2 control-label">项目状态：</label>
                          <div class="col-sm-10">
                            <leap-select :options="projStatusOptions" :initSelectedValue="proj.status" v-on:onSelectedValues="(args)=>{proj.status=args.value}"></leap-select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </fieldset>
                </div>
                <div class="col-xs-12">
                  <fieldset>
                    <legend>
                      <h4>项目计划</h4>
                    </legend>
                    <div>
                      <div class="col-xs-12">
                        <div class="form-group">
                          <label class="col-sm-2 control-label">状态：</label>
                          <div class="col-sm-10">
                            <leap-select :options="taskStatusOptions" :initSelectedValue="proj.curMonthTask.status" v-on:onSelectedValues="(args)=>{proj.curMonthTask.status=args.value}"></leap-select>
                          </div>
                        </div>
                      </div>
                      <div class="col-xs-12">
                        <div class="form-group">
                          <label class="col-sm-2 control-label">交付物：</label>
                          <div class="col-sm-10">
                            <rte :config="rteSetup.config" :dataIn="proj.curMonthTask.value" v-on:getValue="onEmittedUpdateContent">
                              <!-- <textarea style="resize: vertical;height: 300px" class="form-control" v-model="proj.curMonthTask.value"></textarea> -->
                            </rte>
                          </div>
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
                    <button type="button" class="btn btn-primary" v-if="proj.curMonthTask.step=='empty'||proj.curMonthTask.step=='saved'" @click="request('save')" :disabled="errors.any()">保存</button>
                    <button type="button" class="btn btn-primary" v-if="proj.curMonthTask.step=='empty'||proj.curMonthTask.step=='saved'" @click="request('submit')" :disabled="errors.any()">提交</button>
                    <button type="button" class="btn btn-primary" v-if="user.isAdmin && proj.curMonthTask.step=='submitted'" @click="request('approve')" :disabled="errors.any()">批准</button>
                    <button type="button" class="btn btn-primary" v-if="user.isAdmin && proj.curMonthTask.step=='submitted'" @click="request('reject')" :disabled="errors.any()">拒绝</button>
                    <button type="button" class="btn btn-primary" v-if="user.isAdmin && proj.curMonthTask.step=='approved'" @click="request('withdraw')" :disabled="errors.any()">撤回重新编辑</button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
<script src="./input-form.js"></script>
<style src="./input-form.scss" lang="scss" scoped></style>
