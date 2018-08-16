<template>
    <div class="container-fluid analysis-container">      
            <div class="analysis">
                <tile-panel :tiles="tiles" :tile-panel-id="tilePanelId" config="{fixed: true}"></tile-panel>
            </div>
            <!-- <div  class="edit-personal-view" v-if = "personalizedEdited" v-show = "bEditing">
                <dashboard-setup @close="closeDashboardSetup"></dashboard-setup>
            </div> -->
    </div>
</template>
<script src="./analysis.js"></script>

<style src="./analysis.scss" lang="scss"></style>

