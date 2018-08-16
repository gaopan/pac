<template>
  <div class="dynamic-filter-info-bar">
    <div class="dynamic-filter-info-bar-container">
      <div class="filter-action-button" @click="showDFPanel">
        <div class="filter-icon">
          <i class="icon-filter"></i>
        </div>
        <div class="filter-icon-label">
          <span>过滤</span>
        </div>
      </div>
      <div class="filter-action-options" v-show="showFilterActionOptions">
        <ul>
          <li class="parting-line">|</li>
          <li class="filter-option-clear-all">
            <div class="clear-all-text" @click="deleteAllAddFilterDetails()">清除所有</div>
          </li>
          <li :class="{ 'filter-option-text': filterOption.filterName != 'Attribute' }" v-for="filterOption in filterOptions" v-if="fnShowHideOptionName(filterOption)">
              <span v-if="filterOption.filterName !='Attribute'">
                <span class="filter-action-text" @click="showThisAddFilterDetails(filterOption.index)">{{filterOption.filterName | internationalize}}</span>
                <i class="filter-action-icon-remove icon-close2" @click="deleteThisAddFilterDetails(filterOption)"></i>
              </span>
              <span v-else v-for="attribute in filterOption.options" class="attribute-wrapper">
                <span class="filter-action-text" @click="showThisAddFilterDetails(filterOption.index, attribute)">{{ attribute.name | camelToTitleCase }}</span>
                <i class="filter-action-icon-remove icon-close2" @click="deleteThisAddFilterDetails(filterOption, attribute)"></i>
              </span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script src="./dynamic-filter-info-bar.js"></script>
<style src="./dynamic-filter-info-bar.scss" lang="scss"></style>
