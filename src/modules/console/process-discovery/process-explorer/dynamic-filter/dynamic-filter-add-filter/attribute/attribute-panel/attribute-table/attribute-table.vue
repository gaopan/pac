<template>
    <div :style="styles" v-if="maxHeightTableBody">
        <div class="table-view">
            <table class="table">
                <thead>
                    <tr>
                        <th style="width: 3%;">
                            <div v-if="tableData.length > 0" class="attribute-control">
                                <input type="checkbox" checked="fnIsSelectAll()"></input>
                                <div class="checkBox header" @click="clickSelectAll()">
                                    <i class="icon-check" v-if="fnIsSelectAll()"></i>
                                </div>
                            </div>
                        </th>
                        <th v-for="(header, index) in tableHeader" v-if="showColumn(header.name)">
                            <div class="content-cell ">
                                <div class="col-md-1 col-sm-1 separator" v-if="index > 0"> | </div>
                                <div :class="{ 'col-md-10': index > 0 , 'col-md-11': index == 0 }" class="col-sm-8 th-label">
                                    <span :title="header.name | camelToTitleCase">
                                        {{ header.name | camelToTitleCase}}
                                    </span>
                                </div>
                                <div class="col-md-1 col-sm-3 th-icon">
                                    <i @click="sortColumn(index, header.name)" :class="fnGetIconClass(header.iconArrow)"></i>
                                </div>
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody v-if="tableData.length > 0" :style="{ maxHeight: maxHeightTableBody }">
                    <tr v-for="(object, index) in displayTableData" :class="{ 'selected': object.selected }" @click="clickSingleItem($event, index, object.selected)">
                        <td style="width: 2%;">
                            <div class="attribute-control">
                                <input type="checkbox" checked="object.selected"></input>
                                <div class="checkBox content" :class="{ 'selected': object.selected }">
                                    <i class="icon-check" v-if="object.selected"></i>
                                </div>
                            </div>
                        </td>
                        <td v-for="(obj, key, index) in object" v-if="showColumn(key)" style="width: 10%;" class="content-cell">
                            <div v-if="index > 0" class="col-md-1 col-sm-1"></div>
                            <div :class="{ 'col-md-11': index > 0 , 'col-md-12': index == 0 }">
                                <span v-if="key == 'relativeFrequency'">{{ obj | twoDecimalPoints }} </span>
                                <span v-else-if="key == 'medianDuration' || key == 'averageDuration' || key == 'minimumDuration' || key == 'maximumDuration'">
									{{ obj | convertDuration }} 
								</span>
                                <span v-else>{{ obj }}</span>
                            </div>
                        </td>
                    </tr>
                </tbody>
                <tbody v-else>
                    <tr>
                        <td style="text-align: center">No data to display</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div v-show="showPagination">
            <!-- <Pagging :page-size="totalItemPerPage" :total="totalSizeOfTableData" v-on:pagehandler="onChangePageHandler" :isResetCurrentPage="isResetCurrentPage" :currentPage="currentPage" :nextPageCount="3"></Pagging> -->
            <Pagging :page-size="totalItemPerPage" :total="totalSizeOfTableData" v-on:pagehandler="onChangePageHandler" :currentPage="currentPage" :nextPageCount="3"></Pagging>            
        </div>
    </div>
</template>
<script src="./attribute-table.js"></script>
<style src="./attribute-table.scss" lang="scss" scoped></style>