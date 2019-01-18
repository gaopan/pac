<template>
  <div class="dashboard-m" v-if="companies">
    <div class="dashboard-m-header">
      <div class="container">
        <div class="row">
          <div class="col-xs-12">
            <leap-select :isSearch="true" :options="companySelectOptions" :initSelectedValue="currentComp.id" v-on:onSelectedValues="switchCompany"></leap-select>
          </div>
        </div>
      </div>
    </div>
    <div class="dashboard-m-content">
      <div class="container-fluid">
        <div class="row">
          <div class="col-xs-12">
            <div class="m-reports">
              <div class="dashboard-m-title">月度报表</div>
              <div class="container-fluid">
                <div class="row">
                  <div class="col-xs-12 col-md-4 col-lg-2" v-for="m in curReportModules">
                    <div class="m-report" @click="toViewReport(m)">
                      <div class="report-name">{{m.moduleName | moduleName}}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="container-fluid">
        <div class="row">
          <div class="col-xs-12">
            <div class="m-projects">
              <div class="dashboard-m-title">重大项目</div>
              <div class="container-fluid">
                <div class="row">
                  <div class="col-xs-12 col-md-4 col-lg-2" v-for="p in currentComp.projects">
                    <div class="m-project">
                      <div class="project-name">{{p.name}}</div>
                      <div class="project-desc"><span>{{p.shortDesc}}</span> . . .</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script src="./main.js"></script>
<style src="./main.scss" lang="scss" scoped></style>
