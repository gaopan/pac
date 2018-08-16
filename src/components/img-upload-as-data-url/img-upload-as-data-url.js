import NotyOpeartion from '@/utils/noty-operation.js'

export default {
  name: 'img-upload-as-data-url',
  props: {
    dataUrl: {
      type: String,
      required: true
    },
    config: {
      type: Object
    }
  },
  data() {
    return {
      sDataUrl: this.dataUrl,
      fileSize:null
    }
  },
  watch: {
    dataUrl: {
      handler(newImgUrl) {
        this.sDataUrl = newImgUrl;
      }
    }
  },
  created() {
    this.imgTypeArr = ['image/png', 'image/jpeg', 'image/gif', 'image/jpg'];
  },
  methods: {
    fileChanged() {
      let vm = this, file = this.$refs.imgUpload.files ? this.$refs.imgUpload.files[0] : null;
      if(file){
        this.fileSize=(file.size)/1024;
        if(this.fileSize>2000){
           NotyOpeartion.notifyError({text: 'Picture Size Invalid !'});
        return ;
        }
      }
      
      
      if (!file) return ;
      if (!file.type || this.imgTypeArr.indexOf(file.type) === -1) {
        NotyOpeartion.notifyError({text: 'Please Select A Valid Picture !'});
        return ;
      }

      let fileReader = new FileReader();
      fileReader.addEventListener('load', function() {
        let dataUrl = fileReader.result;
        vm.sDataUrl = dataUrl;
        vm.$emit('changed-img-src', {imgSrc: dataUrl});
      }, false);
      fileReader.addEventListener('error', function() {
        NotyOpeartion.notifyError('Read File Error !');
      }, false);

      fileReader.readAsDataURL(file);
    }
  }
}