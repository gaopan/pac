<template>
  <chart class="tabbed-chart">
    <header class="tabbed-header">
      <div class="tabbed-dropdown dropdown">
        <div class="tabbed-dropdown-select" data-toggle="dropdown">
          <div class="selected" v-if="selectedTab">
            <span v-if="selectedTab.isPlainTitle">{{selectedTab.title}}</span>
            <span v-else v-html="selectedTab.title"></span>
          </div>
          <div class="selected" v-else><span>{{'No options to select' | internationalize}}</span></div>
          <span><i class="icon-arrow-down"></i></span>
        </div>
        <div class="tabbed-dropdown-options dropdown-menu">
          <ul>
            <li v-for="tab in tabs" @click="selectOption(tab)" :class="{selected: tab.index == selectedTab.index}">
              <span v-if="tab.isPlainTitle">{{tab.title}}</span>
              <span v-else v-html="tab.title"></span>
            </li>
          </ul>
        </div>
      </div>
      <div class="tabbed-actions" v-if="actions && actions.length > 0">
        <span class="action" v-for="act in actions" @click="clickAction(act)"><i :class="act.icon"></i></span>
      </div>
      <div class="tabbed-pagination" v-if="pagging">
        <paginator :page-size="pagging.pageSize" :total="pagging.total" :currentPage="pagging.pageIndex" v-on:pagehandler="pagging.onPageChange"></paginator>
        <!-- <paginator :page-size="pagging.pageSize" :total="pagging.total" :currentPage="pagging.pageIndex" :enableUpdatePageSize="pagging.enableUpdatePageSize" v-on:pagehandler="pagging.onPageChange"></paginator> -->
      </div>
    </header>
    <div class="tabbed-body">
      <slot name="tabbed-body"></slot>
    </div>
  </chart>
</template>
<script src="./tabbed-chart.js"></script>
<style src="./tabbed-chart.scss" lang="scss"></style>
