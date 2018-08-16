<template>
    <div class="container-fluid recipe-selection-container">
        <loader :is-loading="isLoading" :styles-conf="stylesLoader" :show-text="true"></loader>
        <div v-if="!isLoading && !data" style="padding: 20px;">
            <span>No recipe exist. Please upload/add new recipe.</span>
        </div>
        <div v-if="!showComparison && !isLoading && data" class="row recipe-selection">
            <div class="header">
                <p class="main-title">Choose a Recipe Process to Compare</p>
                <p></p>
                <!-- <p class="desc">Please select a process to compare to the current process</p> -->
            </div>
            <div class="row content-box">
                <div class="col-md-12 action-box">
                    <div class="col-md-6 search-group">
                        <leap-search
                            :searchTitle="'Recipe Name'"
                            v-on:searchText="doSearch">
                        </leap-search>
                    </div>
                    <div class="col-md-4">
                        <leap-select 
                            :initSelectedValue="selectedProcess" 
                            :options="processSelection" 
                            v-on:onSelectedValues="onChangeSelected"
                        </leap-select>
                    </div>
                    <div class="col-md-2 toggle-group">
                        <i class="pull-right" :class="{ 'icon-align-justify': viewAsCard, 'icon-th': !viewAsCard}" @click="toggleIcon()"></i>
                    </div>
                </div>
                <div class="col-md-12 view-box" :class="{ 'view-box-card': viewAsCard , 'view-box-list': !viewAsCard}">
                    <!-- view as card -->
                    <div v-if="viewAsCard" v-for="recipe in data" class="col-xs-12 col-sm-6 col-md-6 col-lg-2-4" style="padding-left:0">
                        <div class="recipe recipe-card" @click="chooseRecipe(recipe)">
                            <div class="header">
                                <div class="indicator pull-left" :style="{ color: recipe.processColor }">{{ recipe.processTypeCode }}</div>
                                <div class="detail pull-left">
                                    <span class="recipe-name" :title="recipe.name">{{ recipe.name}}</span>
                                    <span class="type-name" :title="recipe.processType"> {{ recipe.processType }}</span>
                                </div>
                            </div>
                            <div class="clearfix"></div>
                            <div class="body">
                                <p :title="recipe.description">{{ recipe.description }}</p>
                            </div>
                        </div>
                    </div>
                    <!-- view as list -->
                    <div v-if="!viewAsCard" class="col-md-12" v-for="recipe in data" style="padding: 0">
                        <div class="recipe recipe-list" @click="chooseRecipe(recipe)">
                            <div class="header pull-left">
                                <div class="indicator pull-left" :title="recipe.processType" :style="{ color: recipe.processColor }">{{ recipe.processTypeCode }}</div>
                                <div class="detail pull-left">
                                    <span class="recipe-name" :title="recipe.name">{{ recipe.name }}</span>
                                </div>
                            </div>
                            <div class="body pull-left">
                                <span :title="recipe.description">{{ recipe.description}}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="showComparison" class="row recipe-comparison">
            <div v-if="!showComparisonChart" class="col-md-12 header">
                <div class="col-md-7">
                    <p class="title" :title="selectedRecipe.name">{{ selectedRecipe.name }}</p>
                    <p class="sub-title" :title="selectedRecipe.description">{{ selectedRecipe.description }}</p>
                </div>
                <div class="col-md-4">
                    <button :disabled="conf.opts && conf.opts.disabledCompareBtn" @click="selectedProcessToCompare" class="btn btn-primary pull-right">Compare to this process</button>
                </div>
                <div class="col-md-1">
                    <a href="javascript:void(0)" @click="cancelChooseRecipe" class="close pull-right">
                        <i class="icon-close"></i>
                    </a>
                </div>
            </div>
            <div class="col-md-12 content">
                <!-- <p>Chart comparison industry will be here</p> -->
                <pn-chart :tile-id="tileId" :conf="selectedRecipeConf"></pn-chart>
            </div>
        </div>
    </div>
</template>

<script src="./recipe-selection.js"></script>
<style lang="scss" src="./recipe-selection.scss" scoped></style>