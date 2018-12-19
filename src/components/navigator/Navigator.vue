<template>
  <div class="pac-nav">
    <div class="pac-nav-brand">
      <span class="menu-btn">
        <button class="btn btn-primary" @click="isShowMenus=true"><i class="icon-list"></i><span>导航</span></button>
      </span>
      <ol class="crumb">
        <li v-for="(crumb, index) in breadcrumbs" :class="{'active':index==breadcrumbs.length-1}" v-if="crumb.name&&crumb.name.length>0">
          {{crumb.name}}
        </li>
      </ol>
    </div>
    <div class="logo">
      <div class="user-profile" title="退出登陆" @click="logout">
        <span>{{user.firstName}} {{user.lastName}}</span>
      </div>
      <img :src="imgUrl('knight.png')" />
    </div>
    <transition name="swipe-left">
      <div class="menus-container" v-show="isShowMenus" @click="isShowMenus=false">
        <div class="menus" @click.stop>
          <div class="title">
            导航
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
  </div>
</template>
<script src="./navigator.js"></script>
<style src="./navigator.scss" lang="scss"></style>
