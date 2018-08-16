<template>
    <div class="container-fluid analysis-dashboard-container">
        <div class="dashboard-container">
            <!-- <div class="header">
                <p class="title">Analysis Dashboard</p>
            </div> -->
            <div class="dashboard-header" v-show = "!bHideView">
                <p class="dashboard-view-title" v-show = "viewStatus=='PROCESS'">{{'System Analysis Dashboard'|internationalize}}</p>
                <p class="dashboard-view-title" v-show = "viewStatus=='USER'">{{'Personalized Analysis Dashboard'|internationalize}}</p>
                <!-- <div class="dashboard-view-toggle" v-if="showConfigButton"> -->
                <div class="dashboard-view-toggle" v-if="showConfigButton">
                    <div class="dashboard-view-toggle">
                        
                        <span>
                            <button 
                                :class="{
                                'button-normal':viewStatus=='USER'&&bEnableSystemButton,
                                'button-active':viewStatus=='PROCESS'&&bEnableSystemButton,
                                'btn btn-primary disabled':!bEnableSystemButton}" 
                                @click = 'toggleView("System")'
                            >
                                {{'System View'|internationalize}}
                            </button>
                            
                            <span v-if = "bUserLevelConfig">
                                <button 
                                    :class="{'button-normal':viewStatus=='PROCESS','button-active':viewStatus=='USER',}" 
                                    @click = 'toggleView("Personalized")'
                                >
                                    {{'Personalized View'|internationalize}}
                                </button>
                                <i class="icon-pencil" 
                                    :class = "{'icon-pencil-able':viewStatus=='USER','icon-pencil-disable':viewStatus=='PROCESS'}" 
                                    @click="openDashboardSetup"
                                ></i>
                            </span>

                            <button 
                                class="btn btn-secondary" 
                                @click = 'openDashboardSetup' 
                                v-else-if = "!bUserLevelConfig"
                            >
                                {{'Create Personalized View'|internationalize}}
                            </button>
                        </span>                    
                    </div>
                </div>
            </div>
            
            <div class="tile-panel-area">
                <tile-panel :tile-panel-id="tilePanelId" :tiles="dashboardTiles" config="{fixed: true}"></tile-panel>
            </div>

            <div  class="edit-personal-view" v-if = "bEditing">
                <div>
                    <dashboard-setup @close="closeDashboardSetup" :overall="analysisOverviewData" :params="setupParams" :type="2" :dataReactor="dataReactorForSetup"></dashboard-setup>
                </div>
            </div>
        </div>
    </div>
</template>

<script src="./analysis-dashboard.js"></script>
<style src="./analysis-dashboard.css"></style>
<style src="../../../dashboard-setup/template/value-comparison/value-comparison.css"></style>
<style src="../../../dashboard-setup/template/aggregation/aggregation.scss" lang="scss"></style>
<style src="../../../dashboard-setup/template/case-distribution-trend/case-distribution-trend.scss" lang="scss"></style>
<style src="../../../dashboard-setup/template/case-value-ranking/case-value-ranking.css"></style>