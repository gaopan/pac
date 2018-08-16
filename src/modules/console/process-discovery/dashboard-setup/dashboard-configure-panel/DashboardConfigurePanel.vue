<template>
  <div class="conf-panel">
    <!-- toggle head -->
    <div class="header">
      <span class="prev" @click="prev" :class="{'disabled': !isPrevable}">
				<i class="icon-chevron-left pull-left"></i>
			</span>
      <span class="title">{{currentTemplate.title}}</span>
      <span class="next" @click="next" :class="{'disabled': !isNextable}">
				<i class="icon-chevron-right pull-right"></i>
			</span>
    </div>

    <div class="body">

      <div class="actions">
        <button class="btn btn-primary" :disabled="currentTemplate.isAdding" @click = "saveTemplateGroup">Save</button>
        <button class="btn btn-secondary-alt" @click = "resetTemplateGroup">Reset</button>
      </div>

      <!--  Distribution Trend part -->      
      <div class="content" v-if="currentTemplate.order == 1">
        <div class="title">{{currentTemplate.formTitle}}</div>
        <ul class="group-list" v-show="!currentTemplate.isAdding">
          <li v-for="g in currentTemplate.groups">
            <div class="conf-group-box">
              <div class="conf-group">
                <span class="conf-group-title" :title="g.name">{{g.name}}</span>
                <span class="conf-group-btn" @click="deleteTemplateGroup(g)">
									<i class="icon-trash-o"></i>
								</span>
              </div>
            </div>
          </li>
        </ul>
        <leap-select 
          v-if="currentTemplate.isAdding" 
          :options="currentTemplate.config.availableFields" 
          v-on:onSelectedValues="selectTemplateItem">
        </leap-select>
        <button class="btn btn-secondary-alt" @click="cancelAddTemplateGroup()" v-show="currentTemplate.isAdding">Cancel</button>
        <button class="btn btn-primary-alt" :class = "{'disabled':currentTemplate.config.availableFields.length == 0}" @click="toAddTemplateGroup()" v-show="!currentTemplate.isAdding">Add more</button>
      </div>
      
      <!-- Value Comparison part -->
      <div class="content" v-if="currentTemplate.order == 2">
        <div class="title">{{currentTemplate.formTitle}}</div>
        <ul class="group-list" v-show="!currentTemplate.isAdding">
          <li v-for="g in currentTemplate.groups">
            <div class="conf-group-box">
              <div class="conf-group">
                <span class="conf-group-title" :title="g.name">{{g.name}}</span>
                <span class="conf-group-btn" @click="deleteTemplateGroup(g)">
									<i class="icon-trash-o"></i>
								</span>
              </div>
            </div>
          </li>
        </ul>
        <leap-select 
          v-if="currentTemplate.isAdding" 
          :options="currentTemplate.config.availableFields" 
          v-on:onSelectedValues="selectTemplateItem">
        </leap-select>
        <button class="btn btn-secondary-alt" @click="cancelAddTemplateGroup()" v-show="currentTemplate.isAdding">Cancel</button>
        <button class="btn btn-primary-alt" :class = "{'disabled':currentTemplate.config.availableFields.length == 0}" @click="toAddTemplateGroup()" v-show="!currentTemplate.isAdding">Add more</button>
      </div>
      
      <!-- Value Ranking part --> 
      <div class="content" v-if="currentTemplate.order == 3">
        <div class="title">{{currentTemplate.formTitle}}</div>
        <ul class="group-list" v-show="!currentTemplate.isAdding">
          <li v-for="g in currentTemplate.groups">
            <div class="conf-group-box">
              <div class="conf-group">
                <span class="conf-group-title" :title="g.name">{{g.name}}</span>
                <span class="conf-group-btn" @click="deleteTemplateGroup(g)">
									<i class="icon-trash-o"></i>
								</span>
              </div>
            </div>
          </li>
        </ul>
        <leap-select 
          v-if="currentTemplate.isAdding" 
          :options="currentTemplate.config.availableFields" 
          v-on:onSelectedValues="selectTemplateItem">
        </leap-select>
        <button class="btn btn-secondary-alt" @click="cancelAddTemplateGroup()" v-show="currentTemplate.isAdding">Cancel</button>
        <button class="btn btn-primary-alt" :class = "{'disabled':currentTemplate.config.availableFields.length == 0}" @click="toAddTemplateGroup()" v-show="!currentTemplate.isAdding">Add more</button>
      </div>

      <!-- Group By part -->
      <div class="content" v-if="currentTemplate.order == 4">
        <ul class="group-list" v-show="!currentTemplate.isAdding">
          <li v-for="g in currentTemplate.groups">
            <div class="conf-group-box">
              <div class="conf-group">
                <span class="conf-group-title" :title="g.name">{{g.name}}</span>
                <span class="conf-group-btn" @click="deleteTemplateGroup(g)">
									<i class="icon-trash-o"></i>
								</span>
              </div>
            </div>
          </li>
        </ul>
        <div v-if="currentTemplate.isAdding">
        	<div class="title">{{currentTemplate.currentGroup.name}}</div>
        	<div class="field-group">
        		<div class="label">Type</div>
        		<leap-select 
              :options="currentTemplate.config.type" 
              v-on:onSelectedValues="selectTemplateTypeItem">
            </leap-select>
        	</div>
        	<div class="field-group">
        		<div class="label">Data Field</div>
        		<leap-select 
              :options="currentTemplate.config.availableFields"
              v-on:onSelectedValues="selectTemplateDateFieldItem"> 
            </leap-select>
        	</div>
        	<div class="field-group">
        		<div class="label">Group By</div>
        		<leap-select 
              :options="currentTemplate.config.availableGroupByFields"
              v-on:onSelectedValues="selectTemplateGroupByItem"> 
            </leap-select>
        	</div>
        </div>
        <div class="actions group-by-actions">
        	<button class="btn btn-primary-alt group-by-action-add" @click="addTemplateGroup" v-show="currentTemplate.isAdding" :disabled="!isNewGroupValid">Add</button>
        	<button class="btn btn-secondary-alt" @click="cancelAddTemplateGroup" v-show="currentTemplate.isAdding">Cancel</button>
        </div>
        <button 
          class="btn btn-primary-alt" 
          :class = "{'disabled':
            currentTemplate.config.availableFields.length == 0
            ||currentTemplate.config.type.length == 0
            ||currentTemplate.config.availableGroupByFields.length == 0
          }" 
          @click="toAddTemplateGroup()" 
          v-show="!currentTemplate.isAdding"
        >Add more</button>
      </div>
    </div>
  </div>
</template>
<script src="./dashboard-configure-panel.js"></script>
<style src="./dashboard-configure-panel.scss" lang="scss" scoped></style>
