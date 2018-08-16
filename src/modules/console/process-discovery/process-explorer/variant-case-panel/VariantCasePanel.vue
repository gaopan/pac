<template>
  <div class="variant-case" id="variant-case-container">
    <div class="wrapper">
      <div class="exit" @click="closePanel"><i class="icon-x"></i></div>
      <!-- case-detail-part -->
      <div class="case-details" :class="{'case-details-70':showVariantPanel&&showCasePanel,'case-details-85':(!showVariantPanel&&showCasePanel)||(showVariantPanel&&!showCasePanel)}">
        <div class="button-area" v-if="showVariantPanel||showCasePanel">
          <div class="title" v-if="showTableChartPanel">{{caseItem_CaseId_Duration}}</div>
        </div>
        <div class="case-detail-table-area" v-if="showTableChartPanel" :class="{'button-area-70':showVariantPanel&&showCasePanel,'button-area-85':(!showVariantPanel&&showCasePanel)||(showVariantPanel&&!showCasePanel)}">
          <case-panel-chart :caseChartData="caseTableChartData" :dailyActivities='dailyActivities'></case-panel-chart>
          <case-panel-table :caseTableData='caseTableChartData'></case-panel-table>
        </div>
      </div>
      <!-- case-list-part -->
      <div class="case-panel" v-if="showCasePanel">
        <!-- sort-case-list -->
        <div class="case-item-sort sort-switch">
          <span title="Sort Cases By" class="sort-switch-label">排序实例</span>
          <leap-select :initSelectedValue="sortCase.currentMode" :options="sortCase.option" v-on:onSelectedValues="sortCaseList">
          </leap-select>
        </div>
        <!-- search-case-list -->
        <div class="search-case">
          <input type="text" placeholder="搜索实例" @keyup.enter="searchItem(searchCaseIpt,'case')" v-model="searchCaseIpt"></input>
          <i class="icon-search" @click="searchItem(searchCaseIpt,'case')"></i>
        </div>
        <!-- case-list -->
        <div class="caseList">
          <ul class="case-list-ul">
            <li v-for="(variantCase,index) in caseList" @click="caseItemClicked(index)">
              <div class="case-info-wrapper">
                <i class="icon-chevron-left" :class="{'current-case-item':variantCase.show}"></i>
                <div>
                  <p class="case-info-caseId" :class="{'current-case-item':variantCase.show}">{{variantCase.caseIdDisplayed}}</p>
                  <p class="case-info-duration" :class="{'current-case-item':variantCase.show}">
                    <span v-show="filterFunc.caseOrderKey=='caseDuration'||filterFunc.caseOrderKey=='caseId'">{{variantCase.durationDisplay}}</span>
                    <span v-show="filterFunc.caseOrderKey=='caseStart'">{{variantCase.startTime}}</span>
                    <span v-show="filterFunc.caseOrderKey=='caseEnd'">{{variantCase.endTime}}</span>
                  </p>
                </div>
              </div>
            </li>
            <li class="case-variant-no-data" v-if="caseList.length===0">没有数据显示。</li>
          </ul>
        </div>
        <!-- paginator-case-list -->
        <div class="case-paging">
          <Pagging :page-size="casePageSize" :total="caseTotal" :currentPage="casePageIndex" v-on:pagehandler="casePageHandler"></Pagging>
        </div>
      </div>
      <!-- variant-list-part -->
      <div class="variant-panel" v-if="showVariantPanel">
        <!-- sort-variant-list -->
        <div class="sort-switch">
          <span class="sort-switch-label" title="Sort Variants By">排序分支路径</span>
          <leap-select :initSelectedValue="sortVariant.currentMode" :options="sortVariant.option" v-on:onSelectedValues="sortVariantList">
          </leap-select>
        </div>
        <!-- search-case-list -->
        <div class="search-variant">
          <input type="text" placeholder="搜索分支路径" @keyup.enter="searchItem(searchVariantIpt,'variant')" v-model="searchVariantIpt"></input>
          <i class="icon-search" @click="searchItem(searchVariantIpt,'variant')"></i>
        </div>
        <!-- variant-list -->
        <div class="variant-list">
          <ul class="variant-list-ul">
            <li v-if="variantPageIndex == 1" @click="allVariantsItemClicked()">
              <div class="variant-info-wrapper">
                <i class="icon-info" :class="{'current-case-item':isAllVariantsClicked}"></i>
                <div>
                  <p class="variant-info-caseId" :class="{'current-case-item':isAllVariantsClicked}">所有分支路径</p>
                  <p class="variant-info-duration" :class="{'current-case-item':isAllVariantsClicked}">
                    <span v-show="filterFunc.variantOrderKey=='caseCount'">{{overallTotalCaseCount}} 实例 (100 %)</span>
                  </p>
                </div>
              </div>
            </li>
            <li v-for="(variant,index) in variantList" @click="variantItemClicked(index)">
              <div class="variant-info-wrapper">
                <i class="icon-info" :class="{'current-case-item':variant.show}"></i>
                <div>
                  <p class="variant-info-caseId" :class="{'current-case-item':variant.show}">
                    {{variant.variantDisplay}}
                  </p>
                  <p class="variant-info-duration" :class="{'current-case-item':variant.show}">
                    <span v-show="filterFunc.variantOrderKey=='caseCount'"> {{variant.count}} 实例 ({{variant.casePercentage}} %)</span>
                    <span v-show="filterFunc.variantOrderKey=='activityCount'">
                      <span v-if="variant.count>1">
                        {{variant.activityCount}} ({{variant.count}} 实例 , {{variant.casePercentage}} %)
                      </span>
                    <span v-if="variant.count===1">
                        {{variant.activityCount}} ({{variant.count}} 实例 , {{variant.casePercentage}} %)
                      </span>
                    </span>
                  </p>
                </div>
              </div>
            </li>
            <li class="case-variant-no-data" v-if="variantList.length===0">没有数据显示。</li>
            <!--  <li class="case-variant-no-data">{{PromptInformation}}</li>
           <li class="case-variant-no-data" v-if="variantList.length===0">没有数据显示。</li> -->
          </ul>
        </div>
        <!-- paginator-variant-list -->
        <div class="variant-paging">
          <Pagging :page-size="variantPageSize" :total="variantTotal" :currentPage="variantPageIndex" v-on:pagehandler="variantPageHandler"></Pagging>
        </div>
      </div>
    </div>
  </div>
</template>
<script src="./variant-case-panel.js"></script>
<style src="./variant-case-panel.scss" lang="scss"></style>
