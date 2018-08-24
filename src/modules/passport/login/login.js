import { Validator } from 'vee-validate'
import axios from 'axios'
import shared from "@/shared.js"
import UserServices from '@/services/user-services'
import Account from '@/api/account.js'
import CustomerApi from '@/api/admin/company.js'

var images = require.context('@/assets/imgs/', false, /\.(png|jpg)$/)

let baseUrl = process.env.baseUrl;
let eventHub = shared.eventHub;
export default {
  name: 'login',
  data() {
    return {
      data: {
        email: '',
        password: '',
        isRemember: false,
      },
      loadingStyles: {
        height: 50,
        width: 60
      },
      
      loginUser: {},

      loginBlocked: false,

      displayControl:{
        timmer: 10,
        countDown: false,
        haveError: false,
        errorMessage: null,
        isLoading: false
      },
      errTemplate:{
        failed: "登录失败。账号或者密码不正确！",
        blocked:"登录失败。账号或者密码不正确！请10秒后再试！"
      }
      
    }
  },
  components: {
  },
  watch: {
    'data.email': {
      handler: function() {
        this.onChange();
      }
    }
  },
  created() {
    if (localStorage.getItem('Leap_Password') && localStorage.getItem('Leap_UserName')) {
      this.data.email = localStorage.getItem('Leap_UserName');
      this.data.password = localStorage.getItem('Leap_Password');
      this.data.isRemember = JSON.parse(localStorage.getItem('Leap_RememberMe')) || false;
      // this.loginUser.currentMethod = localStorage.getItem('Leap_LoginType') || 'Default';
      this.tempUser = localStorage.getItem('Leap_UserName');
      this.tempPassword = localStorage.getItem('Leap_Password');
    }
  },
  methods: {
    submit() {
      if (this.data.isRemember) {
        localStorage.setItem('Leap_UserName', this.data.email);
        localStorage.setItem('Leap_Password', this.data.password);
        localStorage.setItem('Leap_RememberMe', this.data.isRemember);
      } else {
        localStorage.setItem('Leap_RememberMe', this.data.isRemember);
        localStorage.setItem('Leap_UserName', "");
        localStorage.setItem('Leap_Password', "");
      }
      this.displayControl.isLoading = true;
      this.displayControl.haveError = false;

      var vm = this;

      var postData = {
        email: this.data.email,
        password: this.data.password
      }

      var config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      Account.login(postData).then(function(response) {
        if (response.data.mustActivate) {
          var code = response.data.activationCode;
          var url = '/passport/admincreatedactivation/' + code;
          vm.$router.replace(url);
        } else {
          UserServices.setCurrentUser(response.data);
          vm.displayControl.haveError = false;
          vm.displayControl.isLoading = false;

          var user = vm.$store.getters.userProfile;
          if (user.isLeapAdmin) {
            // vm.$router.replace('/console');
            // Customization
            vm.$router.replace('/console/cust');
          } else if(user.isBoss){
            vm.$router.replace('/console/cust');
          } else if(user.isAA){
            vm.$router.replace('/console/cust/monthly/zht');
          }else if (user.isCustomerLeadership) {
            var cusId = vm.$store.getters.userProfile.userFe.customerIdList[0];
            CustomerApi.getCustomer(cusId).then(function(res) {
              if (res.data.serviceTypes.indexOf('RAAS_Service') == !-1) {
                vm.$router.replace('/');
              } else {
                vm.$router.replace('/pd');
              }
            })
          } else if (user.isLeapPractitioner) {
            vm.$router.replace('/pd/selection');
          } else if (user.isSales) {
            window.location = 'https://engagecx.info/leap/';
          } else if (user.isCustomerPractitioner || user.isCustomerGeneralParticipant) {
            vm.$router.replace('/pd');
          } else if (user.isLeapRaaSAdmin || user.isLeapRaaSOperator || user.isCustomerRaaSOperator) {
            vm.$router.replace('/lr');
          } else if(user.isLeapSupport){
            vm.$router.replace('/health-check');
          }
        }

      }).catch(function(err) {
        if (err.response.data.code == 400) {
          if (err.response.data.details[0].code == "CUSTOMER_BLOCKED") {
            vm.displayControl.loginBlocked = true;
             vm.errHandler("blocked");
            vm.lockCustomer()
          } else {
             vm.errHandler("failed");
          }
        } else {
          vm.errHandler("failed");
        }

      });
    },
    gotoRegister() {
      this.$router.replace('/passport/newaccount');
    },
    gotoForgotPassword() {
      this.$router.replace('/passport/forgotpassword');
    },
    rememberMe() {
      if (!this.displayControl.loginBlocked) {
        if (this.data.isRemember) {
          this.data.isRemember = false;
        } else {
          this.data.isRemember = true;
        }
      }

    },
    onChange() {
      if (this.data.email !== this.tempUser) {
        this.data.password = '';
      } else {
        this.data.password = this.tempPassword;
      }
    },
    lockCustomer() {
      this.countdown();
    },
    errHandler(key){
      this.displayControl.errorMessage=this.errTemplate[key];
      this.displayControl.haveError = true;
      this.displayControl.isLoading = false;
    },
    countdown() {
      var vm = this;
      this.displayControl.timmer = 10;
      this.displayControl.countDown = true;
      var t = setInterval(function() {
        if (vm.displayControl.timmer !== 0) {
          vm.displayControl.timmer--;
        } else {
          clearInterval(t);
          vm.displayControl.countDown = false;
          vm.displayControl.loginBlocked = false;
          vm.displayControl.errorMessage='';
        }
      }, 1000);
    },
    imgUrl(path) {
      return images('./' + path);
    }
  },
  beforeDestroy: function() {
    // delete this.$options.sockets.event_name;
  }
}
