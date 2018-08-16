<template>
  <nav class="news-pages"> 
     <ul class="page-ul"> 
        <li v-bind:key="index" v-for="(item,index) in pageList"  :class ="item.class" @click.stop="setPage(item)" v-html="item.html">
        </li>
     </ul>
    <div class="modify-pageSize" v-if = "enableUpdatePageSize">
      <span>Items per page</span>
      <input type="text" name="pageSizeCount" v-model.number= "newPageSize" @keypress = "fnUpdatingPageSize" >
      <button class = "btn btn-secondary" @click = "fnUpdatePageSize(newPageSize)" :class ="{'disabled':newPageSize==0||newPageSize==''||(max && newPageSize>max)}">Go</button>
      <span v-if = "max" class = "max-page"> * Maximum Size: {{max}}</span>
    </div>
   </nav>
</template>
<script >
  export default{
    props: { 
      max:{
        type:Number,
        validator:function(_max){
          if(_max>0)return true;
        }
      },
      prevIcon:{
        type:String,
        default:"icon-arrow-left"
      },
      nextIcon:{
        type:String,
        default:"icon-arrow-right"
      },
      currentPage:{
        type:Number
      }, 
      total:{
        type:Number
      }, 
      pageSize:{
        type:Number
      }, 
      nextPageCount:{
        type:Number,
        default:1
      },
      enableUpdatePageSize:{
        type:Boolean,
        default:false
      }
    }, 
    data(){
      return{
        newPageSize:null
      }
    },
    methods: { 
      setPage: function (item) {
        this.pageList=[];
        if (item.class == ''){
          this.$emit('pagehandler', item.page);
        } 

      },
      fnUpdatePageSize(size){
        if(size==0||size==''||(this.$props.max&&size>this.$props.max))return;
        this.$emit("updatePageSize",size)
      },
      fnUpdatingPageSize(event){
        var keyCode = event.keyCode;
        if(keyCode<48||keyCode>57||this.newPageSize>this.$props.max)event.preventDefault();
      }
    },
    computed:{
      pageList:function(){
        var pageList = [],
            pageCount = Math.ceil(this.total / this.pageSize), //the  number of  page button 
            hasPrev = this.currentPage >= 2,  //disable prev button when currentPage index over 1
            hasNext = this.currentPage < pageCount;   
   
        pageList.push({
          class: hasPrev ?'': 'disabled',
          page: hasPrev ? this.currentPage - 1 : this.currentPage,
          html: "<i class='"+this.prevIcon+"'></i>" 
        }); 

        //the first page 
        pageList.push({ 
          class: this.currentPage == 1 ? 'active' : '', 
          page: 1, 
          html: 1 
        }); 

        var start, end,
            p0 = this.nextPageCount,
            p1 = 1 + 2 + p0; //the index of add ahead "..." sign

        if (this.currentPage >= p1) { 
          start = this.currentPage - p0;
          pageList.push({ 
            class: 'dot', 
            page: this.currentPage, 
            html: '...'
          }); 
        } else { 
          start = 2; 
        } 
        var p2 = this.currentPage + p0; 
           end = p2 < pageCount?p2:pageCount - 1; 

        for (let i = start; i <= end; i++) { 
          pageList.push({ 
            class: this.currentPage == i ? 'active' : '', 
            page: i, 
            html: i 
          }); 
        } 
        if (end < pageCount - 1) { 
          pageList.push({ 
            class: 'dot', 
            page: this.currentPage, 
            html: '...'
          }); 
        } 
        if (pageCount > 1) { 
          pageList.push({ 
            class: this.currentPage == pageCount ? 'active' : '', 
            page: pageCount, 
            html: pageCount 
          }); 
        } 

        pageList.push({
          class: hasNext ? '':'disabled',
          page: hasNext ? this.currentPage + 1 : this.currentPage,
          html: "<i class='"+this.nextIcon+"'></i>" 
        });           

        return pageList;               
      }
    },
    created(){
      this.newPageSize = this.$props.pageSize;
    }
};    
 
</script>
<style lang="scss">
  .news-pages {
      text-align: center;
      -webkit-user-select: none;
  }

  .news-pages {
      color: #48576a;
  }

  .news-pages ul {
      display: inline-block;
      padding: 0;
  }

  .news-pages ul li {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    box-sizing: border-box;
    text-align: center;
    min-width: 24px;
    height: 24px;    
  }

  .news-pages ul li:first-child,
  .news-pages ul li:last-child {
    vertical-align: bottom;
    color:#000000;
  }
  .news-pages ul li:first-child{
    margin-right: 14px;
  }

  .news-pages ul li:last-child{
    margin-left: 14px;
  }  
  .news-pages ul li:first-child:hover,
  .news-pages ul li:last-child:hover {
    background: none;
    color:#000000;
  }   
  .news-pages ul li.disabled {
      cursor: not-allowed;
      color: #A9ADAD;
  }
  .news-pages ul li:first-child.disabled:hover ,
  .news-pages ul li:last-child.disabled:hover {
    color: #A9ADAD;
  }
  .news-pages ul li:hover {
      background-color: #000;
      color: #fff;
  }

  .news-pages ul li.active {
    background-color: $color;
    color: black;
    cursor: default;
  }

  .news-pages ul li.active:hover {
      color: white;
  }

  .news-pages ul li.dot {
      cursor: default;
  } 
  .news-pages input{
    width: 56px;
    margin-right: 10px;
    margin-left: 8px;
  }
  .news-pages button{
    vertical-align: unset;
  }

  .news-pages .max-page{
    margin-left: 14px;
    font-size: 12px;
  }
  .news-pages  .modify-pageSize{
    display: inline-block;
    margin-left: 14px;
  }
</style>
 