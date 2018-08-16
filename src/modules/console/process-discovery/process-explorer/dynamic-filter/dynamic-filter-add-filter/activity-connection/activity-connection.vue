<template>
	<div class="activity-connection">
		<h3>活动连接</h3>
		<div class="activity-connection-mid">
			<div class="container-fluid">
				<div class="col-md-12 col-xs-12 activity-connection-mid-bt"> 请选择一个活动序列添加到下面的表格中</div>
				<div class="row col-md-12 activity-connection-mid-bt">
					<div class="col-md-4 col-xs-4">
						<div>前置事件</div>
						<div>
							<leap-select 
								:isSearch="true" 
								:stylesConf="stylesLeapSelect" 
								:options="sourceValues" 
								v-on:onSelectedValues="fnSelectedSource">
							</leap-select>	
							<span class="directlyFollowed">紧随</span>
						</div>
					</div>
					<div class="col-md-4 col-xs-4">
						<div>后置事件</div>
						<div>
							<leap-select 
								:isSearch="true" 
								:options="followerValus" 
								v-on:onSelectedValues="fnSelectedFollower">
							</leap-select>	
						</div>
					</div>
					<div class="col-md-3 col-xs-3 topfiltermode">
						<div>过滤方法</div>
						<div class="activity-connection-filterMode">
							<div :class="[ifIncluded?'clickedIncludedText':'includedText','ifcursor']" @click='changeInclude()'>包含</div>
							<div :class="[ifExcluded?'clickedExcludedText':'excludedText','ifcursor']" @click='changeExclude()'>排除</div>
						</div>
					</div>
					<div class="col-md-1 col-xs-1 addSequence">
						<div class='addActivitySequence'>添加活动序列</div>
						<div> 
							<button type="button" class="btn btn-primary" @click='submit()' :disabled='isDisable'>
								<span>添加</span>
							</button>
						</div>
					</div>
				</div>
				</div>
			</div>
	
		<div class="activity-connection-table-con">
			<table class="activity-connection-table">
				<thead class="activity-connection-thead">
					<tr>
						<th style="width:30%">
							<div class="activity-connection-thead-text">前置事件
							 <!-- <div class="activity-connection-sort-icon"> -->
							 <div class="sort-icons">
                   <i class="icon-sort" @click="clickSort1(sourceV)" v-show="sortIndex==0"></i>
                   <i class="icon-sort-up" @click="clickSort2(sourceV)" v-show="sortIndex==1"></i>
                   <i class="icon-sort-down" @click="clickSort1(sourceV)" v-show="sortIndex==-1"></i>
                    
							</div>
							</div>
						</th>
						<th style="width:30%">
						<!-- <span>|</span> -->
						<div class="activity-connection-thead-text">后置事件
							 <!-- <div class="activity-connection-sort-icon"> -->
							 <div class="sort-icons">
                   <i class="icon-sort" @click="clickSort1(followerV)" v-show="sortIndexF==0"></i>
                   <i class="icon-sort-up" @click="clickSort2(followerV)" v-show="sortIndexF==1"></i>
                   <i class="icon-sort-down" @click="clickSort1(followerV)" v-show="sortIndexF==-1"></i>
                    
							</div>
							</div>
						</th>
						<th  style="width:30%">
							<!-- <span>|</span> -->
							<div class="activity-connection-thead-text">
								 <div class="activity-thead-text">过滤方法
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
               
							</div>
						</th>
						<th  style="width:10%">
							<!-- <span>|</span> -->
							<div class="activity-connection-thead-text">操作</div>
						</th>
					</tr>
				</thead>
				<tbody class="activity-connection-tbody">
						<tr v-for='(data,index) in tableData'>
						<th style="width:30%" :title="data.sourceEventValues">
							{{data.sourceEventValues}}
						</th>
						<th style="width:30%" :title="data.followerEventValues">
							{{data.followerEventValues}}
						</th>
						<th style="width:30%">
							 <div :class="{includedText:!data.filteringMode.included,clickedIncludedText:data.filteringMode.included}" style="cursor:pointer" @click='changeIncludeMode(index)'>包含</div>
               <div :class="{excludedText:!data.filteringMode.excluded,clickedExcludedText:data.filteringMode.excluded}" style="cursor:pointer" @click='changeExcludeMode(index)'>排除</div>
						</th>
						<th style="width:10%">
							<i class="icon-trash-o iconTrash" @click="removeTr(index)" style="cursor:pointer"></i>
						</th>
					</tr>
					<tr v-if='tableData.length == 0'  >
					<div class="no-data">
						抱歉，暂时没有添加的数据。请按照前置后置的顺序添加活动序列。
					</div>
				  </tr>
				</tbody>
			</table>
		</div>	
		
	</div>
	
</template>
<script src="./activity-connection.js"></script>
<style src="./activity-connection.css"></style>