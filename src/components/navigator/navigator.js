import Vue from 'vue'
import CommonUtils from '@/utils/common-utils.js'
import MiniLoader from '@/components/loader/MiniLoader.vue'
import Datepicker from '@/components/leap-datepicker/Datepicker.vue'
import TypeChecker from '@/utils/type-checker.js'
import shared from '@/shared.js'

var eventHub = shared.eventHub;
var images = require.context('@/assets/imgs/', false, /\.(png|jpg)$/)

let RoutesHiddenDateSelect = ["Customization Project Review", "Statistic Dashboard Review"]
export default {
  props: {
    menus: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      paramsBundle: {
        companyId: null,
        companyName: null
      },
      isShowMenus: true,
      navs: null,
      breadcrumbs: [],
      user: this.$store.getters.userProfile,
      date: null,
      showMonthSelect: true
    };
  },
  watch: {
    menus: {
      handler(val) {
        this.parseMenus(val);
      }
    },
    date(val){
      localStorage.setItem("global-date", val);
      eventHub.$emit("global-date", val);
    },
    $route(to, from) {
      this.showMonthSelect = RoutesHiddenDateSelect.indexOf(to.name) < 0;
      this.parseCurrentRoutes(to);
    }
  },
  created: function() {
    if(this.$route.params.companyId) {
      this.paramsBundle.companyId = this.$route.params.companyId;
    }
    eventHub.$on("global-params-change-companyName", this.changedCompanyName);
    eventHub.$on("global-params-change-companyId", this.changedCompanyId);
    this.date = new Date();
    localStorage.setItem("global-date", this.date);

    this.parseMenus(this.$props.menus);

    if(RoutesHiddenDateSelect.indexOf(this.$router.currentRoute.name) > -1) {
      this.showMonthSelect = false;
    }
    this.parseCurrentRoutes(this.$router.currentRoute);
  },
  methods: {
    parseCurrentRoutes(current) {
      let tmpCrumbs = null,
        found = false;
      this.navs.every(nav => {
        tmpCrumbs = [nav];
        if (nav.route == current.name) {
          found = true;
        }
        if (nav.childNodes) {
          nav.childNodes.every(m => {
            tmpCrumbs.push(m);
            if (m.route == current.name) {
              found = true;
            } else {
              if (m.childNodes) {
                m.childNodes.every(cm => {
                  tmpCrumbs.push(cm);
                  if (cm.route == current.name) found = true;
                  if (!found) tmpCrumbs.splice(tmpCrumbs.length - 1, 1);
                  return !found;
                });
              }
            }
            if (!found) tmpCrumbs.splice(tmpCrumbs.length - 1, 1);
            return !found;
          });
        }
        if (!found) tmpCrumbs.splice(tmpCrumbs.length - 1, 1);
        return !found;
      });
      if (found) {
        this.breadcrumbs = tmpCrumbs;
      }
    },
    parseMenus(menus) {
      if (!this.navs) {
        this.navs = CommonUtils.deepClone(menus);
      } else {
        let menuNames = menus.map(m => m.name);
        this.navs.forEach(m => {
          let mIndex = menuNames.indexOf(m.name);
          if (mIndex > -1) {
            let _m = menus[mIndex];
            Vue.set(m, 'isActive', _m.isActive);

            if (m.childNodes && _m.childNodes) {
              let cMenuNames = _m.childNodes.map(cm => cm.name);
              m.childNodes.forEach(cm => {
                let cmIndex = cMenuNames.indexOf(cm.name);
                if (cmIndex > -1) {
                  let _cm = _m.childNodes[cmIndex];
                  Vue.set(cm, 'isActive', _cm.isActive);
                }
              });
            }
          }
        });
      }
    },
    clickOnMenu(cm) {
      if(TypeChecker.isObject(cm.paramsRequired)) {
        cm.params = {};
        for(let key in cm.paramsRequired) {
          if(cm.paramsRequired.hasOwnProperty(key)) {
            cm.params[key] = this.paramsBundle[key];
          }
        }
      }
      this.$router.push({ name: cm.route, params: cm.params });
    },
    imgUrl(path) {
      return images('./' + path);
    },
    logout() {
      this.$router.push('/passport/login');
    },
    changedCompanyId(companyId){
      this.paramsBundle.companyId = companyId;
    },
    changedCompanyName(companyName){
      this.paramsBundle.companyName = companyName;
    }
  },
  components: { MiniLoader, Datepicker },
  beforeDestroy(){
    eventHub.$off("global-params-change-companyId", this.changedCompanyId);
  }
}
