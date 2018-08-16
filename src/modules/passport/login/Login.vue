<template>
  <form v-on:submit.prevent="submit()">
    <div class="logo">
      <img :src="imgUrl('knight.png')"/>
    </div>
    <div class="title">账户登录</div>
    <div class="form-group">
      <div>
        <input id="loginEmail" class="form-control" type="text" placeholder="邮箱" name="loginemail" v-model="data.email" v-validate="'required|email'" :readonly="displayControl.loginBlocked" />
      </div>
      <div class="error-field" v-if="errors.has('loginemail')"> 邮箱不正确 </div>
    </div>
    <div class="form-group">
      <div>
        <input id="loginPassword" class="form-control" type="password" placeholder="密码" name="loginpassword" v-model="data.password" v-validate="'required'" :readonly="displayControl.loginBlocked" />
      </div>
      <div class="error-field" v-if="errors.has('loginpassword')"> 密码不能为空 </div>
    </div>
    <div class="forgot">
      <div id="isForgotPassword" v-on:click="gotoForgotPassword()" class="forgotPassword"><a>忘记密码？</a></div>
    </div>
    <div class="form-group">
      <span class="error-msg" v-if="displayControl.haveError">{{ displayControl.errorMessage }}</span>
      <span class="error-msg" v-if="!displayControl.haveError"></span>
    </div>
    <div class="form-group">
      <button id="loginButton" class="btn btn-primary" :disabled="errors.any() || !data.email || !data.password||displayControl.loginBlocked">登录</button>
      <div class="countdown">
        <p v-if="displayControl.countDown">{{displayControl.timmer}} s</p>
      </div>
    </div>
    <div class="form-group info">
      <span>没有账号?</span>
      <span id="isCreateNewAccount" v-on:click="gotoRegister()"><a>注册</a></span>
    </div>
  </form>
</template>
<script src="./login.js"></script>
<style lang="scss" src="./login.scss" scoped></style>
