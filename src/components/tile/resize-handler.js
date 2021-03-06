import shared from "../../shared.js"

var eventHub = shared.eventHub;
export default {
  name: 'resize-handler',
  props: ['tileId'],
  data() {
    return {
      isHold: false
    };
  },
  methods: {
    

  },
  mounted: function() {
    var vm = this,
      startPos = {},
      moveLock = false;

    function onTouchStart(e) {
      startPos.x = e.clientX;
      startPos.y = e.clientY;
      vm.isHold = true;
      eventHub.$emit("start-resize", {
        id: vm.tileId
      });
      e.stopPropagation();
    }

    function onTouchMove(e) {
      if (vm.isHold && !moveLock) {
        moveLock = true;
        var trans = {
          x: e.clientX - startPos.x,
          y: e.clientY - startPos.y
        };

        eventHub.$emit("resize", {
          id: vm.tileId,
          trans: trans
        });

        moveLock = false;
        e.stopPropagation();
      }
      
    }

    function onTouchEnd(e) {
      if (vm.isHold) {
        vm.isHold = false;
        moveLock = false;

        eventHub.$emit("end-resize", {
          id: vm.tileId
        });
        e.stopPropagation();
      }
    }

    this.$el.addEventListener('mousedown', onTouchStart);
    this.$el.addEventListener('mousemove', onTouchMove);
    this.$parent.$parent.$el.addEventListener('mouseup', onTouchEnd);
    this.$parent.$parent.$el.addEventListener('mouseout', onTouchEnd);
  }
}
