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
                      <div class="col-xs-12" v-for="field in currentModule.editConfig.fields">
                        <div class="form-group">
                          <label class="col-sm-2 control-label">{{field.name}}</label>
                          <div class="col-sm-10">
                            <input :disabled="field.type=='current_month'" :name="field.name" v-model="field.value" v-validate="field.validate" type="text" class="form-control" :placeholder="field.name" v-if="!field.texteara&&!field.list&&!field.select" :class="{'has-error':errors.has(field.name)}" />
                            <textarea :disabled="field.type=='current_month'" v-validate="field.validate" v-model="field.value" class="form-control" :placeholder="field.name" :class="{'has-error':errors.has(field.name)}" v-if="field.texteara"></textarea>
                            <leap-select v-if="field.select" :options="field.options" :initSelectedValue="field.value" v-on:onSelectedValues="(args)=>{field.value=args.value}"></leap-select>
                            <table v-if="field.list" class="leap-table">
                              <thead>
                                <th v-for="f in field.fields">{{f.name}}</th>
                                <th></th>
                              </thead>
                              <tbody v-if="field.listData.length > 0">
                                <tr v-for="row in field.listData">
                                  <td v-for="f in field.fields" v-if="!currentModule.form||currentModule.form.id!=row.id||currentModule.newRow!=false">{{row[f.key]}}</td>
                                  <td v-if="!currentModule.form||currentModule.form.id!=row.id||currentModule.newRow!=false"><a href="javascript:void(0)" @click="editRow(currentModule, field, row)"><i class="icon-edit-2"></i></a>
                                    <a href="javascript:void(0)" @click="removeRow(currentModule, field, row)"><i class="icon-trash-2"></i></a></td>
                                  <td v-for="f in field.fields" v-if="currentModule.form&&currentModule.form.id==row.id&&currentModule.newRow==false">
                                    <div>
                                      <input :disabled="f.type=='current_month'" :name="f.name" v-model="currentModule.form[f.key]" v-validate="f.validate" type="text" class="form-control" :placeholder="f.name" v-if="!f.texteara&&!f.list&&!f.select" :class="{'has-error':errors.has(f.name)}">
                                      <textarea :disabled="f.type=='current_month'" v-validate="f.validate" v-model="currentModule.form[f.key]" class="form-control" :placeholder="f.name" :class="{'has-error':errors.has(f.name)}" v-if="f.texteara"></textarea>
                                      <leap-select v-if="f.select" :options="f.options" :initSelectedValue="f.value" v-on:onSelectedValues="(args)=>{f.value=args.value}"></leap-select>
                                    </div>
                                  </td>
                                  <td v-if="currentModule.form&&currentModule.form.id==row.id&&currentModule.newRow==false">
                                    <a href="javascript:void(0)" @click="saveNewRow(currentModule, field)"><i class="icon-save"></i></a>
                                    <a href="javascript:void(0)" @click="cancelNewRow(currentModule, field)" :disabled="errors.any()"><i class="icon-x"></i></a>
                                  </td>
                                </tr>
                              </tbody>
                              <tbody v-show="!currentModule.showForm">
                                <tr>
                                  <td :colspan="field.fields.length + 1">
                                    <div class="table-no-data">点击
                                      <button type="button" @click="addNewRow(currentModule, field)" class="btn btn-primary">新增</button> 添加数据</div>
                                  </td>
                                </tr>
                              </tbody>
                              <tbody v-if="currentModule.showForm&&currentModule.newRow==true">
                                <tr>
                                  <td v-for="f in field.fields">
                                    <div>
                                      <input :disabled="f.type=='current_month'" :name="f.name" v-model="currentModule.form[f.key]" v-validate="f.validate" type="text" class="form-control" :placeholder="f.name" v-if="!f.texteara&&!f.list&&!f.select" :class="{'has-error':errors.has(f.name)}">
                                      <textarea :disabled="f.type=='current_month'" v-validate="f.validate" v-model="currentModule.form[f.key]" class="form-control" :placeholder="f.name" :class="{'has-error':errors.has(f.name)}" v-if="f.texteara"></textarea>
                                      <leap-select v-if="f.select" :options="f.options" :initSelectedValue="f.value" v-on:onSelectedValues="(args)=>{f.value=args.value}"></leap-select>
                                    </div>
                                  </td>
                                  <td>
                                    <a href="javascript:void(0)" @click="saveNewRow(currentModule, field)"><i class="icon-save"></i></a>
                                    <a href="javascript:void(0)" @click="cancelNewRow(currentModule, field)" :disabled="errors.any()"><i class="icon-x"></i></a>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </fieldset>
                </div>
              </div>
            </div>
            <div class="container-fluid">
              <div class="row">
                <div class="col-xs-12" v-for="moduleTable in currentModule.editConfig.tables">
                  <fieldset>
                    <legend>
                      <h4>{{moduleTable.name}}</h4>
                    </legend>
                    <div>
                      <div class="form-group" v-for="field in moduleTable.fields">
                        <label class="col-sm-2 control-label">{{field.name}}</label>
                        <div class="col-sm-10">
                          <input :disabled="field.type=='current_month'" :name="moduleTable.name + '-' + field.name" v-model="field.value" v-validate="field.validate" type="text" class="form-control" :placeholder="field.name" v-if="!field.texteara&&!field.list" :class="{'has-error':errors.has(moduleTable.name + '-' + field.name)}">
                          <textarea :disabled="field.type=='current_month'" v-validate="field.validate" v-model="field.value" class="form-control" :placeholder="field.name" :name="moduleTable.name + '-' + field.name" :class="{'has-error':errors.has(moduleTable.name + '-' + field.name)}" v-if="field.texteara"></textarea>
                          <leap-select v-if="field.select" :options="field.options" :initSelectedValue="field.value" v-on:onSelectedValues="(args)=>{field.value=args.value}"></leap-select>
                          <table v-if="field.list" class="leap-table">
                            <thead>
                              <th v-for="f in field.fields">{{f.name}}</th>
                              <th></th>
                            </thead>
                            <tbody v-if="field.listData.length > 0">
                              <tr v-for="row in field.listData">
                                  <td v-for="f in field.fields" v-if="!moduleTable.form||moduleTable.form.id!=row.id||moduleTable.newRow!=false">{{row[f.key]}}</td>
                                  <td v-if="!moduleTable.form||moduleTable.form.id!=row.id||moduleTable.newRow!=false"><a href="javascript:void(0)" @click="editRow(moduleTable, field, row)"><i class="icon-edit-2"></i></a>
                                    <a href="javascript:void(0)" @click="removeRow(moduleTable, field, row)"><i class="icon-trash-2"></i></a></td>
                                  <td v-for="f in field.fields" v-if="moduleTable.form&&moduleTable.form.id==row.id&&moduleTable.newRow==false">
                                    <div>
                                      <input :disabled="f.type=='current_month'" :name="f.name" v-model="moduleTable.form[f.key]" v-validate="f.validate" type="text" class="form-control" :placeholder="f.name" v-if="!f.texteara&&!f.list&&!f.select" :class="{'has-error':errors.has(f.name)}">
                                      <textarea :disabled="f.type=='current_month'" v-validate="f.validate" v-model="moduleTable.form[f.key]" class="form-control" :placeholder="f.name" :class="{'has-error':errors.has(f.name)}" v-if="f.texteara"></textarea>
                                      <leap-select v-if="f.select" :options="f.options" :initSelectedValue="f.value" v-on:onSelectedValues="(args)=>{f.value=args.value}"></leap-select>
                                    </div>
                                  </td>
                                  <td v-if="moduleTable.form&&moduleTable.form.id==row.id&&moduleTable.newRow==false">
                                    <a href="javascript:void(0)" @click="saveNewRow(moduleTable, field)"><i class="icon-save"></i></a>
                                    <a href="javascript:void(0)" @click="cancelNewRow(moduleTable, field)" :disabled="errors.any()"><i class="icon-x"></i></a>
                                  </td>
                                </tr>
                            </tbody>
                            <tbody v-show="!moduleTable.showForm">
                              <tr>
                                <td :colspan="field.fields.length + 1">
                                  <div class="table-no-data">点击
                                    <button type="button" @click="addNewRow(moduleTable, field)" class="btn btn-primary">新增</button> 添加数据</div>
                                </td>
                              </tr>
                            </tbody>
                            <tbody v-if="moduleTable.showForm&&moduleTable.newRow==true">
                              <tr>
                                <td v-for="f in field.fields">
                                  <div>
                                    <input :disabled="f.type=='current_month'" :name="f.name" v-model="moduleTable.form[f.key]" v-validate="f.validate" type="text" class="form-control" :placeholder="f.name" v-if="!f.texteara&&!f.list&&!f.select" :class="{'has-error':errors.has(f.name)}">
                                    <textarea :disabled="f.type=='current_month'" v-validate="f.validate" v-model="moduleTable.form[f.key]" class="form-control" :placeholder="f.name" :class="{'has-error':errors.has(f.name)}" v-if="f.texteara"></textarea>
                                    <leap-select v-if="f.select" :options="f.options" :initSelectedValue="moduleTable.form[f.key]" v-on:onSelectedValues="(args)=>{moduleTable.form[f.key]=args.value}"></leap-select>
                                  </div>
                                </td>
                                <td>
                                  <a href="javascript:void(0)" @click="saveNewRow(moduleTable, field)"><i class="icon-save"></i></a>
                                  <a href="javascript:void(0)" @click="cancelNewRow(moduleTable, field)" :disabled="errors.any()"><i class="icon-x"></i></a>
                                </td>
                              </tr>
                            </tbody>
                          </table>
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
                    <button type="button" class="btn btn-primary" v-if="!currentModule.curMonthData.monthData || !currentModule.curMonthData.monthData.isSubmitted" @click="save" :disabled="errors.any()">保存</button>
                    <button type="button" class="btn btn-primary" v-if="!currentModule.curMonthData.monthData || (!currentModule.curMonthData.monthData.isApproved && !currentModule.curMonthData.monthData.isSubmitted)" @click="submit" :disabled="errors.any()">提交</button>
                    <button type="button" class="btn btn-primary" v-if="user.isAdmin && currentModule.curMonthData.monthData && currentModule.curMonthData.monthData.isSubmitted && currentModule.curMonthData.monthData.isApproved == undefined" @click="approve(true)" :disabled="errors.any()">批准</button>
                    <button type="button" class="btn btn-primary" v-if="user.isAdmin && currentModule.curMonthData.monthData && currentModule.curMonthData.monthData.isSubmitted && currentModule.curMonthData.monthData.isApproved == undefined" @click="approve(false)" :disabled="errors.any()">拒绝</button>
                    <button type="button" class="btn btn-primary" v-if="user.isAdmin && currentModule.curMonthData.monthData && currentModule.curMonthData.monthData.isApproved" @click="withdraw" :disabled="errors.any()">撤回重新编辑</button>
                    <!-- <button type="button" class="btn btn-secondary" @click="cancel">取消</button> -->
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
<script src="./input.js"></script>
<style src="./input.scss" lang="scss" scoped></style>
