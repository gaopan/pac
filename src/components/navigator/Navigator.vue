<template>
  <div class="pac-nav">
    <div class="pac-nav-brand">
      <span class="logo"></span>
      <span class="menu-btn"><button class="btn btn-primary
        " @click="isShowMenus=true"><i class="icon-list"></i><span>导航</span></button>
      </span>
      <ol class="crumb">
        <li v-for="(crumb, index) in breadcrumbs" :class="{'active':index==breadcrumbs.length-1}">
          {{crumb.name}}
        </li>
      </ol>
    </div>
    <div class="pac-nav-right">
    </div>
    <transition name="swipe-left">
      <div class="menus-container" v-show="isShowMenus" @click="isShowMenus=false">
        <div class="menus" @click.stop>
          <div class="title">
            导航
          </div>
          <div v-show="!activedModule" class="menu-module-wrapper">
            <div class="menu-module" v-for="m in navs" @click="activeModule(m)">
              {{m.name}}
            </div>
          </div>
          <div v-if="activedModule" class="menus-group-wrapper">
            <div class="module-name">{{activedModule.name}}</div>
            <div class="module-close" @click="activedModule=null">
              <i class="icon-x"></i>
            </div>
            <div class="menu-group" v-for="mm in activedModule.childNodes">
              <div class="menu-group-holder" :class="{active: mm.isActive}">
                <span class="menu-name">{{mm.name}}</span>
              </div>
              <ul>
                <li v-for="cm in mm.childNodes">
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
