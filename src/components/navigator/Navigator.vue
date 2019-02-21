<template>
  <div class="pac-nav-wrapper">
    <transition>
      <div class="menus-container" v-show="isShowMenus">
        <div class="menus" @click.stop>
          <div class="menus-options">
            <div class="menus-option" v-show="showMonthSelect">
              <datepicker v-model="date" :format="'yyyy-MM'" :placeholder="'选择月份'" :calendarButton="true" :clearDateButton="false" :initialView="'month'" :disabledDayView="true">
              </datepicker>
            </div>
          </div>
          <div class="menus-group-wrapper">
            <div class="menu-group" v-for="m in navs">
              <div class="menu-group-holder" :class="{active: m.isActive}" v-if="m.childNodes">
                <span class="menu-name">{{m.name}}</span>
              </div>
              <div v-else class="menu-item" :class="{'active':m.isActive}" @click="clickOnMenu(m)">
                <span class="menu-name">{{m.name}}</span>
              </div>
              <ul v-if="m.childNodes">
                <li v-for="cm in m.childNodes">
                  <div class="menu-item" :class="{'active':cm.isActive}" @click="clickOnMenu(cm)">
                    <span class="menu-name">{{cm.name}}</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <mini-loader></mini-loader>
    <div class="pac-nav">
      <div class="pac-nav-brand">
        <span class="menu-btn">
          <button class="btn btn-primary" @click="">上汽集团-月报系统 演示版</button>
        </span>
        <ol class="crumb">
          <li v-for="(crumb, index) in breadcrumbs" :class="{'active':index==breadcrumbs.length-1}" v-if="crumb.name&&crumb.name.length>0">
            {{crumb.name}}
          </li>
        </ol>
      </div>
      <div class="logo">
        <span class="current-company">{{paramsBundle.companyName}}</span>
        <div class="user-profile" title="退出登陆" @click="logout">
          <span>{{user.firstName}} {{user.lastName}}</span>
        </div>
        <img :src="imgUrl('knight.png')" />
      </div>
    </div>
  </div>
</template>
<script src="./navigator.js"></script>
<style src="./navigator.scss" lang="scss" scoped></style>
