<template>
  <div class="dashboard-m" v-if="companies">
    <div class="dashboard-m-header" >
      <div class="container">
        <div class="row">
          <div class="col-xs-12">
            <leap-select v-if="currentComp" :isSearch="true" :options="companySelectOptions" :initSelectedValue="currentComp.id" v-on:onSelectedValues="switchCompany"></leap-select>
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
                  <div class="col-xs-12">
                    <div class="proj-guide">
                      <span class="green">绿灯：</span> 项目正常推进&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <span class="yellow">黄灯：</span> 项目进度推迟，但有长短期措施&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <span class="red">红灯：</span> 项目进度严重推迟，且无长短期措施
                    </div>
                  </div>
                </div>
                <div class="row" v-if="currentComp">
                  <div class="col-xs-12 col-md-4 col-lg-2" v-for="p in currentComp.projects">
                    <div class="m-project" :class="{red:p.monthlyStatus=='red',yellow:p.monthlyStatus=='yellow',green:p.monthlyStatus=='green'}" @click="toViewProject(p)">
                      <div class="project-name">{{p.name}}</div>
                      <div class="project-desc" v-if="p.description&&p.description.length>=80"><span>{{p.shortDesc}}</span> . . .</div>
                      <div class="project-desc" v-else><span>{{p.shortDesc}}</span></div>
                      <div class="project-status">项目状态： <span>{{p.status | projectStatus}}</span></div>
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
