<template>
    <div class="row attribute-bar">
        <div class="col-md-auto col-sm-auto attr-title">
            <span>{{'Attribute' | internationalize}}</span>
        </div>
        <div class="col-md-9 col-sm-6 attr-list-container">
            <div class="list">
                <div class="item-container">
                    <div class="item" v-for="attr in activeAttrList" :class="{'active': checkCurrentAttr(attr) }" v-if="activeAttrList.length > 0">
                        <span @click="setAsActive(attr, true)">{{ attr.fieldLabel }}</span>
                        <i class="icon-trash-o" @click="checkCurrentAttr(attr) && addToPassiveAttrList(attr)"></i>
                    </div>
                </div>
                <div class="add-item-container" :class="{'overflow': listOverflow }" ref="addItemToggle">
                    <div class="add-item" @click="toggleDropdown()" v-if="passiveAttrList.length > 0">
                        <i class="icon-plus"></i>
                        <span>{{'Add Filter' | internationalize}}</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-3 col-sm-5 attr-search" v-if="currentSelectedTab.name && currentSelectedTab.showSearch">
            <leap-search
                :width="'98%'"
                :searchTitle="currentSelectedTab.searchPlaceholder"
                v-on:searchText="fnSearch">
            </leap-search>
        </div>
        <div class="custom-dropdown-menu" v-if="showAttrMenu" :style="menuStyle">
            <ul>
                <li v-for="attr in passiveAttrList" @click="addToActiveAttrList(attr, true)">{{ attr.fieldLabel }}</li>
            </ul>
        </div>
    </div>
</template>
<script src="./attribute-bar.js"></script>
<style src="./attribute-bar.scss" lang="scss" scoped></style>