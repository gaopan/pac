import Vue from 'vue'
import CommonUtils from '@/utils/common-utils.js'
import MiniLoader from '@/components/loader/MiniLoader.vue'

var images = require.context('@/assets/imgs/', false, /\.(png|jpg)$/)

export default {
  props: {
    menus: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      isShowMenus: true,
      navs: null,
      breadcrumbs: [],
      user: this.$store.getters.userProfile
    };
  },
  watch: {
    menus: {
      handler(val) {
        this.parseMenus(val);
      }
    },
    $route(to, from) {
      this.parseCurrentRoutes(to);
    }
  },
  created: function() {
    this.parseMenus(this.$props.menus);

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
      this.$router.push({ name: cm.route, params: cm.params });
    },
    imgUrl(path) {
      return images('./' + path);
    },
    logout() {
      this.$router.push('/passport/login');
    },
    toProject(){
      this.$router.push('/console/cust/project/中海庭1_181227_223039_2435/task/1');
    }
  },
  components: { MiniLoader }
}
