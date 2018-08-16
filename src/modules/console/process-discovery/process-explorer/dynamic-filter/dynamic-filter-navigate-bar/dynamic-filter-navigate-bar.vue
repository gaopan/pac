<template>
  <div class="dynamic-filter-navigate-bar">
    <div class="confirmPanel" v-if="showComfirmPanel">
      <div class="confirmPanelContainer">
        <div class="confirmPanelHead">
          <span>删除所有过滤条件</span>
          <span style="float: right;" @click="cancelRemoveAllFilter"><i class="icon-close2"></i></span>
        </div>
        <div class="confirmPanelDetails">
          <div><i class="confirmPanelIcon icon-exclamation-circle"></i></div>
          <div class="confirmPanelNotice">确定吗？</div>
          <div class="confirmPanelNoticeDetails">此操作不能回退。</div>
        </div>
        <div class="confirmPanelButtons">
          <div class="confirmPanelButtonsContainer">
            <div class="yesButton" @click="confirmRemoveAllFilter"><span class="right-bar-text" style="top:5px">确定</span></div>
            <div class="cancelButton" @click="cancelRemoveAllFilter"><span class="right-bar-text" style="top:2px;left: -4px;">取消</span></div>
          </div>
        </div>
      </div>
    </div>
    <div class="hiddenPanel" v-if="showComfirmPanel"></div>
    <div class="dynamic-filter-navigate-bar-container">
      <div class="left-bar">
        <div class="left-bar-container">
          <div class="left-bar-item breadcrumb-title">
            <span>设置过滤条件</span>
          </div>
          <div class="left-bar-item breadcrumb-icon">
            <i class="icon-chevron-right"></i>
          </div>
          <div class="left-bar-item breadcrumb-selection clearfix" @click="(savedFilters.length > 0 || historyFilters.length > 0) && savedFilterToggle()" 
              :class="{ 'disabled-selection': isSavedFilterEmpty && !isHaveFilterValue && savedFilters.length == 0 && historyFilters.length === 0, 'active': showSavedFilter }" ref="savedFilterToggle">
            <span class="pull-left" v-if="isHaveFilterValue">{{ localCurrentFilter.name }}</span>
            <span class="pull-left" v-if="!isHaveFilterValue">{{ currentAppliedFilter }}</span>
            <i class="icon-arrow-up pull-right"></i>
          </div>
        </div>
      </div>
      <div class="mid-bar">
        <div class="midBarContainer clearfix">
           <div class="icon-container pull-left" @click="isEnableSaveIcon && onClickSaveIcon()" :class="{ 'disabled-icon': !isEnableSaveIcon }">
            <div v-if="!isEnableSaveIcon && localCurrentFilter" class="pop-box">{{saveIconError}}</div>
            <i class="icon-save"></i>
          </div>
          <div class="icon-container pull-left" @click="isShowAddFilterDetails && isEnableCopyIcon && saveAsToggle()" :class="{ 'disabled-icon': !isEnableCopyIcon, 'active-icon': showSaveAs }" ref="saveAsToggle">
            <div v-if="!isEnableCopyIcon && localCurrentFilter" class="pop-box">{{copyIconError}}</div>
            <i class="icon-copy"></i>
          </div>
          <div class="icon-container pull-left" @click="isShowAddFilterDetails && removeAllFilter()" :class="{ 'disabled-icon': !isShowAddFilterDetails }">
            <i class="icon-reset"></i>
          </div>
        </div>
      </div>
      <div class="right-bar">
        <div class="right-bar-container">
          <button class="btn btn-primary disabled" v-show="!isShowAddFilterDetails" disabled>过滤</button>
          <button class="btn btn-primary" v-show="isShowAddFilterDetails" @click="clickApplyFilterNewLogic">过滤</button>
          <button class="btn btn-secondary" @click="closePanel">关闭</button>
        </div>
      </div>
      <dynamic-filter-save-as :saveAsOrigin="currentDropUpOrigin" :localCurrentFilter="localCurrentFilter" v-if="showSaveAs" v-on:saveAs="onSaveAs" v-on:closeSaveAs="onCloseSaveAs"></dynamic-filter-save-as>
      <dynamic-filter-saved-filter :saveAsOrigin="currentDropUpOrigin" :savedFilters="savedFilters" :historyFilters="sortHistoryFilters" :applyFilter="applyFilter" v-if="showSavedFilter" v-on:selectSavedFilter="onSelectSavedFilter" v-on:favouriteSavedFilter="onFavouriteSavedFilter" v-on:closeSavedFilter="onCloseSavedFilter"></dynamic-filter-saved-filter>
    </div>
     </div>
</template>
<script src="./dynamic-filter-navigate-bar.js"></script>
<style src="./dynamic-filter-navigate-bar.css" scoped></style>
