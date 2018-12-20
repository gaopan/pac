import Navigator from '@/components/navigator/Navigator.vue'
import navMenus from './console.menus.js'
import navMenusBoss from './console.boss.menus.js'
import CommonUtils from '@/utils/common-utils.js'
import CompanyApi from '@/api/customization/company.js'

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
    parseMenus: function(to, cb) {
      let isAA = this.$store.getters.userProfile.isAA,
        isAdmin = this.$store.getters.userProfile.isAdmin,
        isBoss = this.$store.getters.userProfile.isBoss,
        userId = this.$store.getters.userProfile.id,
        companies = this.$store.getters.userProfile.companies;
      let _navMenus = CommonUtils.deepClone(navMenusBoss);
      // find monthly report
      let monthlyMenu = null;
      _navMenus.every(menu => {
        if (menu.name == '月度报表') {
          monthlyMenu = menu;
          return false;
        }
        return true;
      })
      if (monthlyMenu) {
        CompanyApi.userCompanies(userId).then(res => {
          monthlyMenu.childNodes = [];
          if (isAA) {
            res.data.forEach(comp => {
              if (companies.indexOf(comp.id) > -1) {
                let _menu = {
                  name: comp.name,
                  route: 'Customization Dashboard',
                  params: { company: comp.name + '_' + comp.id },
                  childNodes: [{
                    name: '总览',
                    route: 'Customization Dashboard Overview',
                    params: { company: comp.name + '_' + comp.id }
                  }, {
                    name: '报告',
                    route: 'Customization Dashboard Report',
                    params: { company: comp.name + '_' + comp.id }
                  }]
                };
                monthlyMenu.childNodes.push(_menu);
              }
            });
          } else {
            res.data.forEach(comp => {
              let _menu = {
                name: comp.name,
                route: 'Customization Dashboard',
                params: { company: comp.name + '_' + comp.id },
                childNodes: [{
                  name: '报告',
                  route: 'Customization Dashboard Report',
                  params: { company: comp.name + '_' + comp.id }
                }]
              };
              if (isAdmin) {
                _menu.childNodes.splice(0, 0, {
                  name: '总览',
                  route: 'Customization Dashboard Overview',
                  params: { company: comp.name + '_' + comp.id }
                });
              }
              monthlyMenu.childNodes.push(_menu);
            });
          }

          let matchedRouteNames = to.matched.map(r => r.name);
          _navMenus.forEach(m => {
            m.isActive = matchedRouteNames.indexOf(m.route) > -1;
            if (m.childNodes) {
              m.childNodes.forEach(cm => {
                let isActive = matchedRouteNames.indexOf(cm.route) > -1
                if(cm.params) {
                  isActive = JSON.stringify(cm.params) == JSON.stringify(to.params);
                } 
                cm.isActive = isActive;
              });
            }
          });
          this.menus = _navMenus;
          this.showNav = to.name != 'Selection';
        });
      }
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
