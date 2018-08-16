<template>
    <div class="attribute-panel" ref="attributePanel">
        <div v-if="currentType != 'date'">
            <div class="chart-container" :style="style.chart">
                <attribute-chart :attr-data="attrData" :config="style.chart"></attribute-chart>
            </div>
            <div class="table-container" :style="style.table">
                <attribute-table :attr-data="attrData" :config="style.table"></attribute-table>
            </div>
        </div>
        <div v-else class="date-container">
            <attribute-date v-if="attrData.value.length > 1" :attr-data="attrData"></attribute-date>
            <div v-else class="empty-data">{{'No data to display' | internationalize}}</div>
        </div>
    </div>
</template>
<script src="./attribute-panel.js"></script>
<style src="./attribute-panel.scss" lang="scss" scoped></style>