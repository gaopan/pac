import shared from "../../shared.js";
import ResizeHandler from "./ResizeHandler.vue";
import TransformHandler from "./TransformHandler.vue";

var eventHub = shared.eventHub;
export default {
  name: 'tile',
  props: {
    tilePanelId: {
      type: String,
      required: true
    },
    conf: {
      id: {
        type: String,
        required: true
      },
      cellSizeWidth: {
        type: Number
      },
      cellSizeHeight: {
        type: Number
      },
      title: {
        type: String
      },
      width: {
        type: Number
      },
      height: {
        type: Number
      },
      transform: {
        type: Object
      },
      fixed: {
        type: Boolean
      },
      hideHeader: {
        type: Boolean
      },
      allowScroll: {
        type: Boolean
      },
      disableRefresh: {
        type: Boolean,
        default: true
      },
      disableFullScreen: {
        type: Boolean
      },
      customActions: {
        type: Array
      }
    }
  },
  data() {
    return {
      isFixed: false,
      isDisabledRefresh: false,
      isDisabledFullScreen: false,
      isHover: false,
      isResizing: false,
      isLoading: false,
      isTransforming: false,
      isFullScreen: false,
      resizeLock: false,
      transformLock: false,
      id: null,
      title: null,
      trans: {
        x: 0,
        y: 0
      },
      size: {
        width: 0,
        height: 0
      },
      cellSize: {
        width: 0,
        height: 0
      },
      lastPos: {
        x: 0,
        y: 0
      },
      lastSize: {},
      lastCellSize: {},
      styles: {
        title: {},
        layout: {},
        actions: {}
      },
      loadingQueue: [],
      chartIcon: false,
      self: this
    };
  },
  components: {
    ResizeHandler,
    TransformHandler
  },
  created: function() {
    this.setStyles();
    var conf = Object.assign({}, this.$props.conf);
    this.id = conf.id;
    this.title = conf.title || 'Untitled Tile';
    this.cellSize.width = conf.cellSizeWidth || 260;
    this.cellSize.height = conf.cellSizeHeight || 180;

    this.size.width = this.lastSize.width = conf.width || this.cellSize.width;
    this.size.height = this.lastSize.height = conf.height || this.cellSize.height;

    var trans = Object.assign({}, conf.transform);
    this.trans.x = this.lastPos.x = (trans.x < 0 || !trans.x) ? 0 : trans.x;
    this.trans.y = this.lastPos.y = (trans.y < 0 || !trans.y) ? 0 : trans.y;

    this.isFixed = !!conf.fixed;
    if (conf.disableRefresh == undefined || conf.disableRefresh == null) {
      this.isDisabledRefresh = true;
    } else {
      this.isDisabledRefresh = conf.disableRefresh;
    }

    this.isDisabledFullScreen = !!conf.disableFullScreen;
    this.chartIcon = conf.customActions.length > 0 ? true : false;

    if (!this.isFixed) {
      eventHub.$on("adjust-tile-transform", this.adjustTileTransform);
      eventHub.$on("adjust-tile-size", this.adjustTileSize);
      eventHub.$on("start-resize", this.startResize);
      eventHub.$on("resize", this.resize);
      eventHub.$on("end-resize", this.endResize);
      eventHub.$on("start-transform", this.startTransform);
      eventHub.$on("transform", this.transform);
      eventHub.$on("end-transform", this.endTransform);
    }
    eventHub.$on("out-full-screen-tile", this.outToFullScreen);
    eventHub.$on("out-exit-full-screen-tile", this.outExitFullScreen);
    eventHub.$on("window-resized", this.windowResized);
    eventHub.$on("loading-data-in-tile", this.loadingData);
    eventHub.$on("loaded-data-in-tile", this.loadedData);
  },
  methods: {
    setStyles: function() {
      //don't want to show tile-title
      if (this.$props.conf.hideHeader != undefined && this.$props.conf.hideHeader) {
        this.$data.styles.title.display = "none";
        this.$data.styles.layout.top = 0;
      }
      //allow scroll to specific tile
      if (this.$props.conf.allowScroll != undefined && this.$props.conf.allowScroll) {
        this.$data.styles.layout.overflow = "auto";
        this.$data.styles.actions.marginRight = "20px";
      }
    },
    broadcastResized: function() {
      eventHub.$emit("tile-window-resized", {
        id: this.id,
        panelId: this.$props.tilePanelId
      });
    },
    broadcastIfFullScreen(ifFullScreen){
      eventHub.$emit('tile-full-screen-inner', {
        id: this.id,
        panelId: this.$props.tilePanelId,
        ifFullScreen: ifFullScreen
      });
    },
    outToFullScreen: function(args) {
      if (args.id == this.id) {
        this.toFullScreen();
      }
    },
    outExitFullScreen: function(args) {
      if (args.id == this.id) {
        this.exitFullScreen();
      }
    },
    toFullScreen: function() {
      var vm = this;
      this.lastSize.width = this.size.width;
      this.lastSize.height = this.size.height;
      this.lastCellSize.width = this.cellSize.width;
      this.lastCellSize.height = this.cellSize.height;
      this.lastPos.x = this.trans.x;
      this.lastPos.y = this.trans.y;

      this.size.width = this.$parent.size.width;
      this.size.height = this.$parent.size.height;
      this.trans.x = 0;
      this.trans.y = 0;

      this.isFullScreen = true;

      setTimeout(function() {
        vm.broadcastIfFullScreen(true);
      }, 500);

      eventHub.$emit("full-screen-tile", {
        id: vm.id,
        panelId: this.$props.tilePanelId
      });
    },
    exitFullScreen: function() {
      var vm = this;
      this.size.width = this.lastSize.width;
      this.size.height = this.lastSize.height;
      this.trans.x = this.lastPos.x;
      this.trans.y = this.lastPos.y;

      this.isFullScreen = false;

      setTimeout(function() {
        vm.broadcastIfFullScreen(false);
      }, 500);

      eventHub.$emit("exit-full-screen-tile", {
        panelId: this.$props.tilePanelId
      });
    },
    windowResized: function(args) {
      var vm = this;
      if (args.id == this.id) {
        this.cellSize.width = args.cellSizeWidth;
        this.cellSize.height = args.cellSizeHeight;
        var ratio = { x: 1, y: 1 };
        if (this.cellSize.width) {
          ratio.x = this.cellSize.width / this.lastCellSize.width;
        }
        if (this.cellSize.height) {
          ratio.y = this.cellSize.height / this.lastCellSize.height;
        }
        this.lastSize.width *= ratio.x;
        this.lastSize.height *= ratio.y;
        this.lastPos.x *= ratio.x;
        this.lastPos.y *= ratio.y;
        this.size.width = args.width;
        this.size.height = args.height;
        this.trans.x = args.transform.x;
        this.trans.y = args.transform.y;

        if (this.$el.style.display != 'none') {
          setTimeout(function() {
            vm.broadcastResized();
          }, 500);
        }
      }
    },
    adjustTileSize: function(args) {
      if (args.id == this.id) {
        this.size.width = args.size.width;
        this.size.height = args.size.height;

        // this.broadcastResized();
      }
    },
    startResize: function(args) {
      if (args.id == this.id) {
        this.isResizing = true;
        this.lastSize.width = this.size.width;
        this.lastSize.height = this.size.height;
        eventHub.$emit("start-resize-tile", {
          id: this.id,
          panelId: this.$props.tilePanelId
        });
      }
    },
    resize: function(v) {
      if (v.id == this.id && this.isResizing && !this.resizeLock) {
        this.resizeLock = true;
        if (this.lastSize.width + v.trans.x < this.cellSize.width) {
          this.size.width = this.cellSize.width;
        } else {
          this.size.width = this.lastSize.width + v.trans.x;
        }
        if (this.lastSize.height + v.trans.y < this.cellSize.height) {
          this.size.height = this.cellSize.height;
        } else {
          this.size.height = this.lastSize.height + v.trans.y;
        }
        eventHub.$emit("resize-tile", {
          id: this.id,
          size: this.size,
          trans: this.trans,
          panelId: this.$props.tilePanelId
        });
        this.resizeLock = false;
      }
    },
    endResize: function(args) {
      if (args.id == this.id) {
        this.isResizing = false;
        eventHub.$emit("end-resize-tile", {
          id: this.id,
          panelId: this.$props.tilePanelId
        });
      }
    },
    adjustTileTransform: function(args) {
      if (args.id == this.id) {
        this.trans.x = args.trans.x;
        this.trans.y = args.trans.y;
      }
    },
    startTransform: function(args) {
      if (args.id == this.id) {
        this.isTransforming = true;
        this.lastPos.x = this.trans.x;
        this.lastPos.y = this.trans.y;
        eventHub.$emit("start-drag-tile", {
          id: this.id,
          panelId: this.$props.tilePanelId
        });
      }
    },
    transform: function(args) {
      if (args.id == this.id && this.isTransforming && !this.transformLock) {
        this.transformLock = true;
        this.trans.x = this.lastPos.x + args.trans.x;
        this.trans.y = this.lastPos.y + args.trans.y;
        eventHub.$emit("drag-tile", {
          id: this.id,
          trans: this.trans,
          size: this.size,
          panelId: this.$props.tilePanelId
        });
        this.transformLock = false;
      }
    },
    endTransform: function(args) {
      if (args.id == this.id) {
        this.isTransforming = false;
        eventHub.$emit("end-drag-tile", {
          id: this.id,
          panelId: this.$props.tilePanelId
        });
      }
    },
    transToString: function() {
      var transformStr = 'translate({x},{y})';
      for (var key in this.trans) {
        if (this.trans.hasOwnProperty(key)) {
          var reg = new RegExp('\\{' + key + '\\}', 'gm');
          transformStr = transformStr.replace(reg, this.trans[key] + 'px');
        }
      }
      return transformStr;
    },
    loadingData: function(args) {
      var vm = this;
      if (args.id == this.id) {
        this.loadingQueue.push({
          id: args.loadId
        });
        vm.isLoading = true;
      }
    },
    loadedData: function(args) {
      var vm = this;
      if (args.id == this.id) {
        var index = this.loadingQueue.findIndex(item => item.id == args.loadId);

        if (index >= 0) {
          this.loadingQueue.splice(index, 1);
          if (this.loadingQueue.length < 1) {
            vm.isLoading = false;
          }
        }
      }
    },
    cancelLoad: function() {
      var vm = this;
      vm.isLoading = false;
      vm.loadingQueue.splice(0);

      eventHub.$emit('cancel-load-data-in-tile', {
        id: vm.id
      });
    }
  },
  mounted: function() {
    var vm = this;

    function onMouseOver(e) {
      vm.isHover = true;
      e.preventDefault();
      e.stopPropagation();
    }

    function onMouseOut(e) {
      vm.isHover = false;

      e.preventDefault();
      e.stopPropagation();
    }

    vm.$el.addEventListener('mouseover', onMouseOver);
    vm.$el.addEventListener('mouseout', onMouseOut);
  },
  beforeDestroy: function() {
    if (!this.isFixed) {
      eventHub.$off("adjust-tile-transform", this.adjustTileTransform);
      eventHub.$off("adjust-tile-size", this.adjustTileSize);
      eventHub.$off("start-resize", this.startResize);
      eventHub.$off("resize", this.resize);
      eventHub.$off("end-resize", this.endResize);
      eventHub.$off("start-transform", this.startTransform);
      eventHub.$off("transform", this.transform);
      eventHub.$off("end-transform", this.endTransform);
    }
    eventHub.$off("out-full-screen-tile", this.outToFullScreen);
    eventHub.$off("out-exit-full-screen-tile", this.outExitFullScreen);
    eventHub.$off("window-resized", this.windowResized);
    eventHub.$off("loading-data-in-tile", this.loadingData);
    eventHub.$off("loaded-data-in-tile", this.loadedData);
  }
}
