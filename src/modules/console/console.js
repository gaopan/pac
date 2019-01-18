import Navigator from '@/components/navigator/Navigator.vue'
import navMenus from './console.menus.js'
import CommonUtils from '@/utils/common-utils.js'

export default {
  name: 'Console',
  data() {
    return {
      menus: null
    }
  },
  components: { Navigator },
  methods: {
    parseMenus: function(to, cb) {
      let isAA = this.$store.getters.userProfile.isAA,
        isAdmin = this.$store.getters.userProfile.isAdmin,
        isBoss = this.$store.getters.userProfile.isBoss,
        userId = this.$store.getters.userProfile.id;
      let _navMenus = CommonUtils.deepClone(navMenus);
      if(isAA) {
        _navMenus.splice(0, 1);
      }
      // find monthly report
      let monthlyMenu = null,
        projectMenu = null,
        statisticMenu = null;
      _navMenus.forEach(menu => {
        if (menu.name == '月度报表') {
          monthlyMenu = menu;
        }
        if (menu.name == '重大项目') {
          projectMenu = menu;
        }
        if (menu.name == '工时跟踪') {
          statisticMenu = menu;
        }
      })

      if(isAA) {
        monthlyMenu.paramsRequired = {companyId: true};
        monthlyMenu.route = "Customization Dashboard Input";
        projectMenu.paramsRequired = {companyId: true};
        projectMenu.route = "Customization Project Input";
        statisticMenu.paramsRequired = {companyId: true};
        statisticMenu.route = "Statistic Dashboard Input";
      } else if(isBoss) {
        monthlyMenu.paramsRequired = {companyId: true};
        monthlyMenu.route = "Customization Dashboard Review";
        projectMenu.paramsRequired = {companyId: true};
        projectMenu.route = "Customization Project Review";
        statisticMenu.paramsRequired = {companyId: true};
        statisticMenu.route = "Statistic Dashboard Review";
      } else if(isAdmin) {
        monthlyMenu.childNodes = [{
          name: "查看",
          route: "Customization Dashboard Review",
          paramsRequired: {companyId: true}
        }, {
          name: "编辑",
          route: "Customization Dashboard Input",
          paramsRequired: {companyId: true}
        }];
        projectMenu.childNodes = [{
          name: "查看",
          route: "Customization Project Review",
          paramsRequired: {companyId: true}
        }, {
          name: "编辑",
          route: "Customization Project Input",
          paramsRequired: {companyId: true}
        }];
        statisticMenu.childNodes = [{
          name: "查看",
          route: "Statistic Dashboard Review",
          paramsRequired: {companyId: true}
        }, {
          name: "编辑",
          route: "Statistic Dashboard Input",
          paramsRequired: {companyId: true}
        }];
      }

      let matchedRouteNames = to.matched.map(r => r.name);
      _navMenus.forEach(m => {
        m.isActive = matchedRouteNames.indexOf(m.route) > -1;
        if (m.childNodes) {
          m.childNodes.forEach(cm => {
            let isActive = matchedRouteNames.indexOf(cm.route) > -1
            cm.isActive = isActive;
          });
        }
      });
      this.menus = _navMenus;
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
