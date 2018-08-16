<template>
  <div class="activity">
    <h3>活动</h3>
    <p class="activity-search">
      <input type="text" v-model="activitySearchText" @keyup="clickSearchActivity" placeholder="Search Activity" />
      <span class="icon" @click="clickSearchActivity"><i class="icon-search"></i></span>
    </p>
    <div class="act-content">
      <div class="act-chart-container">
        <div class="act-box-wrapper">
          <div id="act-bar-chart"></div>
        </div>
        <div class="edit-filter-mode-container" v-if="showEditFilterMode" @click="closeEditFilterMode">
        </div>
        <div class="edit-filter-mode-wrapper" v-if="showEditFilterMode">
          <div class="edit-filter-mode-header">
            <span>编辑过滤方法</span>
            <i class="icon-close pull-right" style="cursor: pointer;" @click="closeEditFilterMode"></i>
          </div>
          <div class="edit-filter-mode-details">
            <div>
              <table>
                <tbody>
                  <tr>
                    <td class="contentTitle">活动</td>
                    <td class="contentTitle">:</td>
                    <td>
                      <div class="contentText">{{editFilterData.activity}}</div>
                    </td>
                  </tr>
                  <tr>
                    <td class="contentTitle">频率</td>
                    <td class="contentTitle">:</td>
                    <td class="contentText">{{editFilterData.frequency}}</td>
                  </tr>
                  <tr>
                    <td class="contentTitle">相对频率</td>
                    <td class="contentTitle">:</td>
                    <td class="contentText">{{editFilterData.relativeFrequency}}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <span class="edit-filter-mode-title">过滤方法</span>
            <div :class="{'efm-excluded-text':!editFilterData.filteringMode.excluded,'efm-clicked-excluded-text':editFilterData.filteringMode.excluded}" @click="clickEditFilterModeExcluded(editFilterData.index)"><div style="padding: 2px 15px;">排除</div></div>
            <div :class="{'efm-included-text':!editFilterData.filteringMode.included,'efm-clicked-included-text':editFilterData.filteringMode.included}" @click="clickEditFilterModeIncluded(editFilterData.index)"><div style="padding: 2px 15px;">包含</div></div>
          </div>
        </div>
      </div>
      <div class="act-table-container" @click="closeEditFilterMode">
        <table class="activity-table">
          <thead class="activity-thead">
            <tr>
              <th style="width:20%">
                <div class="activity-thead-text">
                  <div class="activity-thead-checkbox" @click="clickActivityTheadCheckbox">
                    <i class="icon-check checkbox-icon" v-show="checkAllBox"></i>
                  </div>活动
                </div>
                <div class="activity-table-sort">
                  <i :class="{'icon-sort':sortTableStatus.activity==0,'icon-sort-up':sortTableStatus.activity==1,'icon-sort-down':sortTableStatus.activity==-1}" @click="clickSortTable('activity')"></i>
                </div>
              </th>
              <th style="width:7%">
                <span>|</span>
                <div class="activity-thead-text-mid">
                  频率
                </div>
                <div class="activity-table-sort">
                  <i :class="{'icon-sort':sortTableStatus.frequency==0,'icon-sort-up':sortTableStatus.frequency==1,'icon-sort-down':sortTableStatus.frequency==-1}" @click="clickSortNum('frequency')"></i>
                </div>
              </th>
              <th style="width:11%">
                <span>|</span>
                <div class="activity-thead-text-mid">
                  相对频率
                </div>
                <div class="activity-table-sort">
                  <i :class="{'icon-sort':sortTableStatus.relativeFrequency==0,'icon-sort-up':sortTableStatus.relativeFrequency==1,'icon-sort-down':sortTableStatus.relativeFrequency==-1}" @click="clickSortNum('relativeFrequency')"></i>
                </div>
              </th>
              <th style="width:10%">
                <span>|</span>
                <div class="activity-thead-text-mid">
                  持续时间中值{{sortTableStatus.medianDuration}}
                </div>
                <div class="activity-table-sort">
                  <i :class="{'icon-sort':sortTableStatus.origMedianDuration==0,'icon-sort-up':sortTableStatus.origMedianDuration==1,'icon-sort-down':sortTableStatus.origMedianDuration==-1}" @click="clickSortTable('origMedianDuration')"></i>
                </div>
              </th>
              <th style="width:10%">
                <span>|</span>
                <div class="activity-thead-text-mid">
                  持续时间平均值
                </div>
                <div class="activity-table-sort">
                  <i :class="{'icon-sort':sortTableStatus.origAverageDuration==0,'icon-sort-up':sortTableStatus.origAverageDuration==1,'icon-sort-down':sortTableStatus.origAverageDuration==-1}" @click="clickSortTable('origAverageDuration')"></i>
                </div>
              </th>
              <th style="width:11%">
                <span>|</span>
                <div class="activity-thead-text-mid">
                  最小持续时间
                </div>
                <div class="activity-table-sort">
                  <i :class="{'icon-sort':sortTableStatus.origMinimumDuration==0,'icon-sort-up':sortTableStatus.origMinimumDuration==1,'icon-sort-down':sortTableStatus.origMinimumDuration==-1}" @click="clickSortTable('origMinimumDuration')"></i>
                </div>
              </th>
              <th style="width:11%">
                <span>|</span>
                <div class="activity-thead-text-mid">
                    最大持续时间
                </div>
                <div class="activity-table-sort">
                  <i :class="{'icon-sort':sortTableStatus.origMaximumDuration==0,'icon-sort-up':sortTableStatus.origMaximumDuration==1,'icon-sort-down':sortTableStatus.origMaximumDuration==-1}" @click="clickSortTable('origMaximumDuration')"></i>
                </div>
              </th>
              <th style="width:18%"><span>|</span>
                <div class="activity-thead-text filter-mode">过滤方法
                  <div class="filter-mode-button" @mouseenter="showFilterModeInfo=true" @mouseleave="showFilterModeInfo=false"><i class="icon-question-circle"></i>
                    <div class="hover-infomation-arrow" v-show="showFilterModeInfo"></div>
                    <div class="hover-infomation" v-show="showFilterModeInfo">
                      <div class="hover-infomation-text">
                        <div class="included-text">
                          <div class="title">包含</div>
                          <div class="text">保留包含了选择的活动的实例</div>
                        </div>
                        <div class="excluded-text">
                          <div class="title">排除</div>
                          <div class="text">保留排除包含了选择的活动的实例</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="activity-tbody">
            <tr v-for="(tableData,index) in activityTableData" :class="{'activity-tr-checked':tableData.checked}">
              <th style="width:20%">
                <div class="activity-th-container">
                  <div :class="{'activity-tbody-checkbox':!tableData.checked,'activity-tbody-checkbox-checked':tableData.checked}" @click="checkThisBox(tableData.index,index)">
                    <i class="icon-check checkbox-icon" v-show="tableData.checked"></i>
                  </div>
                  <div class="activity-text-container">
                    <p class="activity-text">{{tableData.activity}}</p>
                  </div>
                </div>
              </th>
              <th style="width:7%">
                <div class="activity-tbody-text">{{tableData.frequency}}</div>
              </th>
              <th style="width:11%">
                <div class="activity-tbody-text">{{tableData.relativeFrequency}}%</div>
              </th>
              <th style="width:10%">
                <div class="activity-tbody-text">{{tableData.medianDuration}}</div>
              </th>
              <th style="width:10%">
                <div class="activity-tbody-text">{{tableData.averageDuration}}</div>
              </th>
              <th style="width:11%">
                <div class="activity-tbody-text">{{tableData.minimumDuration}}</div>
              </th>
              <th style="width:11%">
                <div class="activity-tbody-text">{{tableData.maximumDuration}}</div>
              </th>
              <th style="width:18%; padding-left: 6px;">
                <div :class="{includedText:!tableData.filteringMode.included,clickedIncludedText:tableData.filteringMode.included}" @click="checkIncluded(tableData.index,index)">
                  <div style="padding: 1px 20px;">包含</div>
                </div>
                <div :class="{excludedText:!tableData.filteringMode.excluded,clickedExcludedText:tableData.filteringMode.excluded}" @click="checkExcluded(tableData.index,index)">
                  <div style="padding: 1px 20px;">排除</div>
                </div>
              </th>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- <Paginator></Paginator> -->
    </div>
  </div>
</template>
<script src="./activity.js"></script>
<style src="./activity.css"></style>
