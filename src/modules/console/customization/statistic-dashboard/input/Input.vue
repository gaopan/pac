<template>
  <!-- <div class="container">
    <div class="row">
      <div class="col-xs-12">
        <div class="form-header">
          <h3>编辑工时</h3>
          <p>时长单位统一为小时</p>
          <div class="form-close" @click="cancel"><i class="icon-x"></i></div>
        </div>
      </div>
    </div>
    <form class="form-horizontal">
      <fieldset v-for="company in companies">
        <legend>
          <div>{{company.name}}</div>
        </legend>
        <div class="form-group" v-for="key in keys">
          <label class="col-sm-3 control-label">{{key.name}}</label>
          <div class="col-sm-9">
            <input type="text" class="form-control" v-model="company.data[key.value]" :name="company.key + '-' + key.name" :placeholder="key.name" @change="onInputChange(company, key)" v-validate="key.validate" :class="{'has-error':errors.has(company.key + '-' + key.name)}" />
          </div>
        </div>
      </fieldset>
      <div class="form-group">
        <div class="col-sm-offset-3 col-sm-9">
          <button type="button" class="btn btn-primary" @click="save" :disabled="errors.any()">保存</button>
          <button type="button" class="btn btn-primary" @click="submit" :disabled="errors.any()">提交</button>
        </div>
      </div>
    </form>
  </div> -->
  <div style="padding: 20px">正在维护中。。。</div>
</template>
<!-- <script src="./input.js"></script> -->
