<template>
  <div class="company-container">
    <div class="container">
      <div class="row">
        <div class="col-xs-12 col-md-4 col-lg-3" v-for="company in companies">
          <div class="company">
            <div class="company-name">{{company.name}}</div>
            <div class="company-caption">
              <button type="button" class="btn btn-primary" @click="toDashboard(company)">月度报表</button>
              <button type="button" class="btn btn-primary" @click="toViewPastRemindAndSupport(company)">查看往月领导关注、支持记录</button>
              <button type="button" class="btn btn-primary" @click="toEditSupport(company)">处理待领导关注、支持事项</button>
            </div>
            <div class="company-panel" v-show="company.isViewPastRS">
              <h4>{{company.name}}</h4>
              <p>关注、支持事项往月记录</p>
              <ul class="past-rs" v-if="company.rs.pastData && company.rs.pastData.length > 0">
                <li v-for="rs in company.rs.pastData">
                  <div>
                    <div class="remind">
                      <div>提醒：</div>
                      <div>{{rs.remind}}</div>
                    </div>
                    <div class="support" v-if="rs.support">
                      <div>决策：</div>
                      <div>{{rs.support}}</div>
                    </div>
                    <div class="support" v-else>暂时没有领导的回复</div>
                  </div>
                  <div><div>{{rs.month}}</div></div>
                </li>
              </ul>
              <div v-else>没有往月的领导关注、支持事项</div>
              <div class="company-panel-actions">
                <button type="button" class="btn btn-secondary" @click.stop="cancelViewPastRS(company)">关闭</button>
              </div>
            </div>
            <div class="company-panel" v-show="company.isEditSupport">
              <h4>{{company.name}}</h4>
              <form>
                <div class="form-static-box">
                  <div>待关注、支持事项</div>
                  <div>{{company.rs.curMonthData.remind}}</div>
                </div>
                <div>
                  <textarea class="form-control" v-model="company.rs.curMonthData.support" :placeholder="'处理意见'"></textarea>
                </div>
                <div class="company-panel-actions">
                  <button type="button" class="btn btn-primary" @click.stop="submitSupport(company)">提交</button>
                  <button type="button" class="btn btn-secondary" @click.stop="cancelEditSupport(company)">取消</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script src="./company.js"></script>
<style src="./company.scss" lang="scss" scoped></style>
