import shared from "@/shared.js"
import commonGenerators from '@/utils/common-generators.js'
import CommonUtils from '@/utils/common-utils.js'
import UICommonMethods from "@/utils/ui-common-methods"
import Tile from './Tile.vue'
import _ from 'underscore'

var eventHub = shared.eventHub;
var UUIDGenerator = commonGenerators.UUIDGenerator;

export default {
  template: `<div class="tile-panel">
      <div class="tile-container">
        <tile v-for="t in pTiles" :key="t.id" :tile-panel-id="id" :conf="t.conf" v-show="!fullScreenTileId||fullScreenTileId==t.id" >
          <component :is="t.type" :tile-id="t.id" :conf="t.chartConfig" :tile-conf="t.conf"></component>
        </tile>
      </div>
    </div>`,
  components: { Tile },
  props: {
    tiles: {
      type: Array,
      required: true
    },
    tilePanelId: {
      type: String,
      default: ''
    },
    config: {
      fixed: {
        type: Boolean,
        required: false
      }
    }
  },
  watch: {
    tiles: {
      handler() {
        this.tilesChanged();
      },
      deep: true
    }
  },
  data() {
    return {
      id: null,
      isFixed: false,
      scrollbarWidth: 0,
      fullScreenTileId: null,
      size: null,
      tileCellSize: {
        width: 260,
        height: 180
      },
      padding: 2,
      mode: {
        x: 'lg',
        y: 'lg'
      },
      currentTileId: null,
      bgTrans: {},
      bgSize: {},
      pTiles: [],
      bgBlock: null,
      toFullScreenTile: {}
    };
  },
  created: function() {
    let vm = this;
    if (this.$props.tilePanelId != '') {
      this.id = this.$props.tilePanelId;
    } else {
      this.id = UUIDGenerator.purchase();
    }

    this.scrollbarWidth = UICommonMethods.getScrollBarWidth();
    this.isFixed = this.$props.config && !!this.$props.config.fixed;

    if (!this.isFixed) {
      eventHub.$on("start-drag-tile", this.startDragTile);
      eventHub.$on("drag-tile", this.dragTile);
      eventHub.$on("end-drag-tile", this.endDragTile);
      eventHub.$on("start-resize-tile", this.startResizeTile);
      eventHub.$on("resize-tile", this.resizeTile);
      eventHub.$on("end-resize-tile", this.endResizeTile);
    }

    eventHub.$on("full-screen-tile", this.fullScreenTile);
    eventHub.$on("exit-full-screen-tile", this.exitFullScreenTile);

    eventHub.$on("resize-tile-panel-container", this.resizeTilePanelContainer);

    this.handleResize = _.debounce(function() {
      vm.windowResizedDuringFullScreen = !!vm.fullScreenTileId;
      vm.resizeTiles();
    }, 500);

    window.addEventListener('resize', this.handleResize);
  },
  mounted: function() {
    this.size = {
      width: this.$el.clientWidth - this.padding * 2,
      height: this.$el.clientHeight - this.padding * 2
    };
    this.tileCellSize.height = this.size.height / 12;
    var bNeedScrollBar = this.checkIfNeedScrollBar();
    if (bNeedScrollBar) {
      this.size.width = this.$el.clientWidth - this.padding * 2 - this.scrollbarWidth;
    }

    this.updateMode();

    this.tileCellSize.width = this.size.width / 12;
    this.tileCellSize.height = this.size.height / 12;

    this.handleTiles();
  },
  methods: {
    fullScreenTile: function(args) {
      var vm = this;
      if (args.panelId == this.id) {
        this.cachedScrollTop = this.$el.scrollTop;
        this.fullScreenTileId = args.id;
        this.pTiles.every(function(pt) {
          if (pt.id == vm.fullScreenTileId) {
            vm.toFullScreenTile = $.extend(true, {}, pt);
            pt.transformConfig = { xs: { x: 0, y: 0 } };
            pt.widthConfig = { xs: 12 };
            pt.heightConfig = { xs: 12 };
            return false;
          }
          return true;
        });
      }
    },
    exitFullScreenTile: function(args) {
      if (args.panelId == this.id) {
        var vm = this;
        if (!vm.windowResizedDuringFullScreen) {
          this.pTiles.every(function(pt) {
            if (pt.id == vm.fullScreenTileId && vm.toFullScreenTile) {
              pt.transformConfig = vm.toFullScreenTile.transformConfig;
              pt.widthConfig = vm.toFullScreenTile.widthConfig;
              pt.heightConfig = vm.toFullScreenTile.heightConfig;
              vm.fnResizePTile(pt, true);
              return false;
            }
            return true;
          });
        } else {
          this.pTiles.forEach(function(pt) {
            if (pt.id == vm.fullScreenTileId && vm.toFullScreenTile) {
              pt.transformConfig = vm.toFullScreenTile.transformConfig;
              pt.widthConfig = vm.toFullScreenTile.widthConfig;
              pt.heightConfig = vm.toFullScreenTile.heightConfig;
              vm.fnResizePTile(pt, true);
            } else {
              setTimeout(function() {
                vm.fnResizePTile(pt);
              }, 0);
            }
          });
        }
        this.fullScreenTileId = null;
        this.toFullScreenTile = null;
        setTimeout(function() {
          vm.$el.scrollTop = vm.cachedScrollTop;
        }, 500);
      }
    },
    tilesChanged: function() {
      var bNeedScrollBar = this.checkIfNeedScrollBar();
      if (bNeedScrollBar) {
        this.size.width = this.$el.offsetWidth - this.padding * 2 - this.scrollbarWidth;
      } else {
        this.size.width = this.$el.offsetWidth - this.padding * 2;
      }
      this.updateMode();

      this.tileCellSize.width = this.size.width / 12;

      this.handleTiles();
    },
    checkIfNeedScrollBar: function() {
      var bNeedScrollBar = false,
        that = this;
      if (this.$props.tiles) {
        this.$props.tiles.every(function(t) {
          var transform = that.caculateTransform(t.transformConfig);
          var height = that.caculateHeight(t.heightConfig);
          if (Math.floor(transform.y + height) > that.size.height) {
            bNeedScrollBar = true;
            return false;
          }
          return true;
        });
      }
      return bNeedScrollBar;
    },
    handleTiles: function() {
      if (this.$props.tiles) {
        let thePTiles = [];
        for (var i = 0; i < this.$props.tiles.length; i++) {
          var t = Object.assign({}, this.$props.tiles[i]);
          t.conf = {
            id: t.id,
            title: t.title,
            cellSizeWidth: this.tileCellSize.width,
            cellSizeHeight: this.tileCellSize.height,
            width: this.caculateWidth(t.widthConfig),
            height: this.caculateHeight(t.heightConfig),
            transform: this.caculateTransform(t.transformConfig),
            fixed: this.isFixed,
            hideHeader: t.hideHeader,
            allowScroll: t.allowScroll,
            customActions: CommonUtils.deepClone(t.customActions),
            disableRefresh: t.disableRefresh,
            disableFullScreen: t.disableFullScreen
          };
          thePTiles.push(t);
        }
        this.pTiles = thePTiles;
      }
    },
    updateMode: function() {
      if (this.size.width < 768) {
        this.mode.x = 'xs';
      } else if (this.size.width < 992) {
        this.mode.x = 'sm';
      } else if (this.size.width < 1170) {
        this.mode.x = 'md';
      } else {
        this.mode.x = 'lg';
      }

      this.mode.y = this.mode.x;
      // if (this.size.height < 768) {
      //   this.mode.y = 'xs';
      // } else if (this.size.height < 992) {
      //   this.mode.y = 'sm';
      // } else if (this.size.height < 1170) {
      //   this.mode.y = 'md';
      // } else {
      //   this.mode.y = 'lg';
      // }
    },
    handleConfigByPriority: function(conf, isTransfrom) {
      // priority: lg -> md -> sm -> xs
      var defaultWidthHeightConfig = 12,
        defaultTransformConfig = {
          x: 0,
          y: 0
        };
      if (!conf['xs']) {
        conf['xs'] = isTransfrom ? defaultTransformConfig : defaultWidthHeightConfig;
      }
      if (!conf['sm']) {
        conf['sm'] = conf['xs'];
      }
      if (!conf['md']) {
        conf['md'] = conf['sm'];
      }
      if (!conf['lg']) {
        conf['lg'] = conf['md'];
      }
    },
    caculateWidth: function(widthConfig) {
      var conf = Object.assign({}, widthConfig);
      this.handleConfigByPriority(conf, false);
      return this.tileCellSize.width * conf[this.mode.x];
    },
    caculateHeight: function(heightConfig) {
      var conf = Object.assign({}, heightConfig);
      this.handleConfigByPriority(conf, false);
      return this.tileCellSize.height * conf[this.mode.y];
    },
    caculateTransform: function(transConfig) {
      var transform = {
        x: 0,
        y: 0
      };
      var conf = Object.assign({}, transConfig);
      this.handleConfigByPriority(conf, true);
      transform.x = this.tileCellSize.width * conf[this.mode.x].x;
      transform.y = this.tileCellSize.height * conf[this.mode.y].y;
      return transform;
    },
    resizeTilePanelContainer: function(args) {
      if (args.id == this.id) {
        this.resizeTiles();
      }
    },
    fnResizePTile: function(pt, noNeedToEmitResized) {
      var vm = this;
      pt.width = vm.caculateWidth(pt.widthConfig);
      pt.height = vm.caculateHeight(pt.heightConfig);
      pt.transform = vm.caculateTransform(pt.transformConfig);
      if (!noNeedToEmitResized) {
        eventHub.$emit("window-resized", {
          id: pt.id,
          cellSizeWidth: vm.tileCellSize.width,
          cellSizeHeight: vm.tileCellSize.height,
          width: pt.width,
          height: pt.height,
          transform: pt.transform
        });
      }
    },
    resizeTiles: function() {
      var vm = this;
      if (vm.size) {
        if (!vm.checkIfNeedScrollBar()) {
          vm.size.width = vm.$el.offsetWidth - this.padding * 2;
        } else {
          vm.size.width = vm.$el.offsetWidth - vm.scrollbarWidth - this.padding * 2;
        }
        vm.size.height = vm.$el.offsetHeight - this.padding * 2;
      }
      vm.updateMode();
      vm.tileCellSize.width = vm.size.width / 12;
      vm.tileCellSize.height = vm.size.height / 12;
      for (var i = 0; i < vm.pTiles.length; i++) {
        var pt = vm.pTiles[i];
        vm.fnResizePTile(pt);
      }
    },
    startResizeTile: function(args) {
      if (args.panelId == this.id) {
        this.currentTileId = args.id;
      }
    },
    resizeTile: function(args) {
      if (args.id == this.currentTileId && args.panelId == this.id) {
        var vm = this;
        if (!this.bgBlock) {
          this.bgBlock = document.createElement("div");
          this.bgBlock.className = "bg-block";
          this.$el.appendChild(this.bgBlock);
          this.bgBlock.style.transform = "translate(" + args.trans.x + "px," + args.trans.y + "px)";
        }

        this.bgBlock.style.display = 'block';

        var limitSize = function(axis) {
          var cell = axis == 'x' ? vm.tileCellSize.width : vm.tileCellSize.height;
          var value = axis == 'x' ? args.size.width : args.size.height;
          var max = axis == 'x' ? vm.size.width : vm.size.height;
          if (value + args.trans[axis] > max && axis != 'y') {
            return max - args.trans[axis];
          }
          var r = value % cell;
          var d = value / cell;
          var result = value;
          if (r > 5) {
            result = Math.ceil(d) * cell;
          }
          return result;
        };
        this.bgSize.width = limitSize('x');
        this.bgSize.height = limitSize('y');
        this.bgBlock.style.width = this.bgSize.width + "px";
        this.bgBlock.style.height = this.bgSize.height + "px";
      }
    },
    endResizeTile: function(args) {
      if (args.id == this.currentTileId && args.panelId == this.id) {
        eventHub.$emit("adjust-tile-size", {
          id: this.currentTileId,
          size: {
            width: this.bgSize.width,
            height: this.bgSize.height
          }
        });

        if (this.bgBlock) {
          if (this.bgBlock.style.display == 'block') {
            this.bgBlock.style.display = 'none';
          }
        }
        this.currentTileId = null;
      }
    },
    startDragTile: function(args) {
      if (args.panelId == this.id) {
        this.currentTileId = args.id;
      }
    },
    dragTile: function(args) {
      if (args.id == this.currentTileId && args.panelId == this.id) {
        var vm = this;
        if (!this.bgBlock) {
          this.bgBlock = document.createElement("div");
          this.bgBlock.className = "bg-block";
          this.$el.appendChild(this.bgBlock);
        }

        this.bgBlock.style.display = 'block';
        this.bgBlock.style.width = args.size.width + "px";
        this.bgBlock.style.height = args.size.height + "px";

        var limitTrans = function(axis) {
          var cell = axis == 'x' ? vm.tileCellSize.width : vm.tileCellSize.height;
          var max = axis == 'x' ? vm.size.width : vm.size.height;
          var widthOrHeight = axis == 'x' ? args.size.width : args.size.height;
          var result = args.trans[axis];
          if (widthOrHeight + result > max && axis != 'y') {
            return max - widthOrHeight;
          }
          var r = result % cell;
          var d = result / cell;
          if (r < cell / 2) {
            result = Math.floor(d) * cell;
          } else if (r > cell / 2) {
            result = Math.ceil(d) * cell;
          }
          return result;
        };

        var limitedTrans = {
          x: limitTrans('x'),
          y: limitTrans('y')
        };
        limitedTrans.x = limitedTrans.x < 0 ? 0 : limitedTrans.x;
        limitedTrans.y = limitedTrans.y < 0 ? 0 : limitedTrans.y;

        this.bgTrans.x = limitedTrans.x;
        this.bgTrans.y = limitedTrans.y;

        this.bgBlock.style.transform = "translate(" + limitedTrans.x + "px," + limitedTrans.y + "px)";
      }
    },
    endDragTile: function(args) {
      if (args.id == this.currentTileId && args.panelId == this.id) {
        if (!args.skipAdjust) {
          eventHub.$emit("adjust-tile-transform", {
            id: this.currentTileId,
            trans: {
              x: this.bgTrans.x,
              y: this.bgTrans.y
            }
          });
        }

        if (this.bgBlock) {
          if (this.bgBlock.style.display == 'block') {
            this.bgBlock.style.display = 'none';
          }
        }
        this.currentTileId = null;
      }
    }
  },
  beforeDestroy: function() {
    this.bgBlock = null;
    this.currentTileId = null;

    if (!this.isFixed) {
      eventHub.$off("start-drag-tile", this.startDragTile);
      eventHub.$off("drag-tile", this.dragTile);
      eventHub.$off("end-drag-tile", this.endDragTile);
      eventHub.$off("start-resize-tile", this.startResizeTile);
      eventHub.$off("resize-tile", this.resizeTile);
      eventHub.$off("end-resize-tile", this.endResizeTile);
    }

    eventHub.$off("full-screen-tile", this.fullScreenTile);
    eventHub.$off("exit-full-screen-tile", this.exitFullScreenTile);

    window.removeEventListener('resize', this.handleResize);
  }
}
