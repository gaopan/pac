<template>
	<leap-dropupdown :originContainer="saveAsOrigin" dropType="up" v-on:closeDropupdown="closeSaveAs">
		<div class="custom-dropup-saveas">
          <div class="input-container">
            <span>{{'Save as' | internationalize}}:</span>
            <input type="text" class="form-control" placeholder="Filter Name" v-model="saveAsData.name"/>
            <p class="error-filter-message"v-show="!EnableFilterButton">{{errorMessage}}</p>
          </div>
          <div class="cta-container clearfix">
            <div class="cta-item pull-left" :class="{'fav-active': saveAsData.fav, 'disable-icon': !EnableFilterButton}" @click="EnableFilterButton && saveAsFavourite()" :disabled="!EnableFilterButton">
              <i class="icon-star-o" v-show="!saveAsData.fav"></i>
              <i class="icon-star" v-show="saveAsData.fav"></i>
            </div>
            <div class="cta-item pull-left">
              <span :class="{'disable-icon': !EnableFilterButton}">{{'Set as favourite filter' | internationalize}}</span>
            </div>
            <div class="cta-item pull-right">
              <button class="btn btn-primary pull-right" :class="{'disabled-button': !EnableFilterButton, 'enable-button':EnableFilterButton }" @click="EnableFilterButton && saveAs()" :disabled="!EnableFilterButton">{{'Create and Filter' | internationalize}}</button>
            </div>
          </div>
        </div>
	</leap-dropupdown>
</template>

<script src="./dynamic-filter-save-as.js"></script>
<style src="./dynamic-filter-save-as.scss" scoped></style>