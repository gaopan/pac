<template>
  <div class="cust-dashboard-input editing">
    <div class="container">
      <div class="row">
        <div class="col-xs-12">
          <h3>{{currentModule.name}}</h3>
          <div class="close" @click="cancel"><i class="icon-x"></i></div>
          <form class="form-horizontal">
            <fieldset>
              <legend></legend>
              <div class="form-group" v-for="field in currentModule.editConfig.fields">
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
                        <td v-for="f in field.fields">{{row[f.key]}}</td>
                        <td><a href="javascript:void(0)" @click="editRow(currentModule, field, row)"><i class="icon-edit-2"></i></a>
                          <a href="javascript:void(0)" @click="removeRow(currentModule, field, row)"><i class="icon-trash-2"></i></a></td>
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
                    <tbody v-if="currentModule.showForm">
                      <tr>
                        <td :colspan="field.fields.length + 1">
                          <div class="table-form-wrapper">
                            <form class="form-horizontal" v-if="field.list">
                              <div class="form-group" v-for="f in field.fields">
                                <label class="col-sm-2 control-label">{{f.name}}</label>
                                <div class="col-sm-10">
                                  <input :disabled="f.type=='current_month'" :name="f.name" v-model="currentModule.form[f.key]" v-validate="f.validate" type="text" class="form-control" :placeholder="f.name" v-if="!f.texteara&&!f.list&&!f.select" :class="{'has-error':errors.has(f.name)}">
                                  <textarea :disabled="f.type=='current_month'" v-validate="f.validate" v-model="currentModule.form[f.key]" class="form-control" :placeholder="f.name" :class="{'has-error':errors.has(f.name)}" v-if="f.texteara"></textarea>
                                  <leap-select v-if="f.select" :options="f.options" :initSelectedValue="f.value" v-on:onSelectedValues="(args)=>{f.value=args.value}"></leap-select>
                                  <table v-if="f.list" class="leap-table">
                                    <thead>
                                      <th v-for="_f in f.fields">{{_f.name}}</th>
                                      <th></th>
                                    </thead>
                                    <tbody v-if="f.listData && f.listData.length > 0">
                                      <tr v-for="row in f.listData">
                                        <td v-for="_f in f.fields">{{row[f.key]}}</td>
                                        <td><a href="javascript:void(0)" @click="editRow(field, f, row)"><i class="icon-edit-2"></i></a>
                                          <a href="javascript:void(0)" @click="removeRow(field, f, row)"><i class="icon-trash-2"></i></a></td>
                                      </tr>
                                    </tbody>
                                    <tbody v-show="!field.showForm">
                                      <tr>
                                        <td :colspan="f.fields.length + 1">
                                          <div class="table-no-data">暂时还没有数据，点击
                                            <button type="button" @click="addNewRow(field, f)" class="btn btn-primary">新增</button> 添加数据</div>
                                        </td>
                                      </tr>
                                    </tbody>
                                    <tbody v-if="field.showForm">
                                      <tr>
                                        <td :colspan="f.fields.length + 1">
                                          <div class="table-form-wrapper">
                                            <form class="form-horizontal" v-if="f.list">
                                              <div class="form-group" v-for="_f in f.fields">
                                                <label class="col-sm-2 control-label">{{_f.name}}</label>
                                                <div class="col-sm-10">
                                                  <input :disabled="_f.type=='current_month'" :name="_f.name" v-model="field.form[_f.key]" v-validate="_f.validate" type="text" class="form-control" :placeholder="_f.name" v-if="!_f.texteara&&!_f.list" :class="{'has-error':errors.has(_f.name)}">
                                                  <textarea :disabled="_f.type=='current_month'" v-validate="_f.validate" v-model="field.form[_f.key]" class="form-control" :placeholder="_f.name" :class="{'has-error':errors.has(_f.name)}" v-if="_f.texteara"></textarea>
                                                </div>
                                              </div>
                                              <div class="form-group">
                                                <div class="col-sm-offset-2 col-sm-10">
                                                  <button type="button" class="btn btn-primary" @click="saveNewRow(field, f)" :disabled="errors.any()">确定</button>
                                                  <button type="button" class="btn btn-secondary" @click="cancelNewRow(field, f)">取消</button>
                                                </div>
                                              </div>
                                            </form>
                                          </div>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                              <div class="form-group">
                                <div class="col-sm-offset-2 col-sm-10">
                                  <button type="button" class="btn btn-primary" @click="saveNewRow(currentModule, field)" :disabled="errors.any()">确定</button>
                                  <button type="button" class="btn btn-secondary" @click="cancelNewRow(currentModule, field)">取消</button>
                                </div>
                              </div>
                            </form>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </fieldset>
            <fieldset v-for="moduleTable in currentModule.editConfig.tables">
              <legend>
                <h4>{{moduleTable.name}}</h4></legend>
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
                          <td v-for="f in field.fields">{{row[f.key]}}</td>
                          <td><a href="javascript:void(0)" @click="editRow(moduleTable, field, row)"><i class="icon-edit-2"></i></a>
                            <a href="javascript:void(0)" @click="removeRow(moduleTable, field, row)"><i class="icon-trash-2"></i></a></td>
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
                      <tbody v-if="moduleTable.showForm">
                        <tr>
                          <td :colspan="field.fields.length + 1">
                            <div class="table-form-wrapper">
                              <form class="form-horizontal" v-if="field.list">
                                <div class="form-group" v-for="f in field.fields">
                                  <label class="col-sm-2 control-label">{{f.name}}</label>
                                  <div class="col-sm-10">
                                    <input :disabled="f.type=='current_month'" :name="f.name" v-model="moduleTable.form[f.key]" v-validate="f.validate" type="text" class="form-control" :placeholder="f.name" v-if="!f.texteara&&!f.list&&!f.select" :class="{'has-error':errors.has(f.name)}">
                                    <textarea :disabled="f.type=='current_month'" v-validate="f.validate" v-model="moduleTable.form[f.key]" class="form-control" :placeholder="f.name" :class="{'has-error':errors.has(f.name)}" v-if="f.texteara"></textarea>
                                    <leap-select v-if="f.select" :options="f.options" :initSelectedValue="moduleTable.form[f.key]" v-on:onSelectedValues="(args)=>{moduleTable.form[f.key]=args.value}"></leap-select>
                                  </div>
                                </div>
                                <div class="form-group">
                                  <div class="col-sm-offset-2 col-sm-10">
                                    <button type="button" class="btn btn-primary" @click="saveNewRow(moduleTable, field)" :disabled="errors.any()">确定</button>
                                    <button type="button" class="btn btn-secondary" @click="cancelNewRow(moduleTable, field)">取消</button>
                                  </div>
                                </div>
                              </form>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </fieldset>
            <div class="form-group">
              <div class="col-sm-offset-2 col-sm-10">
                <button type="button" class="btn btn-primary" @click="save" :disabled="errors.any()">保存</button>
                <button type="button" class="btn btn-primary" @click="submit" :disabled="errors.any()">提交</button>
              </div>
            </div>
          </form>
          <div class="nav-content">
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script src="./input.js"></script>
<style src="./input.scss" lang="scss"></style>
