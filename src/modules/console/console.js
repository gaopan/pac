import Navigator from '@/components/navigator/CustomizedNavigator.vue'
import navMenus from './customized-console.menus.js'
import CommonUtils from '@/utils/common-utils.js'

export default {
  name: 'Console',
  data() {
    return {
      menus: null,
      showNav: false
    }
  },
  components: { Navigator },
  methods: {
    parseMenus: function(to) {
      let matchedRouteNames = to.matched.map(r => r.name);
      navMenus.forEach(m => {
        m.isActive = matchedRouteNames.indexOf(m.route) > -1;
        m.childNodes.forEach(cm => {
          cm.isActive = matchedRouteNames.indexOf(cm.route) > -1;
        });
      });
      this.menus = CommonUtils.deepClone(navMenus);
      this.showNav = to.name != 'Selection';
    }
  },
  created: function() {
  	this.parseMenus(this.$router.currentRoute);
  },
  beforeRouteUpdate(to, from, next) {
    this.parseMenus(to);
    next();
  }
}
