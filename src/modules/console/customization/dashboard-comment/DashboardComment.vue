<template>
  <div class="dashboard-comment">
  	<h4>备注：</h4>
    <div v-for="comment in data">
      <div class="comment-header">
      	<span>{{comment.month == curMonth ? '当月' : comment.month}}</span>
      	<span class="comment-actions" v-if="comment.month == curMonth">
      		<span v-show="!comment.isEditing" @click="editComment(comment)"><i class="icon-edit-2"></i></span>
      		<span v-show="comment.isEditing" @click="saveComment(comment)"><i class="icon-save"></i></span>
      		<span v-show="comment.isEditing" @click="cancelEditComment(comment)"><i class="icon-x"></i></span>
      	</span>
      </div>
      <div class="alert alert-info" v-show="!comment.isEditing">{{comment.content}}</div>
      <div v-if="comment.isEditing">
      	<textarea class="form-control" v-model="comment._content"></textarea>
      </div>
    </div>
  </div>
</template>
<script src="./dashboard-comment.js"></script>
