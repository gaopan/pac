import TypeChecker from '@/utils/type-checker.js'
import CommonConverter from '@/utils/common-converter.js'
import shared from '@/shared.js'

let eventHub = shared.eventHub

export default {
  name: 'process-kpi',
  props: {
    conf: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      isStandard: false,
      id: null,
      kpi: {},
      desc: null,
      actions: [],
      hideCaption: false,
      detailToggle: { visible: false, expand: false }
    };
  },
  watch: {
    conf: {
      handler: function() {
        this.parseConf();
      },
      deep: true
    }
  },
  created: function() {
    eventHub.$on('close-kpi-detail', this.onCloseKpiDetail);
    eventHub.$on('hide-kpi-caption', this.onHideKpiCaption);
    eventHub.$on('show-kpi-caption', this.onShowKpiCaption);
  },
  mounted: function() {
    this.parseConf();
  },
  methods: {
    parseConf: function() {
      var vm = this;
      if (this.$props.conf) {
        if (TypeChecker.isObject(this.$props.conf.data)) {
          var d = this.$props.conf.data;
          this.kpi = {
            cycleTime: CommonConverter.convertSecondToStr(d.cycleTime, 1),
            firstPassYield: TypeChecker.isNumber(d.firstPassYield) ? ((d.firstPassYield * 100).toFixed(2) + '%') : 'N/A',
            compliance: TypeChecker.isNumber(d.compliance) ? ((d.compliance * 100).toFixed(2) + '%') : 'N/A'
          };
        }
        if (TypeChecker.isObject(this.$props.conf.opts)) {
          this.desc = this.$props.conf.opts.desc;
          this.isStandard = !!this.$props.conf.opts.standard;
          if (TypeChecker.isArray(this.$props.conf.opts.actions)) {
            var actions = [];
            this.$props.conf.opts.actions.forEach(function(d) {
              actions.push(d);
            });
            vm.actions = actions;
          }
          if (TypeChecker.isObject(this.$props.conf.opts.detailToggle)) {
            this.detailToggle.visible = true;
            this.detailToggle.expand = !!this.$props.conf.opts.detailToggle.expand;
            if (TypeChecker.isFunction(vm.$props.conf.opts.detailToggle.toggle)) {
              this.detailToggle.toggle = vm.$props.conf.opts.detailToggle.toggle;
            }
          }
          if (TypeChecker.isString(this.$props.conf.opts.id)) {
            this.id = this.$props.conf.opts.id;
          }
        }
      }
    },
    clickAction: function(action) {
      if (TypeChecker.isFunction(action.fn)) {
        action.fn.call(this);
      }
    },
    onClickDetailToggle: function() {
      this.detailToggle.expand = !this.detailToggle.expand;
      if (this.detailToggle.toggle) {
        this.detailToggle.toggle.call(this, this.detailToggle.expand);
      }
    },
    onCloseKpiDetail: function(args) {
      if (this.id == args.id) {
        this.detailToggle.expand = false;
        if (this.detailToggle.toggle) {
          this.detailToggle.toggle.call(this);
        }
      }
    },
    onHideKpiCaption: function(args){
      if(this.id == args.id) {
        this.hideCaption = true;
      }
    },
    onShowKpiCaption: function(args){
      if(this.id == args.id) {
        this.hideCaption = false;
      }
    }
  },
  beforeDestroy: function() {
    eventHub.$off('close-kpi-detail', this.onCloseKpiDetail);
    eventHub.$off('hide-kpi-caption', this.onHideKpiCaption);
    eventHub.$off('show-kpi-caption', this.onShowKpiCaption);
  }
}
