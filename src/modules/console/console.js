import Navigator from '@/components/navigator/Navigator.vue'
import navMenus from './console.menus.js'
import navMenusBoss from './console.boss.menus.js'
import CommonUtils from '@/utils/common-utils.js'
import CompanyApi from '@/api/customization/company.js'
import ProjectData from './customization/project/project.data.js'

let pd = CommonUtils.deepClone(ProjectData)

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
        userId = this.$store.getters.userProfile.id,
        companies = this.$store.getters.userProfile.companies;
      let _navMenus = CommonUtils.deepClone(navMenusBoss);
      // find monthly report
      let monthlyMenu = null,
        monthlyProjectMenu = null;
      _navMenus.forEach(menu => {
        if (menu.name == '公司月度报表') {
          monthlyMenu = menu;
        }
        if (menu.name == '重大项目列表') {
          monthlyProjectMenu = menu;
        }
      })
      let _companies = null,
        _projects = null;
      let companyPromise = CompanyApi.userCompanies(userId).then(res => {
        _companies = res.data;
      });
      companyPromise.then(res => {
        if (monthlyMenu) {
          monthlyMenu.childNodes = [];
        }

        if (monthlyProjectMenu) {
          monthlyProjectMenu.childNodes = [];
        }

        if (isAA) {
          if (monthlyMenu) {
            _companies.forEach(comp => {
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

              let _projectMenu = {
                name: comp.name,
                route: "Customization Project",
                params: {company: comp.name + '_' + comp.id},
                childNodes: [{
                  name: '总览',
                  route: 'Customization Project Overview',
                  params: { company: comp.name + '_' + comp.id }
                }]
              };
              pd.projects.forEach(proj => {
                let _pMenu = {
                  name: proj.name,
                  route: 'Customization Project Task',
                  params: { projectId: proj.id, company: comp.name + '_' + comp.id }
                };
                _projectMenu.childNodes.push(_pMenu);
              });

              if(monthlyProjectMenu) {
                monthlyProjectMenu.childNodes.push(_projectMenu);
              }
            });
          }
        } else {
          if (monthlyMenu) {
            _companies.forEach(comp => {
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

              let _projectMenu = {
                name: comp.name,
                route: "Customization Project",
                params: {company: comp.name + '_' + comp.id},
                childNodes: [{
                  name: '总览',
                  route: 'Customization Project Overview',
                  params: { company: comp.name + '_' + comp.id }
                }]
              };
              pd.projects.forEach(proj => {
                let _pMenu = {
                  name: proj.name,
                  route: 'Customization Project Task',
                  params: { projectId: proj.id, company: comp.name + '_' + comp.id }
                };
                _projectMenu.childNodes.push(_pMenu);
              });

              if(monthlyProjectMenu) {
                monthlyProjectMenu.childNodes.push(_projectMenu);
              }
            });
          }
        }

        let matchedRouteNames = to.matched.map(r => r.name);
        _navMenus.forEach(m => {
          m.isActive = matchedRouteNames.indexOf(m.route) > -1;
          if (m.childNodes) {
            m.childNodes.forEach(cm => {
              let isActive = matchedRouteNames.indexOf(cm.route) > -1
              if (cm.params) {
                isActive = JSON.stringify(cm.params) == JSON.stringify(to.params);
              }
              cm.isActive = isActive;
            });
          }
        });
        this.menus = _navMenus;
      });
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
