import Vue from 'vue'
import CommonUtils from '@/utils/common-utils.js'
import MiniLoader from '@/components/loader/MiniLoader.vue'

export default {
  name: 'navigator',
  props: {
    menus: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      isShowMenus: false,
      navs: null,
      activedModule: null,
      breadcrumbs: []
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
                  return !found;
                });
              }
            }
            return !found;
          });
        }
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
            let _m = menus[mIndex],
              cMenuNames = _m.childNodes.map(cm => cm.name);
            Vue.set(m, 'isActive', _m.isActive);

            m.childNodes.forEach(cm => {
              let cmIndex = cMenuNames.indexOf(cm.name);
              if (cmIndex > -1) {
                let _cm = _m.childNodes[cmIndex];
                Vue.set(cm, 'isActive', _cm.isActive);
              }
            });
          }
        });
      }
    },
    toggleExpandMenu(parent, m) {
      parent.childNodes.forEach(_m => {
        if (m.name == _m.name && !m.isOpen) {
          Vue.set(_m, 'isOpen', true);
        } else {
          Vue.set(_m, 'isOpen', false);
        }
      });
    },
    clickOnMenu(cm) {
      this.isShowMenus = false;
      this.$router.push({ name: cm.route });
    },
    activeModule(m) {
      if (m.name == '流程工作台' && this.$router.currentRoute.fullPath.indexOf('/pd/') < 0) {
        this.$router.push({ path: '/console/selection' });
      } else {
        this.activedModule = m;
      }
    },
    deactiveModule() {
      this.activedModule = null;
    }
  },
  components: { MiniLoader }
}
