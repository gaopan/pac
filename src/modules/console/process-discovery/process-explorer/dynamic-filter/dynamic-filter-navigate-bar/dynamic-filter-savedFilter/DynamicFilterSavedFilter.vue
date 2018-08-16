<template>
	<leap-dropupdown :originContainer="saveAsOrigin" dropType="up" v-on:closeDropupdown="closeSavedFilter">
    <div class="dropUpContainer">
      <div class="custom-dropup-savedFilter">
        <ul>
          <li class="clearfix">
           <div class="template-name-container pull-left">
              <span class="filter-header">{{'History' | internationalize}}</span>
            </div>
          </li>
          </ul>
          <ul>
          <li class="clearfix" v-for="(savedFilter,index) in historyFilters">
            <div class="template-name-container pull-left" :class="{'selected': savedFilter.active }" @click="selectSavedFilterHistory(index)">
              <span class="filter-name">{{ savedFilter.name }}</span>
              <span class="created-date">{{'Created on' | internationalize}} {{ savedFilter.modifiedOn | convertDateTime}} </span>
            </div>
            <!--<div class="template-action-container pull-left" v-if="applyFilter">-->
            <div class="template-action-container pull-left">
             <i class="icon-trash-o" @click="deleteFilter(savedFilter, 'History')"></i>
              <i class="icon-check" :class="{'applied': savedFilter.active}"  @click="selectSavedFilterHistory(index)"></i>
              <!--<span @click="favouriteSavedFilter(savedFilter)">
                <i class="icon-star-o" v-show="!savedFilter.fav"></i>
                <i class="icon-star" :class="{'fav': savedFilter.fav }" v-show="savedFilter.fav"></i>
              </span> -->
            </div>
          </li>
        </ul>
        </div>
       <div class="custom-dropup-savedFilter">
         <ul>
          <li class="clearfix">
           <div class="template-name-container pull-left">
              <span class="filter-header">{{'Saved' | internationlize}}</span>
            </div>
          </li>
        </ul>
        <ul>
          <li class="clearfix" v-for="(savedFilter,index) in savedFilters">
            <div class="template-name-container pull-left" :class="{'selected': savedFilter.active }" @click="selectSavedFilter(index)">
              <span>{{ savedFilter.name }}</span>
            </div>
            <!-- <div class="template-action-container pull-left" v-if="applyFilter"> -->
            <div class="template-action-container pull-left">
              <span @click="favouriteSavedFilter(savedFilter)">
                <i class="icon-star-o" v-show="!savedFilter.fav"></i>
                <i class="icon-star" :class="{'fav': savedFilter.fav }" v-show="savedFilter.fav"></i>
              </span>
              <i class="icon-trash-o" @click="deleteFilter(savedFilter, 'Saved')"></i>
              <i class="icon-check" :class="{'applied': savedFilter.active}"  @click="selectSavedFilter(index)"></i>
              
            </div>
          </li>
        </ul>
      </div>
    </div>
    
	</leap-dropupdown>
</template>

<script src="./dynamic-filter-saved-filter.js"></script>
<style src="./dynamic-filter-saved-filter.scss" scoped></style>