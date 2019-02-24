<template>
  <div class="cust-dashboard-input editing">
    <div class="container-fluid">
      <div class="row">
        <div class="col-xs-12">
          <div class="form-header">
            <h3>编辑工时</h3>
            <p>时长单位统一为小时</p>
          </div>
        </div>
      </div>
      <form class="form-horizontal">
        <div class="container-fluid">
          <div class="row">
            <fieldset>
              <div class="col-xs-12" v-for="key in keys">
                <div class="form-group">
                  <label class="col-sm-3 control-label">{{key.name}}</label>
                  <div class="col-sm-9">

                    <template v-if = "key.value ==='fdgzscrj'" >
                      <!-- 法定工作时长（人均）= 法定工作总时长{{data.formData['fdgzzsc']}}/研发人员人数{{data.formData['yfryrs']}} -->
                      <input type="text" class="form-control" :disabled="key.disabled" :value="validateNumber(data.formData['fdgzzsc']/(data.formData['yfryrs']))" :name="key.name" :placeholder="key.name" v-validate="key.validate" :class="{'has-error':errors.has(key.name)}" />
                    </template>

                    <template v-else-if = "key.value ==='yfryfdgzscrj'">
                      <!-- 研发人员法定工作时长（人均）= 研发人员法定工作总时长/研发人员人数 -->
                      <input type="text" class="form-control" :disabled="key.disabled" :value="validateNumber(data.formData['yfryfdgzzsc']/(data.formData['yfryrs']))" :name="key.name" :placeholder="key.name" v-validate="key.validate" :class="{'has-error':errors.has(key.name)}" />
                    </template>

                    <template v-else-if = "key.value ==='sjgzscrj'" >
                      <!-- 实际工作时长（人均）= 实际工作总时长/企业员工人数 -->
                      <input type="text" class="form-control" :disabled="key.disabled" :value="validateNumber(data.formData['sjgzsc']/(data.formData['qyygrs']))" :name="key.name" :placeholder="key.name" v-validate="key.validate" :class="{'has-error':errors.has(key.name)}" />
                    </template>

                    <template v-else-if = "key.value ==='yfrysjgzscrj'" >
                      <!-- 研发人员实际工作时长（人均）= 研发人员实际工作总时长/研发人员人数 -->
                      <input type="text" class="form-control" :disabled="key.disabled" :value="validateNumber(data.formData['yfrysjgzsc']/(data.formData['yfryrs']))" :name="key.name" :placeholder="key.name" v-validate="key.validate" :class="{'has-error':errors.has(key.name)}" />
                    </template>

                    <template v-else-if = "key.value ==='jbscrj'" >
                      <!-- 加班时长（人均）=  加班总时长/企业员工人数 -->
                      <input type="text" class="form-control" :disabled="key.disabled" :value="validateNumber(data.formData['jbzsc']/(data.formData['qyygrs']))" :name="key.name" :placeholder="key.name" v-validate="key.validate" :class="{'has-error':errors.has(key.name)}" />
                    </template>

                    <template v-else-if = "key.value ==='yfryjbscrj'" >
                      <!-- 研发人员加班时长（人均）= 研发人员加班总时长/研发人员人数 -->
                      <input type="text" class="form-control" :disabled="key.disabled" :value="validateNumber(data.formData['yfryjbzsc']/(data.formData['yfryrs']))" :name="key.name" :placeholder="key.name" v-validate="key.validate" :class="{'has-error':errors.has(key.name)}" />
                    </template>
                    
                     <template v-else>
                      <input type="text" class="form-control" :disabled="key.disabled" v-model="data.formData[key.value]" :name="key.name" :placeholder="key.name" @change="onInputChange(key)" v-validate="key.validate" :class="{'has-error':errors.has(key.name)}" />
                    </template>

                  </div>
                </div>
              </div>
            </fieldset>
          </div>
        </div>
        <div class="container-fluid form-actions">
          <div class="row">
            <div class="form-group">
              <div class="col-xs-12">
                <button type="button" class="btn btn-primary" v-if="!data.formData.isSubmitted" @click="request('save')" :disabled="errors.any()">保存</button>
                <button type="button" v-if="!data.formData.isSubmitted" class="btn btn-primary" @click="request('submit')" :disabled="errors.any()">提交</button>
                <button type="button" class="btn btn-primary" v-if="user.isAdmin && data.formData.isSubmitted && !data.formData.isApproved" @click="request('approve')" :disabled="errors.any()">批准</button>
                <button type="button" class="btn btn-primary" v-if="user.isAdmin && data.formData.isSubmitted && !data.formData.isApproved" @click="request('reject')" :disabled="errors.any()">拒绝</button>
                <button type="button" class="btn btn-primary" v-if="user.isAdmin && data.formData.isApproved" @click="request('withdraw')" :disabled="errors.any()">撤回重新编辑</button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>
<script src="./input.js"></script>
<style src="./input.scss" lang="scss" scoped></style>
