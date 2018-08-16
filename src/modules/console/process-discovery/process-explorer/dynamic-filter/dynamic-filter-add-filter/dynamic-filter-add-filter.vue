<template>
  <div class="dynamic-add-filter">
    <div class="dynamic-filter-details-hidden"></div>
    <div class="dynamic-filter-details-container" v-show="addFilterNavItemsNum>0">
      <div class="addFilterNavItems">
        <ul>
          <li v-for="addFilterNavItem in addFilterNavItems" :class="{itemBar:!addFilterNavItem.click,clickedItemBar:addFilterNavItem.click}">
            <a>
              <span :class="{itemText:!addFilterNavItem.click,clickedItemText:addFilterNavItem.click}" @click="itemChange(addFilterNavItem.index)">{{addFilterNavItem.label}}</span>
              <span v-show="addFilterNavItem.icon == 'trash'">
                <i class="dfTrashIcon icon-minus-square" @click="deleteFilterItem(addFilterNavItem.index)"></i>
              </span>
              <span v-show="addFilterNavItem.icon == 'ellipsis'&&addFilterNavItem.index!=addFilterNavItemsNum-1">
                <i class="dfEllipsisIcon">|</i>
              </span>
            </a>
          </li>
        </ul>
        <div class="addFilterButton dropdown" v-show="addFilterOptions.length>0">
          <div class="addFilterButtonContainer dropdown-toggle" data-toggle="dropdown">
            <i class="addFilterIcon icon-plus"></i>添加
          </div>
          <div class="dropdown-menu dropdown-menu-right addFilterDropdownMenu">
            <div class="dropDownOptionTriangle"></div>
            <div class="dropDownOption" v-for="addFilterOption in addFilterOptions">
              <div class="dropDownOptionText" @click="addFilterItem(addFilterOption)">{{addFilterOption | internationalize}}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="addFilterPanel">
        <div v-for="addFilterNavItem in addFilterNavItems" v-if="addFilterNavItems.length > 0">
          <div v-if="addFilterNavItem.click == true">
            <div v-if="addFilterNavItem.key == 'Date Range'">
              <df-date-range :localSectionFilter="getLocalSectionData('date_range')"  :filterDetailData="filtersDetailData.dataRange"  @dataRangeFDChange="getFilterDetailData"></df-date-range>
            </div>
            <div v-if="addFilterNavItem.key == 'Variant'">
              <df-variants :localSectionFilter="getLocalSectionData('variant')" :filterDetailData="filtersDetailData.variants" @variantsFDChange="getFilterDetailData"></df-variants>
            </div>
            <div v-if="addFilterNavItem.key == 'Duration'">
              <df-duration :localSectionFilter="getLocalSectionData('duration')" :filterDetailData="filtersDetailData.duration" @durationFDChange="getFilterDetailData"></df-duration>
            </div>
            <div v-if="addFilterNavItem.key == 'Touch Points'">
              <df-touch-points :filterDetailData="filtersDetailData.touchPoint" :localSectionFilter="getLocalSectionData('touch_points')" @touchPointFDChange="getFilterDetailData"></df-touch-points>
            </div>
            <div v-if="addFilterNavItem.key == 'Activity'">
              <df-acitvity :localSectionFilter="getLocalSectionData('activity')" :filterDetailData="filtersDetailData.activity" @activityFDChange="getFilterDetailData"></df-acitvity>
            </div>
            <div v-if="addFilterNavItem.key == 'Activity Connection'">
              <df-acitvity-connection :filterDetailData="filtersDetailData.activityConnection" :localSectionFilter="getLocalSectionData('activity_connection')" @activityFDChange="getFilterDetailData"></df-acitvity-connection>
            </div>
            <div v-if="addFilterNavItem.key == 'Attribute'">
              <df-attribute :localSectionFilter="getLocalSectionData('attribute')"></df-attribute>
            </div>
          </div>
        </div>
      </div>
    </div>
    <df-navigate-bar :applyFilter="true" :filterData="addFilterData" :localCurrentFilter="localCurrentFilter"></df-navigate-bar>
  </div>
</template>
<script src="./dynamic-filter-add-filter.js"></script>
<style src="./dynamic-filter-add-filter.scss" lang="scss"></style>
