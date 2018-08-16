<template>
    <div class="attribute">
        <attr-bar 
            :localSectionFilter="localSectionFilter" 
            :attrLists="attrLists" 
            v-on:countActive="noActiveList = !$event" 
            v-on:searching="onSearching" 
            v-on:selectedAttr="onSelectedAttr" 
            v-on:updateActiveAttr="onUpdateActiveAttr" 
            v-on:updateEmptyAttr="onUpdateEmptyAttr">
        </attr-bar>
        <div class="attr-content" :style="attrContentStyle">
            <div v-if="noActiveList" class="attr-information">
                <p class="icon"><i class="icon-filter"></i></p>
                <p class="title">字段过滤</p>
                <div class="information" v-if="attrLists.length > 0">
                    <p>在这个页面，您可以配置一组字段过滤条件取过滤。</p>
                    <p>一共有 {{ attrLists.length }} 种字段 {{ attrLists | attrTransform }}</p>
                </div>
                <div v-else class="information">
                    <p>错误！获取字段数据失败。</p>
                    <p>请联系管理员。</p>
                    <p>谢谢！</p>
                </div>
            </div>
            <attr-panel v-else :attrData="filteredSelectedAttr"></attr-panel>
        </div>
    </div>
</template>
<script src="./attribute.js"></script>
<style src="./attribute.scss" lang="scss" scoped></style>