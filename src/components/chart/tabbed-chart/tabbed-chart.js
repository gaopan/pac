import Chart from '../Chart.vue'
import TypeChecker from '@/utils/type-checker.js'
import commonUtils from '@/utils/common-utils.js'
import Paginator from '@/components/Paginator/Paginator.vue'

export default {
  name: 'tabbed-chart',
  components: { Chart, Paginator },
  props: {
    tabList: {
      type: Array,
      required: true
    },
    pagging: {
      validator: function(_pagging){
        if(!TypeChecker.isObject(_pagging)) return true;
        if(!TypeChecker.isNumber(_pagging.pageIndex)) return false;
        if(!TypeChecker.isNumber(_pagging.total)) return false;
        if(!TypeChecker.isNumber(_pagging.pageSize)) return false;
        if(!TypeChecker.isFunction(_pagging.onPageChange)) return false;
        return true;
      }
    },
    actions: {
      validator: function(_actions) {
        if (TypeChecker.isArray(_actions) && _actions.length > 0) {
          let valid = true;
          _actions.forEach(act => {
            if (!TypeChecker.isObject(act)) {
              return valid = false;
            }
            if (!TypeChecker.isString(act.icon) || act.icon.trim().length < 1) {
              return valid = false;
            }
            if (!TypeChecker.isFunction(act.onClick)) return valid = false;
            return true;
          });
          return valid;
        } else if (_actions == null || _actions == undefined) {
          return true;
        } else {
          return false;
        }
        return true;
      }
    },
    labelData: {
      //added :hong-yu.chen@hpe.com
      type: String,
      required: false
    }
  },
  watch: {
    tabList: {
      handler(newV) {
        if (newV) {
          this.tabsGenerator()
        }
      }
    },
    deep: true
  },
  data() {
    return {
      tabs: null,
      selectedTab: null,
    }
  },
  created() {
    this.tabsGenerator()
  },
  methods: {
    selectOption(tab) {
      this.selectedTab = tab;
      this.isOpen = false;

      this.$emit('change', {
        default: false,
        selected: this.selectedTab
      });
    },
    tabsGenerator() {
      this.tabs = [];
      this.$props.tabList.forEach(tab => {
        let theTab = {
          index: this.tabs.length,
          title: tab.title,
          isPlainTitle: tab.isPlainTitle
        };
        for (let key in tab) {
          if (tab.hasOwnProperty(key) && key != 'title' && key != 'isPlainTitle') {
            theTab[key] = tab[key];
          }
        }
        this.tabs.push(theTab);
      });
      //added :hong-yu.chen@hpe.com
      if (TypeChecker.isString(this.$props.labelData)) {
        this.tabs.forEach(d => {
          if (d.title == this.$props.labelData) {
            this.selectedTab = d;
          }
        })
      } else {
        this.selectedTab = this.tabs[0];
      }

      if (this.selectedTab) {
        this.$emit('change', {
          default: true,
          selected: this.selectedTab
        });
      }
    },
    clickAction(act) {
      act.onClick(act);
    }
  }
}
