<template>
    <div class="dropdown-group dropdown" :class="{ 'no-allowed': isOptionsNull }">
        <div v-if="!isFilterTable" class="dropdown-toggle process-label" data-toggle="dropdown" role="button" :style="styles.processLabel || {}" @click="onClickProcessLabel" :class="{ 'disabled-dropdown': isOptionsNull, 'has-error': hasError }">
            <span class="pull-left label-text" :style="styles.processLabel_span || {}" :title="isMultiSelect ? multiSelectLabel : label">
                {{ isMultiSelect ? multiSelectLabel : label }}
            </span>
            <i v-if="!isOptionsNull" class="pull-right label-icon" :class="{ 'icon-arrow-up': isArrowUp, 'icon-arrow-down': !isArrowUp}" :style="styles.processLabel_i || {}"></i>
        </div>
        <div v-if="isFilterTable" data-toggle="dropdown" class="dropdown-toggle">
             <i class="icon-filter" :style="styles.iconFilter"></i>
        </div>
        <div class="dropdown-menu" :style="styles.dropdownMenu || {}" :class="{'up' : isArrowUp, 'down' : !isArrowUp}">
            <div class="dropdown-menu-wrapper" :class="{'have-search': isSearch}">
                <div class="wrapper-search-li" v-show="isSearch">
                    <li>
                        <input type="text" v-model="searchKey" :placeholder="'Search' | internationalize"></input>
                    </li>
                </div>
                <div v-if="!isMultiSelect" class="wrapper-li">
                    <li class="list" v-for="process in options" :class="{'selected': (label == process.name)}" @click="onChangeSingleSelect(process)" :style="styles.dropdownMenu_list || {}"  v-show="(process.name && process.name.toLowerCase().indexOf(searchKey.toLowerCase())!==-1) || searchKey=='' "  :title="process.name">
                        {{ process.name }}
                    </li>
                </div>
                <div v-if="isMultiSelect" class="control-group">
                    <label class="list control control--checkbox" 
                        v-for="option in multiSelectOptions" 
                        @click="onClickMultiSelect" 
                        :class="{ 'selected': (option.isSelected && option.isHightlighted) }" 
                        :style="styles.dropdownMenu_list || {}" v-show="(option.name.toLowerCase().indexOf(searchKey.toLowerCase()))!==(-1) || searchKey=='' " >
                            <span :title="option.name">{{ option.name }}</span>
                            <input name="multi-select" type="checkbox" :id="option.id" :value="option.name" :checked="option.isSelected" @change="onChangeMultiSelect" :disabled="option.isDisableClick"/>
                            <div class="control__indicator"></div>
                    </label>
                </div>
            </div>
        </div>
    </div>
</template>
<script src="./leap-select.js"></script>
<style lang="scss" src="./leap-select.scss" scoped></style>